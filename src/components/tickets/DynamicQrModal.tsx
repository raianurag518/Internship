'use client';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TicketItem } from '@/types/ticket';
import { generateDynamicTotpToken } from '@/lib/crypto';
import { ShieldCheck, Lock, X } from 'lucide-react';

export default function DynamicQrModal({ ticket, onClose }: { ticket: TicketItem; onClose: () => void }) {
  const [totpToken, setTotpToken] = useState<string>('000000');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const secret = ticket.dynamicSecret || 'JBSWY3DPEHPK3PXP';

  useEffect(() => {
    const updateToken = () => {
      const { token, remainingSeconds } = generateDynamicTotpToken(secret);
      setTotpToken(token);
      setSecondsRemaining(remainingSeconds);
    };
    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  const qrPayload = ticket.qrToken + ':' + totpToken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-center space-y-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /><span>Anti-Screenshot Dynamic Pass</span>
          </div>
          <h3 className="text-lg font-black text-white">{ticket.event?.title || 'Campus Pass'}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Serial: #{ticket.ticketNumber}</p>
        </div>
        <div className="relative p-6 bg-white rounded-3xl mx-auto inline-block shadow-2xl border-4 border-indigo-500/20">
          <QRCodeSVG value={qrPayload} size={200} level="H" includeMargin={false} />
        </div>
        <div className="flex items-center justify-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center font-mono text-xs font-extrabold text-white">{secondsRemaining}s</div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rotating Gate Token:</span>
            <span className="font-mono text-lg font-black text-indigo-300 tracking-widest">{totpToken}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><Lock className="w-3.5 h-3.5 text-indigo-400" /><span>Present live pass at gate. Screenshots expire in 30s.</span></div>
      </div>
    </div>
  );
}
