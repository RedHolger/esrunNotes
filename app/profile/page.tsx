'use client';

import { useEffect, useMemo, useState } from 'react';

type LectureMeta = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
};

export default function ProfilePage() {
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
  const subjects = useMemo(
    () => Array.from(new Set(lectures.map((l) => l.subject))).sort(),
    [lectures]
  );

  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your NurseNotes activity on this installation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total lectures analyzed
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalLectures}
          </p>
        </div>
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subjects covered
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {subjects.length}
          </p>
        </div>
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            First analysis date
          </p>
          <p className="mt-2 text-sm text-slate-900">
            {lectures.length > 0
              ? new Date(lectures[0].createdAt).toLocaleString()
              : 'Not yet'}
          </p>
        </div>
      </div>

      <section className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Subjects you have studied
        </h2>
        {subjects.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No subjects yet. Analyze a lecture to see them here.
          </p>
        ) : (
          <ul className="mt-2 list-disc list-inside text-sm text-slate-700">
            {subjects.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

