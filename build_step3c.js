const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/components/tickets/TicketPassCard.tsx', `'use client';
import React from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency, formatDate } from '@/lib/utils';
import { QrCode, Repeat, ShieldCheck, CheckCircle2, Clock, XCircle, Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TicketPassCard({
  ticket, onViewQr, onListResale, onCancelResale
}: {
  ticket: TicketItem; onViewQr?: (t: TicketItem) => void; onListResale?: (t: TicketItem) => void; onCancelResale?: (t: TicketItem) => void;
}) {
  const event = ticket.event;
  const isUsed = ticket.isUsed || ticket.status === 'USED';
  const isListed = ticket.status === 'LISTED_FOR_RESALE';
  const isActive = ticket.status === 'ACTIVE';

  return (
    <div className={'relative overflow-hidden rounded-3xl border transition-all duration-300 ' + (isUsed ? 'bg-slate-900/50 border-slate-800/80 opacity-70' : isListed ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-500/40 shadow-xl' : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-2xl hover:border-indigo-500/50')}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">#{ticket.ticketNumber}</span>
            {isUsed && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Checked In</span></span>}
            {isListed && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full"><Clock className="w-3.5 h-3.5 animate-pulse" /><span>Listed in Clearinghouse</span></span>}
            {isActive && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /><span>Valid Pass</span></span>}
            <span className="text-[11px] font-semibold text-slate-400">Tier: <strong className="text-white">{ticket.category?.name || 'General Pass'}</strong></span>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">{event?.title || 'Campus Event'}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium"><Building2 className="w-3.5 h-3.5 text-slate-500" /><span>{event?.college}</span></p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /><span>{event ? formatDate(event.startDate) : 'TBD'}</span></span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /><span>{event?.venue || 'Campus Venue'}</span></span>
          </div>
        </div>
        <div className="flex md:flex-col items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Face Value</span>
            <p className="text-lg md:text-xl font-extrabold text-white font-mono">{ticket.originalPrice === 0 ? 'FREE' : formatCurrency(ticket.originalPrice)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <>
                <button onClick={() => onViewQr && onViewQr(ticket)} className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-1.5"><QrCode className="w-4 h-4" /><span>Show Pass</span></button>
                <button onClick={() => onListResale && onListResale(ticket)} className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5 text-emerald-400" /><span>Resell (15% Cap)</span></button>
              </>
            )}
            {isListed && (
              <button onClick={() => onCancelResale && onCancelResale(ticket)} className="px-3.5 py-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs transition-all flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /><span>Cancel Listing</span></button>
            )}
            <Link href={'/tickets/' + ticket.id} className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Audit Lineage"><ExternalLink className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}`);

save('src/components/tickets/DynamicQrModal.tsx', `'use client';
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
}`);

save('src/components/tickets/ResaleListModal.tsx', `'use client';
import React, { useState } from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency } from '@/lib/utils';
import { Repeat, ShieldCheck, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ResaleListModal({ ticket, onClose, onSuccess }: { ticket: TicketItem; onClose: () => void; onSuccess?: () => void }) {
  const { showToast } = useToast();
  const [askingPrice, setAskingPrice] = useState<number>(ticket.originalPrice || 0);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const maxAllowedPrice = Math.round(ticket.originalPrice * 1.15 * 100) / 100;
  const isOverCap = askingPrice > maxAllowedPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverCap) { showToast('Price exceeds 15% limit of ' + formatCurrency(maxAllowedPrice), 'error'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets/' + ticket.id + '/list-for-resale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ askingPrice, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to list ticket');
      showToast('Pass successfully listed in P2P Escrow Clearinghouse!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) { showToast(err.message || 'Error listing ticket', 'error'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold uppercase mb-2"><Repeat className="w-3.5 h-3.5" /><span>P2P Escrow Clearinghouse</span></div>
          <h2 className="text-xl font-black text-white">List Pass for Resale</h2>
          <p className="text-xs text-slate-400 mt-0.5">{ticket.event?.title}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400"><span>Face Value:</span><span className="font-bold text-white font-mono">{formatCurrency(ticket.originalPrice)}</span></div>
          <div className="flex justify-between text-emerald-400 font-bold"><span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /><span>15% Max Cap:</span></span><span className="font-mono">{formatCurrency(maxAllowedPrice)}</span></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Your Resale Price ($)</label>
            <input type="number" min="0" max={maxAllowedPrice} step="0.5" required value={askingPrice} onChange={(e) => setAskingPrice(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs font-mono" />
            {isOverCap && <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-semibold"><AlertTriangle className="w-3.5 h-3.5" /><span>Maximum allowed is {formatCurrency(maxAllowedPrice)}</span></p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Schedule clash with midterm" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={isSubmitting || isOverCap} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />}<span>List on Clearinghouse</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`);

save('src/components/escrow/EscrowTimeline.tsx', `'use client';
import React from 'react';
import { EscrowStatus } from '@/types/escrow';
import { CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';

export default function EscrowTimeline({ status }: { status: EscrowStatus | string }) {
  const steps = [
    { id: 'PAYMENT_RECEIVED', label: 'Payment Captured' },
    { id: 'FUNDS_HELD_IN_ESCROW', label: 'Funds Escrowed' },
    { id: 'TICKET_VERIFICATION', label: 'Validating & Re-Minting' },
    { id: 'TICKET_TRANSFERRED', label: 'Ownership Transferred' },
    { id: 'COMPLETED', label: 'Payout Released' },
  ];
  const getStepIndex = (cur: string) => {
    if (cur === 'PAYMENT_RECEIVED') return 1;
    if (cur === 'FUNDS_HELD_IN_ESCROW') return 2;
    if (cur === 'TICKET_VERIFICATION') return 3;
    if (cur === 'TICKET_TRANSFERRED' || cur === 'COMPLETED') return 5;
    return 1;
  };
  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Smart Escrow State Machine</span></span>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">Status: {status}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex - 1 || (currentIndex === 5 && idx === 4);
          return (
            <div key={step.id} className={'p-3 rounded-2xl border text-xs space-y-1.5 transition-all ' + (isDone || isCurrent ? 'bg-indigo-950/40 border-indigo-500/50 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-500')}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : isCurrent ? <Clock className="w-4 h-4 text-indigo-400 animate-pulse" /> : <Circle className="w-3.5 h-3.5 text-slate-600" />}
              </div>
              <p className="font-semibold text-[11px] leading-tight">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}`);

save('src/components/escrow/EscrowCheckoutModal.tsx', `'use client';
import React, { useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShieldCheck, X, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import EscrowTimeline from './EscrowTimeline';

export default function EscrowCheckoutModal({ listing, onClose, onSuccess }: { listing: ResaleListingItem; onClose: () => void; onSuccess?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'REVIEW' | 'PROCESSING' | 'COMPLETED'>('REVIEW');
  const [escrowStatus, setEscrowStatus] = useState<string>('CREATED');
  const price = listing.askingPrice || 0;
  const platformFee = Math.round(price * 0.02 * 100) / 100;
  const totalAmount = price + platformFee;

  const handleExecuteEscrow = async () => {
    if (!user) { showToast('Please sign in to execute escrow checkout.', 'error'); router.push('/login'); return; }
    if (user.id === listing.sellerId) { showToast('Anti-Self Trading: You cannot buy your own ticket listing.', 'error'); return; }

    setStep('PROCESSING');
    setEscrowStatus('PAYMENT_RECEIVED');
    try {
      await new Promise((r) => setTimeout(r, 400));
      setEscrowStatus('FUNDS_HELD_IN_ESCROW');
      await new Promise((r) => setTimeout(r, 400));
      setEscrowStatus('TICKET_VERIFICATION');

      const res = await fetch('/api/resale/' + listing.id + '/pay', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Escrow transfer failed.');

      setEscrowStatus('TICKET_TRANSFERRED');
      await new Promise((r) => setTimeout(r, 300));
      setEscrowStatus('COMPLETED');
      setStep('COMPLETED');
      showToast('Escrow transfer complete! Pass added to your vault.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStep('REVIEW');
      showToast(err.message || 'Escrow transaction failed.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6">
        {step !== 'PROCESSING' && <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>}
        {step === 'REVIEW' && (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold uppercase mb-2"><ShieldCheck className="w-3.5 h-3.5" /><span>Protected Escrow Checkout</span></div>
              <h2 className="text-xl font-extrabold text-white">Purchase Resale Ticket Pass</h2>
              <p className="text-xs text-slate-400 mt-1">{listing.ticket?.event?.title || 'Campus Event Pass'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between"><span className="text-slate-400">Host / College:</span><span className="font-semibold text-white">{listing.ticket?.event?.college}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Verified Seller:</span><span className="font-semibold text-indigo-300">{listing.seller?.name}</span></div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400"><span>Resale Ticket Price:</span><span className="font-bold text-white font-mono">{formatCurrency(price)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Escrow Fee (2%):</span><span className="font-mono text-slate-300">{formatCurrency(platformFee)}</span></div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white"><span>Total Amount:</span><span className="text-emerald-400 font-mono">{formatCurrency(totalAmount)}</span></div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button type="button" onClick={handleExecuteEscrow} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"><span>Authorize & Pay {formatCurrency(totalAmount)}</span><ArrowRight className="w-4 h-4" /></button>
            </div>
          </>
        )}
        {step === 'PROCESSING' && (
          <div className="text-center py-8 space-y-6">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
            <h3 className="text-lg font-extrabold text-white">Executing Atomic Escrow Transfer...</h3>
            <EscrowTimeline status={escrowStatus} />
          </div>
        )}
        {step === 'COMPLETED' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400"><CheckCircle2 className="w-10 h-10" /></div>
            <h3 className="text-2xl font-extrabold text-white">Ticket Transfer Complete!</h3>
            <div className="pt-4 flex justify-center gap-3">
              <button onClick={() => { onClose(); router.push('/tickets'); }} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">View Pass in My Tickets</button>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`);