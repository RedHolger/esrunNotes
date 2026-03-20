'use client';

import { useEffect, useMemo, useState } from 'react';
import FileUpload from '../components/FileUpload';
import TranscriptionPage from './transcription/page';
import SummaryCard from '../components/SummaryCard';

type LectureMeta = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
};

export default function Page() {
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [lectures, setLectures] = useState<LectureMeta[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/lectures');
        if (!res.ok) return;
        const data = (await res.json()) as LectureMeta[];
        setLectures(data);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const totalLectures = lectures.length;
  const uniqueSubjects = useMemo(
    () => new Set(lectures.map((l) => l.subject)).size,
    [lectures]
  );
  const lastLectureTitle =
    lectures.length > 0 ? lectures[lectures.length - 1].title : 'None yet';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="rounded-2xl bg-white px-8 py-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-2 text-base text-slate-500">
          Upload a lecture to generate comprehensive summaries, clinical concepts, and study guides.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard
          title="Lectures Analyzed"
          value={totalLectures.toString()}
          icon={<span>📚</span>}
        />
        <SummaryCard
          title="Subjects Covered"
          value={uniqueSubjects.toString()}
          icon={<span>🩺</span>}
        />
        <SummaryCard
          title="Latest Lecture"
          value={lastLectureTitle}
          icon={<span>📝</span>}
        />
      </div>

      <FileUpload setAnalysis={setAnalysis} />
      {analysis && <TranscriptionPage analysis={analysis} />}
    </div>
  );
}
