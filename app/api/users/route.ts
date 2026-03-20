import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth0';
import { db, initDb } from '../../../lib/db';

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
};

export async function GET(req: NextRequest) {
  const headerRes = new NextResponse();
  const session = await getSession(req, headerRes);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headerRes.headers });
  await initDb();
  const p = db();
  const ur = await p.query('SELECT role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  const role = ur.rowCount ? (ur.rows[0].role as string) : 'student';
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: headerRes.headers });
  const q = await p.query('SELECT id,name,email,role FROM users ORDER BY name ASC');
  return NextResponse.json(q.rows, { headers: headerRes.headers });
}
