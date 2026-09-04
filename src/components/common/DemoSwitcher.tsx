'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { Sparkles, RefreshCw, X, ChevronUp } from 'lucide-react';
export default function DemoSwitcher() {
  const { user, switchDemoUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const handleSwitch = async (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    try {
      await switchDemoUser(role);
      showToast('Switched demo persona to ' + role, 'success');
      if (role === 'ORGANIZER') router.push('/organizer');
      else if (role === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    } catch (err: any) { showToast(err.message || 'Failed to switch role', 'error'); }
  };
  const handleResetDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) { showToast('Database reset and seeded with fresh demo data!', 'success'); window.location.reload(); }
      else { showToast('Failed to seed database.', 'error'); }
    } catch (err) { showToast('Error resetting database.', 'error'); } finally { setIsSeeding(false); }
  };
  return (
    <div className="fixed bottom-5 left-5 z-50">
      {isOpen ? (
        <div className="p-5 rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl max-w-xs w-72 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white"><Sparkles className="w-4 h-4 text-indigo-400" /><span>Demo Role Switcher</span></div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-1.5 text-xs">
            <p className="text-[11px] text-slate-400 font-medium">Active Session:</p>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div><p className="font-bold text-white truncate max-w-[150px]">{user ? user.name : 'Guest User'}</p><p className="text-[10px] text-indigo-400 font-mono">{user ? user.role : 'NOT SIGNED IN'}</p></div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">Live</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-400 font-medium">Switch 1-Click Persona (Anurag):</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => handleSwitch('STUDENT')} className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[11px] font-bold text-center">
                <div>🎓 Student</div>
                <div className="text-[10px] text-indigo-300 font-medium mt-0.5">Anurag</div>
              </button>
              <button onClick={() => handleSwitch('ORGANIZER')} className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-[11px] font-bold text-center">
                <div>🎪 Host</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">Anurag</div>
              </button>
              <button onClick={() => handleSwitch('ADMIN')} className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[11px] font-bold text-center">
                <div>🛡️ Admin</div>
                <div className="text-[10px] text-amber-400 font-medium mt-0.5">Anurag</div>
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <button onClick={handleResetDatabase} disabled={isSeeding} className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5">
              <RefreshCw className={'w-3.5 h-3.5 ' + (isSeeding ? 'animate-spin' : '')} /><span>Reset & Re-Seed Database</span>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/40 border border-indigo-400/40">
          <Sparkles className="w-4 h-4" /><span>Demo Controls</span><ChevronUp className="w-3.5 h-3.5 text-indigo-200" />
        </button>
      )}
    </div>
  );
}
