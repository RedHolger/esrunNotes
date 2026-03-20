import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, signToken, setSessionCookie } from '../../../../lib/auth';
import { db, initDb } from '../../../../lib/db';

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
};

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await initDb();
  const p = db();
  const exists = await p.query('SELECT 1 FROM users WHERE lower(email)=lower($1) LIMIT 1', [email]);
  if (exists.rowCount) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const count = await p.query('SELECT count(*)::int AS c FROM users');
  const role: User['role'] = Number(count.rows[0].c) === 0 ? 'admin' : 'student';
  const passwordHash = hashPassword(password);
  await p.query(
    'INSERT INTO users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)',
    [id, name, email, passwordHash, role]
  );

  const headers = new Headers();
  const token = signToken({ userId: id, role, iat: Date.now() });
  setSessionCookie(headers, token);

  return new NextResponse(JSON.stringify({ id, name, email, role }), { status: 201, headers });
}
