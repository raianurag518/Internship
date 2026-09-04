'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/audit-logs').then(r => r.json()).then(d => setLogs(d.logs || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">System Security Audit Logs</h1>
      <div className="space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex justify-between">
            <div><span className="font-mono text-indigo-400 font-bold">{l.action}</span><p className="text-slate-400 mt-1">{l.user?.name} ({l.user?.college})</p></div>
            <span className="text-slate-500 font-mono">{formatDate(l.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
