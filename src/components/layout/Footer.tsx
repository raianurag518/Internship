import React from 'react';
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
              <span className="font-extrabold text-white text-base tracking-tight">UniPass</span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              Summer 2026 Production Project: Multi-Platform College Event Aggregator & Secure Ticket Escrow Clearinghouse. Engineered with cryptographic 30s Dynamic TOTP tokens and a strict 100% face value anti-scalping cap.
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
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Face Value Engine</p>
              <p className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" /> 30s Dynamic TOTP Passes</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> College .EDU Verification</p>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 UniPass. B.Tech Computer Science Summer Internship Project.</p>
          <p className="flex items-center gap-1">Built with Next.js, Prisma, Tailwind CSS, and Dynamic HMAC TOTP.</p>
        </div>
      </div>
    </footer>
  );
}
