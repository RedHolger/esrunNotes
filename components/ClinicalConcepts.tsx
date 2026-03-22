import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Stethoscope, Tag } from 'lucide-react';

export default function ClinicalConcepts({ concepts }: { concepts: { name: string, definition: string }[] }) {
  if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
    return (
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Clinical Concepts
          </h3>
        </div>
        <p className="text-sm text-slate-500">No clinical concepts could be extracted or the data was malformed.</p>
      </div>
    );
  }

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Clinical Concepts
            </h3>
            <p className="text-sm text-slate-500 mt-1">Key medical terminology and definitions</p>
          </div>
        </div>
      </div>

      {/* Concepts Grid */}
      <div className="p-6">
        <div className="grid gap-4">
          {concepts.map((concept, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-5 border border-white/30 hover:border-primary-300/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Concept name with tag icon */}
                <div className="flex items-start gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mt-0.5">
                    <Tag className="w-4 h-4 text-primary-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg flex-1 leading-tight">
                    {concept.name}
                  </h4>
                </div>

                {/* Definition */}
                <div className="ml-10 text-sm text-slate-600 prose prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{concept.definition}</ReactMarkdown>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
