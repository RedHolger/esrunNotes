import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth0';
import { db, initDb } from '../../../../lib/db';

type Subject = {
  id: string;
  name: string;
};

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: res.headers });
  await initDb();
  const p = db();
  const ur = await p.query('SELECT role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  const role = ur.rowCount ? (ur.rows[0].role as string) : 'student';
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: res.headers });
  await p.query('DELETE FROM subjects WHERE id=$1', [params.id]);
  return NextResponse.json({ success: true }, { headers: res.headers });
}
