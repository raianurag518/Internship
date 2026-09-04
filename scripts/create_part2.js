const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`[PART 2] Wrote ${relPath} (${content.length} chars)`);
}

// -------------------------------------------------------------
// Contexts
// -------------------------------------------------------------
save('src/context/ToastContext.tsx', `
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={\`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 \${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }\`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
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
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
`);

save('src/context/AuthContext.tsx', `
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, LoginDTO, RegisterDTO } from '@/types/auth';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const login = async (dto: LoginDTO) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    setUser(data.user);
  };

  const register = async (dto: RegisterDTO) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const switchDemoUser = async (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    let email = 'student@stanford.edu';
    let password = 'Student@1234';

    if (role === 'ORGANIZER') {
      email = 'organizer@campusconnect.demo';
      password = 'Organizer@1234';
    } else if (role === 'ADMIN') {
      email = 'admin@campusconnect.demo';
      password = 'Admin@1234';
    }

    await login({ email, password });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
`);

// -------------------------------------------------------------
// Components
// -------------------------------------------------------------
save('src/components/layout/Navbar.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Ticket,
  Repeat,
  Compass,
  LogOut,
  Menu,
  X,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

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

save('src/components/events/EventCard.tsx', `
'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/types/event';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, MapPin, Building2, Ticket, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface EventCardProps {
  event: EventItem;
  onBookClick?: (event: EventItem) => void;
  onBookmarkToggle?: (eventId: string) => void;
}

export default function EventCard({ event, onBookClick, onBookmarkToggle }: EventCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save events.', 'info');
      return;
    }
    try {
      const res = await fetch(\`/api/events/\${event.id}/bookmark\`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(data.isSaved ? 'Event saved to bookmarks!' : 'Event removed from bookmarks.', 'success');
        if (onBookmarkToggle) onBookmarkToggle(event.id);
      }
    } catch (err) {
      showToast('Failed to toggle bookmark', 'error');
    }
  };

  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col overflow-hidden shadow-lg hover:shadow-2xl">
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <Image
          src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 text-indigo-300 border border-indigo-500/30 font-mono">
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-slate-950 font-mono">
              Featured
            </span>
          )}
        </div>
        <button
          onClick={handleBookmark}
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-amber-400"
        >
          <Bookmark className={\`w-4 h-4 \${event.isSaved ? 'fill-amber-400 text-amber-400' : ''}\`} />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1 font-semibold truncate max-w-[200px]">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{event.college}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-slate-950/90 px-2 py-0.5 rounded-lg border border-slate-800">
            {event.availableSeats > 0 ? \`\${event.availableSeats} spots\` : 'Sold Out'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link href={\`/events/\${event.id}\`}>
            <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 line-clamp-1">
              {event.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Pass Price</span>
            <p className="text-base font-extrabold text-white font-mono">
              {event.basePrice === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(event.basePrice)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={\`/events/\${event.id}\`}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Details
            </Link>
            <button
              onClick={() => onBookClick && onBookClick(event)}
              disabled={isSoldOut}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{isSoldOut ? 'Sold Out' : 'Book Pass'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

save('src/components/events/BookingModal.tsx', `
'use client';
import React, { useState } from 'react';
import { EventItem, TicketCategoryItem } from '@/types/event';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Ticket, ShieldCheck, X, CheckCircle2, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function BookingModal({ event, onClose, onSuccess }: { event: EventItem; onClose: () => void; onSuccess?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const categories = event.ticketCategories || [];
  const [selectedCategory, setSelectedCategory] = useState<TicketCategoryItem | null>(categories[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedTicket, setBookedTicket] = useState<any>(null);

  const handleBooking = async () => {
    if (!user) {
      showToast('Please sign in to complete booking.', 'error');
      router.push('/login');
      return;
    }
    if (!selectedCategory) {
      showToast('Please select a ticket pass tier.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/tickets/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, categoryId: selectedCategory.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete reservation.');
      setBookedTicket(data.ticket);
      setIsSuccess(true);
      showToast('Pass booked successfully! Added to your Digital Vault.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Booking error.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono mb-2">
                <Ticket className="w-3.5 h-3.5" />
                <span>Direct Primary Pass Booking</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{event.title}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{event.college} • {formatDate(event.startDate)}</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase">Select Ticket Tier</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isSoldOut = cat.availableQuantity <= 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isSoldOut && setSelectedCategory(cat)}
                      className={\`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between \${
                        isSelected ? 'bg-indigo-950/60 border-indigo-500' : isSoldOut ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800' : 'bg-slate-950/70 border-slate-800'
                      }\`}
                    >
                      <div>
                        <span className="font-bold text-xs text-white">{cat.name}</span>
                        <p className="text-[10px] text-emerald-400 font-mono">{cat.availableQuantity} passes left</p>
                      </div>
                      <p className="text-sm font-extrabold text-white font-mono">
                        {cat.price === 0 ? 'FREE' : formatCurrency(cat.price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBooking}
                disabled={isProcessing || !selectedCategory || selectedCategory.availableQuantity <= 0}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm ({selectedCategory?.price === 0 ? 'Free' : formatCurrency(selectedCategory?.price || 0)})</span>}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Event Pass Issued!</h3>
            <p className="text-xs text-slate-400">Ticket Serial Number: <strong className="font-mono text-indigo-300">{bookedTicket?.ticketNumber}</strong></p>
            <div className="pt-4 flex justify-center gap-3">
              <button onClick={() => { onClose(); router.push('/tickets'); }} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
                View in My Tickets
              </button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`);

save('src/components/tickets/TicketPassCard.tsx', `
'use client';

import React from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Ticket, QrCode, Repeat, ShieldCheck, Building2, Calendar, MapPin, CheckCircle2, Clock, ArrowUpRight, XCircle } from 'lucide-react';
import Link from 'next/link';

interface TicketPassCardProps {
  ticket: TicketItem;
  onViewQr?: (ticket: TicketItem) => void;
  onListResale?: (ticket: TicketItem) => void;
  onCancelResale?: (ticket: TicketItem) => void;
}

export default function TicketPassCard({
  ticket,
  onViewQr,
  onListResale,
  onCancelResale,
}: TicketPassCardProps) {
  const isUsed = ticket.isUsed || ticket.status === 'USED';
  const isListed = ticket.status === 'LISTED_FOR_RESALE';
  const isReserved = ticket.status === 'RESERVED';

  let statusBadge = (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 flex items-center gap-1 font-mono">
      <CheckCircle2 className="w-3 h-3" />
      <span>Active Pass</span>
    </span>
  );

  if (isUsed) {
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 font-mono">
        <Clock className="w-3 h-3" />
        <span>Checked In / Used</span>
      </span>
    );
  } else if (isListed) {
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-700/50 flex items-center gap-1 font-mono">
        <Repeat className="w-3 h-3" />
        <span>In Resale Clearinghouse</span>
      </span>
    );
  } else if (isReserved) {
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center gap-1 font-mono">
        <Clock className="w-3 h-3" />
        <span>Held In Escrow</span>
      </span>
    );
  }

  return (
    <div className="relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex flex-col md:flex-row justify-between shadow-xl">
      <div className="p-6 flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
              {ticket.ticketNumber}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {ticket.category?.name || 'General Admission'}
            </span>
          </div>

          <div>{statusBadge}</div>
        </div>

        <div>
          <Link href={\`/events/\${ticket.eventId}\`}>
            <h3 className="text-lg font-extrabold text-white hover:text-indigo-300 transition-colors">
              {ticket.event?.title || 'Campus Event'}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{ticket.event?.college || 'University Campus'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{formatDate(ticket.event?.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{ticket.event?.venue || 'Campus Auditorium'}</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col justify-between items-center py-2 relative">
        <div className="w-4 h-4 rounded-full bg-slate-950 -mt-3"></div>
        <div className="w-[1px] h-full border-r border-dashed border-slate-800"></div>
        <div className="w-4 h-4 rounded-full bg-slate-950 -mb-3"></div>
      </div>

      <div className="p-6 md:w-64 bg-slate-950/60 flex flex-col justify-between items-center text-center gap-4 border-t md:border-t-0 md:border-l border-slate-800">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Face Value</p>
          <p className="text-xl font-extrabold text-white font-mono mt-0.5">
            {formatCurrency(ticket.originalPrice)}
          </p>
        </div>

        <div className="w-full space-y-2">
          {!isUsed && !isListed && !isReserved && (
            <>
              {onViewQr && (
                <button
                  onClick={() => onViewQr(ticket)}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show Dynamic Pass</span>
                </button>
              )}

              {onListResale && (
                <button
                  onClick={() => onListResale(ticket)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resell (15% Cap)</span>
                </button>
              )}
            </>
          )}

          {isListed && onCancelResale && (
            <button
              onClick={() => onCancelResale(ticket)}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Listing</span>
            </button>
          )}

          <Link
            href={\`/tickets/\${ticket.id}\`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-300 transition-colors pt-1"
          >
            <span>Pass Lineage & Audit</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
`);

save('src/components/tickets/DynamicQrModal.tsx', `
'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TicketItem } from '@/types/ticket';
import { ShieldCheck, X, Lock } from 'lucide-react';
import { generateDynamicTotpToken } from '@/lib/crypto';

interface DynamicQrModalProps {
  ticket: TicketItem;
  onClose: () => void;
}

export default function DynamicQrModal({ ticket, onClose }: DynamicQrModalProps) {
  const [token, setToken] = useState(ticket.qrToken);
  const [remainingSeconds, setRemainingSeconds] = useState(30);

  useEffect(() => {
    const updateToken = () => {
      if (ticket.dynamicSecret) {
        const { token: totpToken, remainingSeconds: rem } = generateDynamicTotpToken(ticket.dynamicSecret);
        setToken(\`\${ticket.qrToken}:\${totpToken}\`);
        setRemainingSeconds(rem);
      } else {
        setToken(ticket.qrToken);
      }
    };

    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [ticket]);

  const percentage = (remainingSeconds / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[10px] font-mono font-bold uppercase">
            <Lock className="w-3 h-3" />
            <span>Anti-Screenshot Dynamic Pass</span>
          </div>
          <h3 className="text-lg font-extrabold text-white">{ticket.event?.title || 'Campus Event Pass'}</h3>
          <p className="text-xs text-slate-400 font-mono">{ticket.ticketNumber}</p>
        </div>

        <div className="relative p-5 bg-white rounded-3xl inline-block mx-auto shadow-2xl">
          <QRCodeSVG value={token} size={200} level="H" includeMargin={false} />
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90">
              <circle cx="16" cy="16" r="13" className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="transparent" />
              <circle
                cx="16"
                cy="16"
                r="13"
                className="text-indigo-500 transition-all duration-1000"
                strokeWidth="3"
                strokeDasharray={81.68}
                strokeDashoffset={81.68 - (81.68 * percentage) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-indigo-300">
              {remainingSeconds}
            </span>
          </div>
          <p className="text-xs text-slate-400 text-left leading-tight">
            Token refreshes automatically in <strong className="text-white font-mono">{remainingSeconds}s</strong>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>Screenshots are invalid at entrance. Show this live screen at the gate scanner.</span>
        </div>
      </div>
    </div>
  );
}
`);

save('src/components/tickets/ResaleListModal.tsx', `
'use client';

import React, { useState } from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, X, AlertTriangle, Repeat, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ResaleListModalProps {
  ticket: TicketItem;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ResaleListModal({ ticket, onClose, onSuccess }: ResaleListModalProps) {
  const { showToast } = useToast();
  const faceValue = ticket.originalPrice || 20;
  const maxAllowedPrice = Math.round(faceValue * 1.15 * 100) / 100;

  const [askingPrice, setAskingPrice] = useState<number>(faceValue);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isOverCap = askingPrice > maxAllowedPrice;
  const markupPercent = faceValue > 0 ? (((askingPrice - faceValue) / faceValue) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOverCap) {
      showToast(\`Cannot list: Resale price exceeds the 15% anti-scalping limit of \${formatCurrency(maxAllowedPrice)}.\`, 'error');
      return;
    }

    if (askingPrice < 0) {
      showToast('Price cannot be negative.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(\`/api/tickets/\${ticket.id}/list-for-resale\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          askingPrice: Number(askingPrice),
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to list ticket for resale');
      }

      showToast('Ticket pass listed in the P2P Escrow Clearinghouse!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error listing ticket.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[10px] font-mono font-medium mb-2">
            <Repeat className="w-3.5 h-3.5" />
            <span>P2P Clearinghouse Resale</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">List Pass for Student Resale</h2>
          <p className="text-xs text-slate-400 mt-1">
            Ticket #{ticket.ticketNumber} • {ticket.event?.title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Original Face Value:</span>
              <span className="font-bold text-white font-mono">{formatCurrency(faceValue)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Max Resale Cap (15% Markup):</span>
              <span className="font-bold text-emerald-400 font-mono">{formatCurrency(maxAllowedPrice)}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Your Asking Price ($)
              </label>
              <span
                className={\`text-[11px] font-mono font-bold \${
                  isOverCap ? 'text-rose-400' : 'text-slate-400'
                }\`}
              >
                {markupPercent}% markup
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                max={maxAllowedPrice}
                value={askingPrice}
                onChange={(e) => setAskingPrice(parseFloat(e.target.value) || 0)}
                className={\`w-full bg-slate-950 border rounded-xl py-2.5 px-4 text-white text-sm font-mono focus:outline-none focus:ring-2 \${
                  isOverCap
                    ? 'border-rose-500 focus:ring-rose-500 text-rose-300'
                    : 'border-slate-700 focus:ring-indigo-500'
                }\`}
                required
              />
            </div>

            {isOverCap && (
              <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Anti-Scalping Violation: Price cannot exceed {formatCurrency(maxAllowedPrice)}.</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Note for Buyer (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Can't make it due to midterm exams"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-indigo-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Escrow Protection Active</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              When a buyer purchases this pass, your QR code will be invalidated and transferred immediately. Funds are credited directly to your student balance.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverCap}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <span>Publish for {formatCurrency(askingPrice)}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`);

save('src/components/escrow/EscrowTimeline.tsx', `
'use client';

import React from 'react';
import { EscrowStatus } from '@/types/escrow';
import { CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';

interface EscrowTimelineProps {
  status: EscrowStatus | string;
}

export default function EscrowTimeline({ status }: EscrowTimelineProps) {
  const steps = [
    { id: 'PAYMENT_RECEIVED', label: 'Payment Captured' },
    { id: 'FUNDS_HELD_IN_ESCROW', label: 'Funds Escrowed in Vault' },
    { id: 'TICKET_VERIFICATION', label: 'Authenticating Ticket & Invalidation' },
    { id: 'TICKET_TRANSFERRED', label: 'Ownership Transferred' },
    { id: 'COMPLETED', label: 'Payout Released' },
  ];

  const getStepIndex = (current: string) => {
    switch (current) {
      case 'CREATED':
      case 'PAYMENT_PENDING':
        return 0;
      case 'PAYMENT_RECEIVED':
        return 1;
      case 'FUNDS_HELD_IN_ESCROW':
        return 2;
      case 'TICKET_VERIFICATION':
        return 3;
      case 'TICKET_TRANSFERRED':
      case 'FUNDS_RELEASED':
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Smart Escrow State Machine</span>
        </span>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
          Status: {status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex - 1 || (currentIndex === 5 && idx === 4);

          return (
            <div
              key={step.id}
              className={\`p-3 rounded-2xl border text-xs space-y-1.5 transition-all \${
                isDone || isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }\`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <p className="font-semibold text-[11px] leading-tight">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`);

save('src/components/escrow/EscrowCheckoutModal.tsx', `
'use client';

import React, { useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShieldCheck, X, Lock, Building2, Calendar, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import EscrowTimeline from './EscrowTimeline';

interface EscrowCheckoutModalProps {
  listing: ResaleListingItem;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EscrowCheckoutModal({
  listing,
  onClose,
  onSuccess,
}: EscrowCheckoutModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<'REVIEW' | 'PROCESSING' | 'COMPLETED'>('REVIEW');
  const [escrowStatus, setEscrowStatus] = useState<string>('CREATED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const price = listing.askingPrice || 0;
  const platformFee = Math.round(price * 0.02 * 100) / 100;
  const totalAmount = price + platformFee;

  const handleExecuteEscrow = async () => {
    if (!user) {
      showToast('Please sign in to execute escrow checkout.', 'error');
      router.push('/login');
      return;
    }

    if (user.id === listing.sellerId) {
      showToast('Anti-Self Trading: You cannot buy your own ticket listing.', 'error');
      return;
    }

    setStep('PROCESSING');
    setEscrowStatus('PAYMENT_RECEIVED');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setEscrowStatus('FUNDS_HELD_IN_ESCROW');

      await new Promise((r) => setTimeout(r, 600));
      setEscrowStatus('TICKET_VERIFICATION');

      const res = await fetch(\`/api/resale/\${listing.id}/pay\`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Escrow transfer failed.');
      }

      setEscrowStatus('TICKET_TRANSFERRED');
      await new Promise((r) => setTimeout(r, 400));
      setEscrowStatus('COMPLETED');
      setStep('COMPLETED');

      showToast('Escrow transfer complete! New dynamic pass added to your vault.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing escrow transaction');
      setStep('REVIEW');
      showToast(err.message || 'Escrow transaction failed.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
        {step !== 'PROCESSING' && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === 'REVIEW' && (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected Escrow Checkout</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Purchase Resale Ticket Pass</h2>
              <p className="text-xs text-slate-400 mt-1">
                {listing.ticket?.event?.title || 'Campus Event Pass'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Host / College:</span>
                <span className="font-semibold text-white">{listing.ticket?.event?.college}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-white">{formatDate(listing.ticket?.event?.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified Seller:</span>
                <span className="font-semibold text-indigo-300">{listing.seller?.name}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Resale Ticket Price:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Escrow Protection Fee (2%):</span>
                <span className="font-mono text-slate-300">{formatCurrency(platformFee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-mono">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero Counterfeit Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Upon confirmation, the seller's QR code is permanently destroyed in the database, and a brand-new cryptographic dynamic QR code is minted exclusively for your account.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteEscrow}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <span>Authorize & Pay {formatCurrency(totalAmount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 'PROCESSING' && (
          <div className="text-center py-8 space-y-6">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-extrabold text-white">Executing Atomic Escrow Transfer...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Holding funds in vault • Invalidating old pass • Minting new cryptographic token
              </p>
            </div>

            <EscrowTimeline status={escrowStatus} />
          </div>
        )}

        {step === 'COMPLETED' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white">Ticket Transfer Complete!</h3>
              <p className="text-xs text-slate-400">
                You are now the verified owner of this campus event pass.
              </p>
            </div>

            <EscrowTimeline status="COMPLETED" />

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  router.push('/tickets');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
              >
                View Pass in My Tickets
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`);

save('src/components/scanner/QRScannerComponent.tsx', `
'use client';

import React, { useState } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, XCircle, Loader2, Sparkles, Search } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function QRScannerComponent() {
  const { showToast } = useToast();
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleValidate = async (tokenToTest?: string) => {
    const targetToken = tokenToTest || tokenInput;
    if (!targetToken.trim()) {
      showToast('Please enter a ticket token or serial number.', 'warning');
      return;
    }

    setIsValidating(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: targetToken }),
      });

      const data = await res.json();
      setScanResult(data);

      if (data.isValid) {
        showToast('Valid Ticket! Entry granted.', 'success');
      } else {
        showToast(data.message || 'Ticket validation failed.', 'error');
      }
    } catch (err) {
      showToast('Validation request failed.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const sampleTokens = [
    { label: 'Demo Active Pass (Alex)', value: 'cc_sec_alex_stanford_hackathon_001' },
    { label: 'Demo Music Fest Pass', value: 'cc_sec_alex_mit_concert_002' },
    { label: 'Fake/Scammer Code', value: 'invalid_scam_token_99999' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Entrance Gate Control
            </span>
            <h2 className="text-xl font-extrabold text-white mt-0.5">Live Pass Validator</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gate Scanner Online</span>
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Scan Optical QR Code or Enter Token String
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Scan or paste token: cc_sec_..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => handleValidate()}
              disabled={isValidating}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Verify Pass</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Quick Demo Scanner Tests
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleTokens.map((sample) => (
              <button
                key={sample.value}
                onClick={() => {
                  setTokenInput(sample.value);
                  handleValidate(sample.value);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-[11px] text-slate-300 font-mono transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {scanResult && (
        <div
          className={\`p-8 rounded-3xl border transition-all animate-in slide-in-from-bottom-3 \${
            scanResult.isValid
              ? 'bg-emerald-950/40 border-emerald-500/50'
              : 'bg-rose-950/40 border-rose-500/50'
          }\`}
        >
          <div className="flex items-start gap-4">
            <div
              className={\`p-3 rounded-2xl shrink-0 \${
                scanResult.isValid
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-rose-500 text-slate-950'
              }\`}
            >
              {scanResult.isValid ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <span
                  className={\`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full \${
                    scanResult.isValid
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                  }\`}
                >
                  {scanResult.code}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1.5">
                  {scanResult.isValid ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{scanResult.message}</p>
              </div>

              {scanResult.ticket && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Attendee</span>
                    <p className="font-bold text-white mt-0.5">{scanResult.ticket.currentOwner?.name}</p>
                    <p className="text-[11px] text-slate-400">{scanResult.ticket.currentOwner?.college}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Event</span>
                    <p className="font-bold text-white mt-0.5 truncate">{scanResult.ticket.event?.title}</p>
                    <p className="text-[11px] text-indigo-400">{scanResult.ticket.category?.name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Ticket Serial</span>
                    <p className="font-mono text-indigo-300 font-bold mt-0.5">{scanResult.ticket.ticketNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log('[PART 2] Completed all Contexts and Components!');

