import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '../../../../../lib/db';

type Lecture = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  transcript: string;
  analysis: any;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await initDb();
  const p = db();
  const r = await p.query(
    `SELECT l.id, l.title, s.name AS subject, l.created_at AS "createdAt",
            l.transcript, l.analysis
     FROM lectures l
     LEFT JOIN subjects s ON s.id = l.subject_id
     WHERE l.id=$1 LIMIT 1`,
    [params.id]
  );
  const lecture = r.rows[0];
  if (!lecture) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const lines: string[] = [];
  lines.push(`Title: ${lecture.title}`);
  lines.push(`Subject: ${lecture.subject}`);
  lines.push(`Created: ${lecture.createdAt}`);
  lines.push('');
  lines.push('Summary:');
  lines.push(`${lecture.analysis?.summary ?? ''}`);
  lines.push('');
  lines.push('Clinical Concepts:');
  for (const c of lecture.analysis?.clinicalConcepts ?? []) {
    lines.push(`- ${c.name}: ${c.definition}`);
  }
  lines.push('');
  lines.push('Study Guide – Questions:');
  for (const q of lecture.analysis?.studyGuide?.questions ?? []) {
    lines.push(`Q: ${q.question}`);
    lines.push(`A: ${q.answer}`);
    lines.push('');
  }
  lines.push('Study Guide – Key Terms:');
  for (const t of lecture.analysis?.studyGuide?.keyTerms ?? []) {
    lines.push(`- ${t.term}: ${t.definition}`);
  }
  lines.push('');
  lines.push('Transcript:');
  lines.push(lecture.transcript);

  const text = lines.join('\n');
  const headers = new Headers();
  headers.set('Content-Type', 'text/plain; charset=utf-8');
  headers.set(
    'Content-Disposition',
    `attachment; filename="lecture-${lecture.id}.txt"`
  );
  return new NextResponse(text, { status: 200, headers });
}
