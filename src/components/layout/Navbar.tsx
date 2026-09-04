'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Repeat, Compass, ShieldAlert, LogOut, QrCode, Bookmark } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navLinks = [
    { href: '/events', label: 'Aggregator', icon: Compass },
    { href: '/resale', label: 'P2P Escrow', icon: Repeat },
  ];
  if (user) navLinks.push({ href: '/tickets', label: 'My Passes', icon: Ticket });
  if (user) navLinks.push({ href: '/saved', label: 'Bookmarks', icon: Bookmark });
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
                Uni<span className="text-indigo-400">Pass</span>
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
