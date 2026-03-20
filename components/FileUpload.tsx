'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, UploadCloud, FileAudio, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FileUpload({ setAnalysis }: { setAnalysis: (analysis: any) => void }) {
  const [step, setStep] = useState(1);
  
  // Form Data
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'mistral'>('gemini');
  const [actions, setActions] = useState<string[]>(['summary', 'clinicalConcepts', 'studyGuide']);
  
  // Progress State
  const [progress, setProgress] = useState({
    upload: 'pending', // pending, current, complete, error
    summary: 'pending',
    concepts: 'pending',
    guide: 'pending',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin' | ''>('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const me = await fetch('/api/auth/me');
        if (me.ok) {
          const u = await me.json();
          setRole(u.role);
        }
      } catch {}
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch {}
    }
    load();
  }, []);

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubject.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setSubjects((prev) => [...prev, created]);
        setSubject(created.name);
        setNewSubject('');
        setAddingSubject(false);
      }
    } catch {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      if (!title) {
        // Auto-fill title from filename without extension
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleActionChange = (actionId: string) => {
    if (actions.includes(actionId)) {
      setActions(actions.filter((a) => a !== actionId));
    } else {
      setActions([...actions, actionId]);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setStep(4);
    setErrorMsg('');
    
    let transcriptData = '';
    let finalAnalysis: any = {};

    // 1. Upload & Transcribe
    try {
      setProgress(p => ({ ...p, upload: 'current' }));
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Failed to upload and transcribe audio.');
      const uploadData = await uploadRes.json();
      transcriptData = uploadData.transcript;
      console.log("Transcript Data from /api/upload:", transcriptData); // Added logging
      setProgress(p => ({ ...p, upload: 'complete' }));
    } catch (err: any) {
      setProgress(p => ({ ...p, upload: 'error' }));
      setErrorMsg(err.message);
      return;
    }

    // 2. Generate Summary
    if (actions.includes('summary')) {
      try {
        setProgress(p => ({ ...p, summary: 'current' }));
        const res = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcriptData, actions: ['summary'], provider, title, subject }),
        });
        if (!res.ok) throw new Error('Failed to generate summary');
        const data = await res.json();
        finalAnalysis.summary = data.summary;
        setProgress(p => ({ ...p, summary: 'complete' }));
      } catch (err: any) {
        setProgress(p => ({ ...p, summary: 'error' }));
        setErrorMsg(err.message);
        return;
      }
    }

    // 3. Extract Concepts
    if (actions.includes('clinicalConcepts')) {
      try {
        setProgress(p => ({ ...p, concepts: 'current' }));
        const res = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcriptData, actions: ['clinicalConcepts'], provider, title, subject }),
        });
        if (!res.ok) throw new Error('Failed to extract concepts');
        const data = await res.json();
        finalAnalysis.clinicalConcepts = data.clinicalConcepts;
        setProgress(p => ({ ...p, concepts: 'complete' }));
      } catch (err: any) {
        setProgress(p => ({ ...p, concepts: 'error' }));
        setErrorMsg(err.message);
        return;
      }
    }

    // 4. Generate Study Guide
    if (actions.includes('studyGuide')) {
      try {
        setProgress(p => ({ ...p, guide: 'current' }));
        const res = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcriptData, actions: ['studyGuide'], provider, title, subject }),
        });
        if (!res.ok) throw new Error('Failed to generate study guide');
        const data = await res.json();
        finalAnalysis.studyGuide = data.studyGuide;
        setProgress(p => ({ ...p, guide: 'complete' }));
      } catch (err: any) {
        setProgress(p => ({ ...p, guide: 'error' }));
        setErrorMsg(err.message);
        return;
      }
    }

    // Save to DB
    try {
      await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          transcript: transcriptData,
          analysis: finalAnalysis,
        }),
      });
    } catch (e) {
      console.error("Failed to save to DB", e);
      setErrorMsg("Failed to save lecture to database. Please try again.");
    }

    // Pass back to parent
    setAnalysis(finalAnalysis);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4 text-sm font-medium">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-300'}`}>1</div>
          <span>Upload Audio</span>
        </div>
        <div className={`w-12 h-px ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-300'}`}>2</div>
          <span>Add Details</span>
        </div>
        <div className={`w-12 h-px ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-300'}`}>3</div>
          <span>Review</span>
        </div>
      </div>
    </div>
  );

  const ProgressItem = ({ status, title, description }: { status: string, title: string, description: string }) => {
    if (status === 'pending') return (
      <div className="flex items-start gap-4 text-slate-400">
        <Circle className="w-5 h-5 mt-0.5" />
        <div>
          <p className="font-medium text-slate-500">{title}</p>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    );
    if (status === 'current') return (
      <div className="flex items-start gap-4 text-indigo-600">
        <Loader2 className="w-5 h-5 mt-0.5 animate-spin" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-indigo-500/80">{description}</p>
        </div>
      </div>
    );
    if (status === 'error') return (
      <div className="flex items-start gap-4 text-red-500">
        <Circle className="w-5 h-5 mt-0.5" />
        <div>
          <p className="font-medium">{title} (Failed)</p>
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      </div>
    );
    return (
      <div className="flex items-start gap-4 text-emerald-600">
        <CheckCircle2 className="w-5 h-5 mt-0.5" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-emerald-500/80">Complete</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 mt-4 max-w-3xl mx-auto">
      {step < 4 && renderStepIndicator()}

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-slate-900">Upload your lecture</h3>
            <p className="text-slate-500 mt-2">We support MP3, WAV, MP4, and M4A up to 100MB.</p>
          </div>
          <div className="flex items-center justify-center w-full mt-4">
            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileAudio className="w-10 h-10 mb-3 text-indigo-500" />
                    <p className="mb-1 text-sm font-semibold text-indigo-700">{file.name}</p>
                    <p className="text-xs text-indigo-500/70">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-1 text-sm text-slate-600"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-400">Audio or Video format</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="audio/*,video/*" />
            </label>
          </div>
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setStep(2)} 
              disabled={!file}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-slate-900">Lecture Details</h3>
            <p className="text-slate-500 mt-2">Help us categorize and understand your notes better.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lecture Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lecture Description (Optional)</label>
            <textarea
              placeholder="Provide context about this lecture, course, professor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject / Tag</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full sm:flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm bg-white"
              >
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {role !== 'student' && (
                addingSubject ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="New subject"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                    <button onClick={addSubject} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">Save</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSubject(true)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm whitespace-nowrap">
                    + Add New
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => setStep(3)} 
              disabled={!title}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-slate-900">Review & Submit</h3>
            <p className="text-slate-500 mt-2">Choose how you want AI to analyze your lecture.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Audio Source</p>
                <p className="font-medium text-slate-900 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-indigo-500" /> {file?.name}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Lecture Title</p>
                <p className="font-medium text-slate-900">{title}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Subject</p>
                <p className="font-medium text-slate-900">{subject || 'None'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">AI Engine</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai' | 'mistral')}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm bg-white"
            >
              <option value="gemini">Google Gemini (Default)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="mistral">Mistral (Large)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">What happens next?</label>
            <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
              {[
                { id: 'summary', label: 'Generate lecture overview and key takeaways' },
                { id: 'clinicalConcepts', label: 'Extract diseases, medications, and interventions' },
                { id: 'studyGuide', label: 'Create NCLEX-style questions and study materials' },
              ].map((action) => (
                <label key={action.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={actions.includes(action.id)}
                    onChange={() => handleActionChange(action.id)}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{action.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={startAnalysis} 
              disabled={actions.length === 0}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#17B794] text-white font-medium rounded-xl hover:bg-[#129A7C] transition-all shadow-md shadow-[#17B794]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Lecture
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in zoom-in-95 duration-500 py-8">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Analyzing Your Lecture</h3>
            <p className="text-slate-500 mt-2">"{title}" is being processed</p>
          </div>

          <div className="max-w-md mx-auto space-y-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <ProgressItem 
              status={progress.upload} 
              title="Audio Processing & Transcription" 
              description="Extracting audio and converting speech to text..." 
            />
            {actions.includes('summary') && (
              <ProgressItem 
                status={progress.summary} 
                title="Lecture Summary" 
                description="Generating lecture overview and key takeaways..." 
              />
            )}
            {actions.includes('clinicalConcepts') && (
              <ProgressItem 
                status={progress.concepts} 
                title="Clinical Concepts" 
                description="Extracting diseases, medications, and nursing interventions..." 
              />
            )}
            {actions.includes('studyGuide') && (
              <ProgressItem 
                status={progress.guide} 
                title="Study Guide & NCLEX Prep" 
                description="Creating practice questions and study materials..." 
              />
            )}
          </div>
          
          {errorMsg && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-600 font-medium mb-2">Analysis paused due to an error:</p>
              <p className="text-sm text-red-500 mb-4">{errorMsg}</p>
              <button onClick={() => setStep(3)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                Go Back & Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
