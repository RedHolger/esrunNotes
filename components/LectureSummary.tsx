import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LectureSummary({ summary }: { summary: string }) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-10" />

      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Lecture Summary
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </h3>
            <p className="text-sm text-white/80 mt-1">AI-generated comprehensive overview</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500" />
    </div>
  );
}
