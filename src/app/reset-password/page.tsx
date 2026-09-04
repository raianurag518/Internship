'use client';
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
}
