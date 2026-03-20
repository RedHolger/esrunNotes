import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth0';
import { db, initDb } from '../../../lib/db';

type Subject = {
  id: string;
  name: string;
};

export async function GET() {
  await initDb();
  const p = db();
  const res = await p.query('SELECT id,name FROM subjects ORDER BY name ASC');
  return NextResponse.json(res.rows);
}

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: res.headers });
  const { name } = await req.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  await initDb();
  const p = db();
  const ur = await p.query('SELECT role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  const role = ur.rowCount ? (ur.rows[0].role as string) : 'student';
  if (role !== 'teacher' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: res.headers });
  const exists = await p.query('SELECT 1 FROM subjects WHERE lower(name)=lower($1)', [name]);
  if (exists.rowCount) return NextResponse.json({ error: 'Already exists' }, { status: 409 });
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await p.query('INSERT INTO subjects(id,name) VALUES($1,$2)', [id, name]);
  return NextResponse.json({ id, name }, { status: 201, headers: res.headers });
}
