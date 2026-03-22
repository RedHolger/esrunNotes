'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Filter, Calendar, Folder, Trash2, ExternalLink, Sparkles } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Modern gradient header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-10" />

        <div className="p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                My Lectures
              </h1>
            </div>
          </div>
          <p className="text-slate-600 ml-16">
            Your previously analyzed lectures and study materials.
          </p>
        </div>
      </div>

      {lectures.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20 p-16 text-center">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-slate-500/5 to-slate-400/5 rounded-full blur-3xl -z-10" />

          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-2">No lectures saved yet</p>
          <p className="text-sm text-slate-500">Upload and analyze a lecture from the Dashboard to see it appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-lg border border-white/20 p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Subject Filter */}
              <div className="relative sm:w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="all">All Subjects</option>
                  {subjectOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="w-4 h-4" />
              <span>
                {filtered.length} {filtered.length === 1 ? 'lecture' : 'lectures'} found
              </span>
            </div>
          </div>

          {/* Lectures Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lecture) => (
              <div
                key={lecture.id}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-5 border border-white/30 hover:border-primary-300/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  {/* Subject badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg">
                      <Folder className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-xs font-semibold text-primary-600 px-2 py-1 bg-primary-50 rounded-lg">
                      {lecture.subject}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 mb-3 line-clamp-2 min-h-[3rem]">
                    {lecture.title}
                  </h3>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/lectures/${lecture.id}`}
                      className="flex-1 group/btn relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative z-10">Open</span>
                      <ExternalLink className="w-3.5 h-3.5 relative z-10" />
                    </Link>

                    <button
                      onClick={() => handleDelete(lecture.id)}
                      className="p-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 rounded-lg transition-all duration-300"
                      title="Delete lecture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
