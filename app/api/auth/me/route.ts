import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth0';
import { db, initDb } from '../../../../lib/db';

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
};

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: res.headers });
  await initDb();
  const p = db();
  const q = await p.query<User>(
    'SELECT id,name,email,role FROM users WHERE lower(email)=lower($1) LIMIT 1',
    [session.user.email]
  );
  let user = q.rows[0];
  if (!user) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const name = session.user.name || session.user.nickname || 'User';
    const role: User['role'] = 'student';
    await p.query('INSERT INTO users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)', [
      id,
      name,
      session.user.email,
      '',
      role,
    ]);
    user = { id, name, email: session.user.email, role } as User;
  }
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { headers: res.headers });
}
