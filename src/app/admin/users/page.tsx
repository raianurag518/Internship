'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">College User Accounts</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
            <div><p className="font-bold text-white">{u.name}</p><p className="text-slate-400">{u.email} • {u.college}</p></div>
            <div className="text-right"><span className="text-indigo-400 font-mono">{u.role}</span><p className="text-emerald-400 font-mono">{u.verificationStatus}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
