'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TranscriptionPage from '../../transcription/page';

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
          className="text-sm text-sky-600 hover:underline"
        >
          ← Back
        </button>
        <div className="rounded-xl bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
          Lecture not found in this browser. It may have been cleared from
          storage.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Saved lecture
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {lecture.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Created {new Date(lecture.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="space-x-3">
          <a
            href={`/api/lectures/${lecture.id}/download`}
            className="text-sm text-sky-600 hover:underline"
          >
            Download
          </a>
          <button
            onClick={() => router.push('/lectures')}
            className="text-sm text-sky-600 hover:underline"
          >
            View all lectures
          </button>
        </div>
      </header>
      <TranscriptionPage analysis={lecture.analysis} />
    </div>
  );
}
