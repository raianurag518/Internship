const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/app/admin/page.tsx', `'use client';
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
}`);

save('src/app/admin/audit-logs/page.tsx', `'use client';
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
}`);

save('src/app/admin/events/page.tsx', `'use client';
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
}`);

save('src/app/admin/users/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">Collegiate User Accounts</h1>
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
}`);

save('src/app/login/page.tsx', `'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Ticket, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      showToast('Signed in successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) { showToast(err.message || 'Login failed', 'error'); } finally { setIsSubmitting(false); }
  };

  const handleDemo = async (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    await switchDemoUser(role);
    showToast('Logged in as ' + role, 'success');
    if (role === 'ORGANIZER') router.push('/organizer');
    else if (role === 'ADMIN') router.push('/admin');
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2"><div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl"><Ticket className="w-6 h-6" /></div><h1 className="text-2xl font-black text-white">Sign In to CampusConnect</h1></div>
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="student@stanford.edu" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase">1-Click Demo Personas:</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => handleDemo('STUDENT')} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-left"><p className="font-bold text-white text-[11px]">🎓 Student</p></button>
              <button type="button" onClick={() => handleDemo('ORGANIZER')} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-left"><p className="font-bold text-emerald-400 text-[11px]">🎪 Host</p></button>
              <button type="button" onClick={() => handleDemo('ADMIN')} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-left"><p className="font-bold text-amber-400 text-[11px]">🛡️ Admin</p></button>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400"><Link href="/register" className="text-indigo-400 font-bold hover:underline">Create new account</Link></div>
        </div>
      </div>
    </div>
  );
}`);

save('src/app/register/page.tsx', `'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Ticket, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: 'Stanford University', studentId: '', role: 'STUDENT' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(form as any);
      showToast('Account created!', 'success');
      router.push('/dashboard');
    } catch (err: any) { showToast(err.message || 'Registration failed', 'error'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2"><div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white"><Ticket className="w-6 h-6" /></div><h1 className="text-2xl font-black text-white">Join CampusConnect</h1></div>
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Alex Rivera" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email (.edu)</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="alex@stanford.edu" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">College</label><input type="text" required value={form.college} onChange={e => setForm({...form, college: e.target.value})} placeholder="Stanford University" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label><input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            </button>
          </form>
          <div className="text-center text-xs text-slate-400"><Link href="/login" className="text-indigo-400 font-bold hover:underline">Sign In</Link></div>
        </div>
      </div>
    </div>
  );
}`);

save('src/app/forgot-password/page.tsx', `'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { showToast('Reset token generated', 'success'); if (data.demoResetToken) setDemoToken(data.demoResetToken); }
    } catch (e) { showToast('Error', 'error'); } finally { setIsSubmitting(false); }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
          {!demoToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Send Reset Link</span>}</button>
            </form>
          ) : (
            <div className="text-center space-y-4"><CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" /><p className="text-xs text-slate-300">Demo token generated!</p><Link href={'/reset-password?token=' + demoToken} className="block w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Set New Password</Link></div>
          )}
        </div>
      </div>
    </div>
  );
}`);

save('src/app/reset-password/page.tsx', `'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword }) });
      if (res.ok) { setIsDone(true); showToast('Password reset successfully!', 'success'); }
      else { showToast('Reset failed', 'error'); }
    } catch (e) { showToast('Error', 'error'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <h1 className="text-2xl font-black text-white">Create New Password</h1>
        {!isDone ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">New Password</label><input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Update Password</span>}</button>
          </form>
        ) : (
          <div className="text-center space-y-4"><CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" /><p className="text-xs text-slate-300">Password updated!</p><Link href="/login" className="block w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Sign In</Link></div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}`);