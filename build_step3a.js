const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/context/ToastContext.tsx', `'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; message: string; type: ToastType; }
interface ToastContextType { showToast: (message: string, type?: ToastType) => void; }
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4500);
  };
  const removeToast = (id: string) => { setToasts((prev) => prev.filter((t) => t.id !== id)); };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border backdrop-blur-md bg-slate-900 border-slate-700 text-white">
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="ml-3 text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}`);

save('src/context/AuthContext.tsx', `'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, LoginDTO, RegisterDTO } from '@/types/auth';
interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) { const data = await res.json(); setUser(data.user); } else { setUser(null); }
    } catch (e) { setUser(null); } finally { setLoading(false); }
  };
  useEffect(() => { refreshUser(); }, []);
  const login = async (data: LoginDTO) => {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Login failed');
    setUser(resData.user);
  };
  const register = async (data: RegisterDTO) => {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Registration failed');
    setUser(resData.user);
  };
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); };
  const switchDemoUser = async (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    let email = 'student@stanford.edu';
    let password = 'Student@1234';
    if (role === 'ORGANIZER') { email = 'organizer@campusconnect.demo'; password = 'Organizer@1234'; }
    else if (role === 'ADMIN') { email = 'admin@campusconnect.demo'; password = 'Admin@1234'; }
    await login({ email, password });
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}`);

save('src/components/layout/Navbar.tsx', `'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Repeat, Compass, ShieldAlert, LogOut, QrCode } from 'lucide-react';
export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navLinks = [
    { href: '/events', label: 'Aggregator', icon: Compass },
    { href: '/resale', label: 'P2P Escrow', icon: Repeat },
  ];
  if (user) navLinks.push({ href: '/tickets', label: 'My Passes', icon: Ticket });
  if (user && (user.role === 'ORGANIZER' || user.role === 'ADMIN')) navLinks.push({ href: '/organizer', label: 'Host Hub', icon: QrCode });
  if (user && user.role === 'ADMIN') navLinks.push({ href: '/admin', label: 'Admin', icon: ShieldAlert });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 transition-all">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight flex items-center gap-1.5">
                Campus<span className="text-indigo-400">Connect</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest font-mono text-slate-400 -mt-1 font-bold">
                Escrow & Pass Vault
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} className={'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (isActive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900')}>
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[11px]">{user.name.charAt(0)}</div>
                <div className="hidden sm:block text-left"><p className="font-bold text-white leading-none text-xs">{user.name}</p><p className="text-[10px] text-indigo-400 font-mono">{user.college.split(' ')[0]}</p></div>
              </Link>
              <button onClick={() => logout()} title="Logout" className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all">Sign In</Link>
              <Link href="/register" className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all">Join with .edu</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}`);

save('src/components/layout/Footer.tsx', `import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, Lock } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 py-12 mt-auto text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs"><Ticket className="w-4 h-4" /></div>
              <span className="font-extrabold text-white text-base tracking-tight">CampusConnect</span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              Summer 2026 Production Project: Multi-Platform College Event Aggregator & Secure Ticket Escrow Clearinghouse. Engineered with cryptographic 30s Dynamic TOTP tokens and a strict 15% anti-scalping cap.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/events" className="hover:text-indigo-400">Event Discovery</Link></li>
              <li><Link href="/resale" className="hover:text-indigo-400">P2P Escrow Clearinghouse</Link></li>
              <li><Link href="/tickets" className="hover:text-indigo-400">Dynamic Pass Vault</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Security</h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 15% Anti-Scalping Engine</p>
              <p className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" /> 30s Dynamic TOTP Passes</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Collegiate .EDU Verification</p>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 CampusConnect. B.Tech Computer Science Summer Internship Project.</p>
          <p className="flex items-center gap-1">Built with Next.js, Prisma, Tailwind CSS, and Dynamic HMAC TOTP.</p>
        </div>
      </div>
    </footer>
  );
}`);

save('src/components/common/DemoSwitcher.tsx', `'use client';
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
            <p className="text-[11px] text-slate-400 font-medium">Switch 1-Click Persona:</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => handleSwitch('STUDENT')} className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[11px] font-bold">🎓 Student</button>
              <button onClick={() => handleSwitch('ORGANIZER')} className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-[11px] font-bold">🎪 Host</button>
              <button onClick={() => handleSwitch('ADMIN')} className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[11px] font-bold">🛡️ Admin</button>
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
}`);