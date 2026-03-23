'use client';
import Tabs from "../../components/Tabs";
import LectureSummary from "../../components/LectureSummary";
import ClinicalConcepts from "../../components/ClinicalConcepts";
import StudyGuide from "../../components/StudyGuide";
import { Mail, MessageCircle, Sparkles } from 'lucide-react';

export default function TranscriptionPage({ analysis }: { analysis?: any }) {

  // Default empty analysis to prevent build errors
  const defaultAnalysis = {
    summary: "",
    clinicalConcepts: [],
    studyGuide: ""
  };

  const safeAnalysis = analysis || defaultAnalysis;

  const tabs = [
    { name: 'Summary', content: <LectureSummary summary={safeAnalysis.summary} /> },
    { name: 'Clinical Concepts', content: <ClinicalConcepts concepts={safeAnalysis.clinicalConcepts} /> },
    { name: 'Study Guide', content: <StudyGuide guide={safeAnalysis.studyGuide} /> },
  ];

  const handleAction = async (action: string) => {
    let email = '';
    let whatsapp = '';

    if (action === 'email') {
      email = prompt('Enter your email address:') || '';
      if (!email) return;
    } else if (action === 'whatsapp') {
      whatsapp = prompt('Enter your WhatsApp number (without country code):') || '';
      if (!whatsapp) return;
      // Automatically add +91 country code for India
      whatsapp = '+91' + whatsapp.replace(/\D/g, ''); // Remove non-digits and add +91
    }

    try {
      await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actions: [action], analysis: safeAnalysis, email, whatsapp }),
      });
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} sent successfully!`);
    } catch (error) {
      console.error('Error performing action:', error);
      alert(`Error sending ${action}.`);
    }
  };

  return (
    <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl border border-white/20">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-10" />

      {/* Modern gradient header */}
      <header className="relative bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 px-6 py-6 border-b border-white/20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Analysis Results
              </h2>
              <p className="text-sm text-white/90 mt-1">Review your generated summary, concepts, and study guide.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('email')}
              className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-medium rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Mail className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Email</span>
            </button>

            <button
              onClick={() => handleAction('whatsapp')}
              className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <MessageCircle className="w-4 h-4 relative z-10" />
              <span className="relative z-10">WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content with tabs */}
      <div className="p-6">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}
