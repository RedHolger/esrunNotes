'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
};

type Lecture = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setError('');
      try {
        const [uRes, lRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/lectures'),
        ]);
        if (!uRes.ok) {
          const msg = (await uRes.json().catch(() => ({})))?.error || 'Forbidden';
          setError(msg);
          return;
        }
        const uData = (await uRes.json()) as User[];
        const lData = (await lRes.json()) as any[];
        setUsers(uData);
        setLectures(
          lData.map((x) => ({
            id: x.id,
            title: x.title,
            subject: x.subject,
            createdAt: x.createdAt,
          }))
        );
      } catch {
        setError('Failed to load admin data');
      }
    }
    load();
  }, []);

  const changeRole = async (id: string, role: User['role']) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete user?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  if (error) {
    return (
      <div className="rounded-xl bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage users and view lecture statistics.
        </p>
      </header>

      <section className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Users</h2>
        <table className="mt-3 min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as User['role'])}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Lectures</h2>
        <table className="mt-3 min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lectures.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2">{l.title}</td>
                <td className="px-4 py-2">{l.subject}</td>
                <td className="px-4 py-2">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

