import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getSession } from '../../../../lib/auth0';
import { db, initDb } from '../../../../lib/db';

type Lecture = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  transcript: string;
  analysis: any;
  uploadedBy?: string | null;
};

const DB_PATH = join(process.cwd(), 'data', 'lectures.json');

async function readLectures(): Promise<Lecture[]> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw) as Lecture[];
  } catch {
    return [];
  }
}

async function writeLectures(lectures: Lecture[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(lectures, null, 2), 'utf8');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await initDb();
  const p = db();
  const res = await p.query(
    `SELECT l.id, l.title, s.name AS subject, l.created_at AS "createdAt",
            l.transcript, l.analysis, l.uploaded_by AS "uploadedBy"
     FROM lectures l
     LEFT JOIN subjects s ON s.id = l.subject_id
     WHERE l.id=$1
     LIMIT 1`,
    [params.id]
  );
  const lecture = res.rows[0];
  if (!lecture) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    id: lecture.id,
    title: lecture.title,
    subject: lecture.subject,
    createdAt: lecture.createdAt,
    transcript: lecture.transcript,
    analysis: lecture.analysis,
    uploadedBy: lecture.uploadedBy,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: res.headers });
  await initDb();
  const p = db();
  const ur = await p.query('SELECT id,role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  if (ur.rowCount === 0) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: res.headers });
  const userId = ur.rows[0].id as string;
  const role = ur.rows[0].role as string;
  const r = await p.query('SELECT uploaded_by FROM lectures WHERE id=$1', [params.id]);
  if (r.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const owner = r.rows[0].uploaded_by;
  if (role !== 'admin' && owner !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: res.headers });
  }
  await p.query('DELETE FROM lectures WHERE id=$1', [params.id]);
  return NextResponse.json({ success: true }, { headers: res.headers });
}
