const fs = require('fs');
const path = require('path');
function save(rel, c) {
  const f = path.join(__dirname, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c.trim() + '\n', 'utf8');
  console.log(`Saved: ${rel}`);
}

save('src/app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;
:root { --foreground-rgb: 248, 250, 252; }
body { color: rgb(var(--foreground-rgb)); background: #020617; font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow-x: hidden; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #090d16; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
`);

save('src/app/layout.tsx', `
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DemoSwitcher from '@/components/common/DemoSwitcher';

export const metadata: Metadata = {
  title: 'CampusConnect — Multi-Platform College Event Aggregator & Secure Ticket Escrow',
  description: 'Verified college event aggregator with 15% price caps, dynamic 30s TOTP passes, and smart escrow.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <DemoSwitcher />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
`);

save('src/components/layout/Navbar.tsx', `
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Repeat, Compass, LogOut, Menu, X, QrCode, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Discover Events', href: '/events', icon: Compass },
    { name: 'P2P Resale (15% Cap)', href: '/resale', icon: Repeat },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-tight leading-none">
              Campus<span className="text-indigo-400">Connect</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-medium tracking-wider">
              Secure Event Escrow
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={\`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all \${
                  isActive ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }\`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-bold font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              {user.role === 'ORGANIZER' && (
                <Link href="/organizer" className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Organizer</span>
                </Link>
              )}
              <Link href="/tickets" className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Passes</span>
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[11px] font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20">
                Join with .edu
              </Link>
            </div>
          )}
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
}
`);

save('src/components/layout/Footer.tsx', `
import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, Lock, Repeat } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-white">
              Campus<span className="text-indigo-400">Connect</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Multi-Platform College Event Aggregator & Secure Ticket Escrow with 15% anti-scalping price caps and dynamic 30s TOTP QR verification.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Core Features</h4>
          <ul className="space-y-2">
            <li><Link href="/events" className="hover:text-indigo-400">Event Aggregator</Link></li>
            <li><Link href="/resale" className="hover:text-indigo-400">P2P Escrow Clearinghouse</Link></li>
            <li><Link href="/organizer/scanner" className="hover:text-indigo-400">Gate QR Scanner</Link></li>
            <li><Link href="/dashboard" className="hover:text-indigo-400">Student Vault</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Security Features</h4>
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center gap-1.5 text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> 15% Anti-Scalping Markup Cap</li>
            <li className="flex items-center gap-1.5 text-indigo-400"><Lock className="w-3.5 h-3.5" /> Dynamic 30s Rotating Passwords</li>
            <li className="flex items-center gap-1.5 text-purple-400"><Repeat className="w-3.5 h-3.5" /> Atomic Smart Escrow Clearing</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Project Specs</h4>
          <p className="text-[11px] text-slate-400">B.Tech Computer Science Summer Internship Project.</p>
          <div className="pt-2 text-[10px] text-slate-400 font-mono">Next.js 14 • Prisma 5 • Tailwind • SQLite</div>
        </div>
      </div>
    </footer>
  );
}
`);

save('src/components/common/DemoSwitcher.tsx', `
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
      showToast(\`Switched demo persona to \${role}\`, 'success');
      if (role === 'ORGANIZER') router.push('/organizer');
      else if (role === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch role', 'error');
    }
  };

  const handleResetDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        showToast('Database reset and seeded with fresh demo data!', 'success');
        window.location.reload();
      } else {
        showToast('Failed to seed database.', 'error');
      }
    } catch (err) {
      showToast('Error resetting database.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {isOpen ? (
        <div className="p-5 rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl max-w-xs w-72 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Demo Role Switcher</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <p className="text-[11px] text-slate-400 font-medium">Active Session:</p>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white truncate max-w-[150px]">{user ? user.name : 'Guest User'}</p>
                <p className="text-[10px] text-indigo-400 font-mono">{user ? user.role : 'NOT SIGNED IN'}</p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                Live
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-400 font-medium">Switch 1-Click Persona:</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => handleSwitch('STUDENT')} className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[11px] font-bold">
                🎓 Student
              </button>
              <button onClick={() => handleSwitch('ORGANIZER')} className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-[11px] font-bold">
                🎪 Host
              </button>
              <button onClick={() => handleSwitch('ADMIN')} className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[11px] font-bold">
                🛡️ Admin
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <button onClick={handleResetDatabase} disabled={isSeeding} className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5">
              <RefreshCw className={\`w-3.5 h-3.5 \${isSeeding ? 'animate-spin' : ''}\`} />
              <span>Reset & Re-Seed Database</span>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/40 border border-indigo-400/40">
          <Sparkles className="w-4 h-4" />
          <span>Demo Controls</span>
          <ChevronUp className="w-3.5 h-3.5 text-indigo-200" />
        </button>
      )}
    </div>
  );
}
`);