'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/events').then(r => r.json()).then(d => setEvents(d.events || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">Manage Platform Events</h1>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div><p className="font-bold text-white text-base">{e.title}</p><p className="text-xs text-slate-400">{e.college} • Status: {e.status}</p></div>
            <span className="text-xs font-mono text-emerald-400">{e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
