import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function LectureSummary({ summary }: { summary: string }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium text-gray-900">Lecture Summary</h3>
      <div className="mt-4 prose prose-indigo max-w-none">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
