'use client';
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
        <div className="text-center space-y-2"><div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl"><Ticket className="w-6 h-6" /></div><h1 className="text-2xl font-black text-white">Sign In to UniPass</h1></div>
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="student@stanford.edu" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase">1-Click Demo Personas (Anurag):</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => handleDemo('STUDENT')} className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition">
                <p className="font-bold text-white text-[11px]">🎓 Student</p>
                <p className="text-[10px] text-indigo-400 font-medium">Anurag</p>
              </button>
              <button type="button" onClick={() => handleDemo('ORGANIZER')} className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition">
                <p className="font-bold text-emerald-400 text-[11px]">🎪 Host</p>
                <p className="text-[10px] text-emerald-300 font-medium">Anurag</p>
              </button>
              <button type="button" onClick={() => handleDemo('ADMIN')} className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition">
                <p className="font-bold text-amber-400 text-[11px]">🛡️ Admin</p>
                <p className="text-[10px] text-amber-300 font-medium">Anurag</p>
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400"><Link href="/register" className="text-indigo-400 font-bold hover:underline">Create new account</Link></div>
        </div>
      </div>
    </div>
  );
}
