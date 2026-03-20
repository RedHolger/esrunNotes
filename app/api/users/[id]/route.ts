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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: res.headers });
  const { role } = await req.json();
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  await initDb();
  const p = db();
  const ur = await p.query('SELECT role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  const adminRole = ur.rowCount ? (ur.rows[0].role as string) : 'student';
  if (adminRole !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: res.headers });
  const r = await p.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role', [
    role,
    params.id,
  ]);
  if (r.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });
  return NextResponse.json(r.rows[0], { headers: res.headers });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: res.headers });
  await initDb();
  const p = db();
  const ur = await p.query('SELECT role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  const adminRole = ur.rowCount ? (ur.rows[0].role as string) : 'student';
  if (adminRole !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: res.headers });
  await p.query('DELETE FROM users WHERE id=$1', [params.id]);
  return NextResponse.json({ success: true }, { headers: res.headers });
}
