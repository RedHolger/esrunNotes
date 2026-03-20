import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, MessageCircle } from 'lucide-react';

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
      <div className="bg-white shadow rounded-lg p-4 mt-4">
        <h3 className="text-lg font-medium text-gray-900">Study Guide</h3>
        <p className="mt-2 text-sm text-gray-500">No study guide could be extracted or the data was malformed.</p>
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
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium text-gray-900">Study Guide Overview</h3>
      <div className="mt-4 space-y-6">
        {/* NCLEX-Style Practice Questions */}
        {questions.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-slate-800">NCLEX-Style Practice Questions</h4>
            <p className="text-sm text-slate-500 mt-1">Test your understanding with exam-style questions</p>
            <div className="mt-3 space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="font-medium text-slate-800">Q{index + 1} {q.question}</p>
                  {q.answer && (
                    <div className="mt-2 text-sm text-slate-600 prose prose-indigo max-w-none">
                      <details>
                        <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">Show Answer</summary>
                        <ReactMarkdown>{q.answer}</ReactMarkdown>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Terms & Definitions */}
        {keyTerms.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Key Terms & Definitions</h4>
            <div className="mt-3 space-y-3">
              {keyTerms.map((term, index) => (
                <div key={index}>
                  <p className="font-medium text-slate-800">{term.term}</p>
                  <div className="mt-1 text-sm text-slate-600 prose prose-indigo max-w-none">
                    <ReactMarkdown>{term.definition}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Aids & Mnemonics */}
        {mnemonics.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Memory Aids & Mnemonics</h4>
            <div className="mt-3 space-y-3">
              {mnemonics.map((mnemonic, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="text-sm text-slate-600 prose prose-indigo max-w-none">
                    <ReactMarkdown>{mnemonic}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Thinking Questions */}
        {criticalThinkingQuestions.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Critical Thinking Questions</h4>
            <div className="mt-3 space-y-3">
              {criticalThinkingQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="text-sm text-slate-600 prose prose-indigo max-w-none">
                    <ReactMarkdown>{question}</ReactMarkdown>
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
