'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TranscriptionPage from '../../transcription/page';
import { ArrowLeft, Download, BookOpen, Calendar, Folder } from 'lucide-react';

type Lecture = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  transcript: string;
  analysis: any;
};

export default function LectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lecture, setLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    async function load() {
      try {
        const res = await fetch(`/api/lectures/${params.id}`);
        if (!res.ok) return;
        const data = (await res.json()) as Lecture;
        setLecture(data);
      } catch {
        // ignore
      }
    }
    load();
  }, [params?.id]);

  if (!lecture) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20 px-6 py-8">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              Lecture not found in this browser. It may have been cleared from storage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-10" />

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Lecture info */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200/50 rounded-full mb-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-wide bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Saved Lecture
                </p>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {lecture.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-100 rounded-lg">
                    <Folder className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-medium">{lecture.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-secondary-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-secondary-600" />
                  </div>
                  <span>{new Date(lecture.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`/api/lectures/${lecture.id}/download`}
                className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Download</span>
              </a>

              <button
                onClick={() => router.push('/lectures')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 hover:bg-white hover:border-primary-300 font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>All Lectures</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription content */}
      <TranscriptionPage analysis={lecture.analysis} />
    </div>
  );
}
