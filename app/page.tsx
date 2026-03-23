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
    <div className="space-y-6 lg:space-y-10 max-w-7xl mx-auto">
      {/* Hero Section with Gradient */}
      <header className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 px-4 lg:px-8 py-8 lg:py-12 shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>

        {/* Glow Effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 lg:w-96 lg:h-96 bg-accent-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 lg:w-96 lg:h-96 bg-secondary-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-3 lg:mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-accent-200 to-accent-400 bg-clip-text text-transparent animate-gradient">
              NurseNotes
            </span>
          </h1>
          <p className="text-sm lg:text-lg xl:text-xl text-primary-50 max-w-2xl lg:max-w-3xl leading-relaxed">
            Transform your lectures into actionable insights. Upload audio, video, or text to generate
            <span className="font-semibold text-white"> AI-powered summaries</span>,
            <span className="font-semibold text-white"> clinical concepts</span>, and
            <span className="font-semibold text-white"> study guides</span> in seconds.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 lg:gap-3 mt-4 lg:mt-6">
            <div className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs lg:text-sm font-medium">
              🎙️ Audio & Video Support
            </div>
            <div className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs lg:text-sm font-medium">
              🤖 AI-Powered Analysis
            </div>
            <div className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs lg:text-sm font-medium">
              📚 Instant Study Guides
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section with Glassmorphism */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6 md:grid-cols-3">
        <SummaryCard
          title="Lectures Analyzed"
          value={totalLectures.toString()}
          icon={<span>📚</span>}
          gradient="from-primary-500 to-primary-600"
        />
        <SummaryCard
          title="Subjects Covered"
          value={uniqueSubjects.toString()}
          icon={<span>🩺</span>}
          gradient="from-secondary-500 to-secondary-600"
        />
        <SummaryCard
          title="Latest Lecture"
          value={lastLectureTitle}
          icon={<span>📝</span>}
          gradient="from-accent-500 to-accent-600"
        />
      </div>

      {/* Upload Section */}
      <FileUpload setAnalysis={setAnalysis} />

      {/* Results Section */}
      {analysis && <TranscriptionPage analysis={analysis} />}
    </div>
  );
}
