 'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (mounted) setUser(u || null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="w-72 bg-white border-r border-slate-200 text-slate-700 p-6 flex flex-col h-screen sticky top-0">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          N
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">NurseNotes</h2>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">AI Intelligence</p>
        </div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 text-sm font-medium">
          <li>
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/lectures"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              My Lectures
            </Link>
          </li>
          <li>
            <Link
              href="/activity"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Activity
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Profile
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-6 border-t border-slate-200 pt-6 text-sm">
        {user ? (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs">{user.name}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <a href="/api/auth/logout" className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </a>
          </div>
        ) : (
          <a href="/api/auth/login" className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            Login / Sign up
          </a>
        )}
      </div>
    </div>
  );
}
