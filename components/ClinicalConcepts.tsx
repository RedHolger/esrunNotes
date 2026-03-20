import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ClinicalConcepts({ concepts }: { concepts: { name: string, definition: string }[] }) {
  if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mt-4">
        <h3 className="text-lg font-medium text-gray-900">Clinical Concepts</h3>
        <p className="mt-2 text-sm text-gray-500">No clinical concepts could be extracted or the data was malformed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium text-gray-900">Clinical Concepts</h3>
      <div className="mt-4 space-y-4">
        {concepts.map((concept, index) => (
          <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
            <h4 className="font-semibold text-slate-800 text-base">{concept.name}</h4>
            <div className="mt-1 text-sm text-slate-600 prose prose-indigo max-w-none">
              <ReactMarkdown>{concept.definition}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
