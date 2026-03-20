'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Lecture = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
};

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/lectures');
        if (!res.ok) return;
        const data = (await res.json()) as Lecture[];
        setLectures(data.slice().reverse());
      } catch {
        // ignore
      }
      try {
        const s = await fetch('/api/subjects');
        if (s.ok) {
          const sd = await s.json();
          setSubjects(sd);
        }
      } catch {}
    }
    load();
  }, []);

  const subjectOptions = useMemo(() => {
    const names = subjects.length
      ? subjects.map((s) => s.name)
      : Array.from(new Set(lectures.map((l) => l.subject)));
    return Array.from(new Set(names)).sort();
  }, [subjects, lectures]);

  const filtered = useMemo(
    () =>
      lectures.filter((l) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          q.length === 0 || l.title.toLowerCase().includes(q);
        const matchesSubject =
          subjectFilter === 'all' || l.subject === subjectFilter;
        return matchesQuery && matchesSubject;
      }),
    [lectures, query, subjectFilter]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lecture?')) return;
    try {
      await fetch(`/api/lectures/${id}`, { method: 'DELETE' });
      setLectures((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // ignore error for now
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="rounded-2xl bg-white px-8 py-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Lectures</h1>
        <p className="mt-2 text-base text-slate-500">
          Your previously analyzed lectures and study materials.
        </p>
      </header>

      {lectures.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-500">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <p className="text-base font-medium text-slate-900">No lectures saved yet</p>
          <p className="mt-1 text-sm text-slate-500">Upload and analyze a lecture from the Dashboard to see it appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <input
              type="text"
              placeholder="Search by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors bg-white"
            >
              <option value="all">All Subjects</option>
              {subjectOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((lecture) => (
                <tr key={lecture.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {lecture.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {lecture.subject}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(lecture.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <Link
                      href={`/lectures/${lecture.id}`}
                      className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleDelete(lecture.id)}
                      className="inline-flex items-center rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
