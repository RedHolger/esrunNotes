'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type LectureMeta = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
};

export default function ActivityPage() {
  const [lectures, setLectures] = useState<LectureMeta[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/lectures');
        if (!res.ok) return;
        const data = (await res.json()) as LectureMeta[];
        const sorted = data
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setLectures(sorted);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Activity</h1>
        <p className="mt-1 text-sm text-slate-500">
          Recent lecture analyses in this NurseNotes workspace.
        </p>
      </header>

      {lectures.length === 0 ? (
        <div className="rounded-xl bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
          No activity yet. Upload and analyze a lecture from the Dashboard.
        </div>
      ) : (
        <ul className="space-y-3">
          {lectures.map((lecture) => (
            <li
              key={lecture.id}
              className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {lecture.title}
                </p>
                <p className="text-xs text-slate-500">
                  {lecture.subject} ·{' '}
                  {new Date(lecture.createdAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/lectures/${lecture.id}`}
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

