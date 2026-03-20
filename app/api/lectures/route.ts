import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getSession } from '../../../lib/auth0';
import { db, initDb } from '../../../lib/db';

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

export async function GET() {
  await initDb();
  const p = db();
  const res = await p.query(
    `SELECT l.id, l.title, s.name AS subject, l.created_at AS "createdAt"
     FROM lectures l
     LEFT JOIN subjects s ON s.id = l.subject_id
     ORDER BY l.created_at ASC`
  );
  return NextResponse.json(res.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subject, transcript, analysis } = body as {
    title?: string;
    subject?: string;
    transcript: string;
    analysis: any;
  };

  if (!transcript || !analysis) {
    return NextResponse.json(
      { error: 'Missing transcript or analysis' },
      { status: 400 }
    );
  }

  await initDb();
  const p = db();
  const res = new NextResponse();
  const session = await getSession(req, res);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: res.headers });
  const ur = await p.query('SELECT id,role FROM users WHERE lower(email)=lower($1) LIMIT 1', [session.user.email]);
  let userId: string | null = null;
  let role: string = 'student';
  if (ur.rowCount) {
    userId = ur.rows[0].id;
    role = ur.rows[0].role;
  } else {
    userId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await p.query('INSERT INTO users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)', [
      userId,
      session.user.name || session.user.nickname || 'User',
      session.user.email,
      '',
      'student',
    ]);
  }


  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const createdAt = new Date().toISOString();
  let subjectId: string | null = null;
  const subjName = subject || 'General';
  const sres = await p.query('SELECT id FROM subjects WHERE lower(name)=lower($1)', [subjName]);
  if (sres.rowCount) {
    subjectId = sres.rows[0].id;
  } else {
    const newId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await p.query('INSERT INTO subjects(id,name) VALUES($1,$2)', [newId, subjName]);
    subjectId = newId;
  }
  await p.query(
    'INSERT INTO lectures(id,title,subject_id,created_at,transcript,analysis,uploaded_by) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [id, title || 'Untitled lecture', subjectId, createdAt, transcript, JSON.stringify(analysis), userId]
  );
  return NextResponse.json(
    { id, title: title || 'Untitled lecture', subject: subjName, createdAt },
    { status: 201, headers: res.headers }
  );
}
