'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Users, Calendar, Repeat } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/analytics').then(r => r.json()).then(d => setStats(d.stats)); }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">Administration & Security Hub</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold">Total Users</p><p className="text-2xl font-black text-white font-mono mt-1">{stats?.totalUsers || 0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold">Total Events</p><p className="text-2xl font-black text-indigo-400 font-mono mt-1">{stats?.totalEvents || 0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold">Total Passes</p><p className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats?.totalTickets || 0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold">Escrow Txns</p><p className="text-2xl font-black text-amber-400 font-mono mt-1">{stats?.totalTransactions || 0}</p></div>
      </div>
      <div className="flex gap-4">
        <Link href="/admin/audit-logs" className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-700">Audit Logs</Link>
        <Link href="/admin/users" className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-700">User Management</Link>
        <Link href="/admin/events" className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-700">Event Approvals</Link>
      </div>
    </div>
  );
}
