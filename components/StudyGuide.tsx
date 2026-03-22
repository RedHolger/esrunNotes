import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, MessageCircle, GraduationCap, BookMarked, Brain, Zap } from 'lucide-react';

export default function StudyGuide({
  guide,
}: {
  guide: {
    questions?: { question: string; answer: string }[];
    keyTerms?: { term: string; definition: string }[];
    mnemonics?: string[];
    criticalThinkingQuestions?: string[];
  };
}) {
  if (!guide || (!guide.questions && !guide.keyTerms && !guide.mnemonics && !guide.criticalThinkingQuestions)) {
    return (
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Study Guide
          </h3>
        </div>
        <p className="text-sm text-slate-500">No study guide could be extracted or the data was malformed.</p>
      </div>
    );
  }

  const questions = Array.isArray(guide.questions) ? guide.questions : [];
  const keyTerms = Array.isArray(guide.keyTerms) ? guide.keyTerms : [];
  const mnemonics = Array.isArray(guide.mnemonics) ? guide.mnemonics : [];
  const criticalThinkingQuestions = Array.isArray(guide.criticalThinkingQuestions)
    ? guide.criticalThinkingQuestions
    : [];

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20">
      {/* Decorative gradient overlays */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary-500/10 to-primary-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Study Guide Overview
            </h3>
            <p className="text-sm text-slate-500 mt-1">Comprehensive study materials and practice questions</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* NCLEX-Style Practice Questions */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-primary-100 rounded-lg">
                <BookMarked className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">NCLEX-Style Practice Questions</h4>
                <p className="text-sm text-slate-500">Test your understanding with exam-style questions</p>
              </div>
            </div>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-5 border border-white/30 hover:border-primary-300/50 transition-all duration-300"
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="font-semibold text-slate-800 flex-1">{q.question}</p>
                    </div>
                    {q.answer && (
                      <div className="mt-4 ml-11">
                        <details className="group/details">
                          <summary className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors list-none flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Show Answer
                          </summary>
                          <div className="mt-3 p-4 rounded-lg bg-gradient-to-br from-primary-50/50 to-blue-50/50 border border-primary-100/50">
                            <div className="text-sm text-slate-700 prose prose-slate max-w-none prose-p:my-1 prose-ul:my-1">
                              <ReactMarkdown>{q.answer}</ReactMarkdown>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Terms & Definitions */}
        {keyTerms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-secondary-100 rounded-lg">
                <BookMarked className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Key Terms & Definitions</h4>
                <p className="text-sm text-slate-500">Essential vocabulary to master</p>
              </div>
            </div>
            <div className="grid gap-3">
              {keyTerms.map((term, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-4 border border-white/30 hover:border-secondary-300/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <p className="font-bold text-slate-800 text-base">{term.term}</p>
                    <div className="mt-2 text-sm text-slate-600 prose prose-slate max-w-none prose-p:my-1">
                      <ReactMarkdown>{term.definition}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Aids & Mnemonics */}
        {mnemonics.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Memory Aids & Mnemonics</h4>
                <p className="text-sm text-slate-500">Remember key concepts with these helpful tips</p>
              </div>
            </div>
            <div className="grid gap-3">
              {mnemonics.map((mnemonic, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 backdrop-blur-sm p-4 border border-amber-200/30 hover:border-amber-300/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-slate-700 prose prose-slate max-w-none prose-p:my-1 flex-1">
                      <ReactMarkdown>{mnemonic}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Thinking Questions */}
        {criticalThinkingQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Critical Thinking Questions</h4>
                <p className="text-sm text-slate-500">Deepen your understanding with these reflective questions</p>
              </div>
            </div>
            <div className="grid gap-3">
              {criticalThinkingQuestions.map((question, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/40 backdrop-blur-sm p-4 border border-blue-200/30 hover:border-blue-300/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-slate-700 prose prose-slate max-w-none prose-p:my-1 flex-1">
                      <ReactMarkdown>{question}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
