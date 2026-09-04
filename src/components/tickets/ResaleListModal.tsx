'use client';
import React, { useState } from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency } from '@/lib/utils';
import { Repeat, ShieldCheck, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ResaleListModal({ ticket, onClose, onSuccess }: { ticket: TicketItem; onClose: () => void; onSuccess?: () => void }) {
  const { showToast } = useToast();
  const [askingPrice, setAskingPrice] = useState<number | string>(ticket.originalPrice || '');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const maxAllowedPrice = Math.round(ticket.originalPrice * 1.00 * 100) / 100;
  const numAskingPrice = askingPrice === '' ? 0 : Number(askingPrice);
  const isOverCap = numAskingPrice > maxAllowedPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverCap) { showToast('Price exceeds 100% purchase value limit of ' + formatCurrency(maxAllowedPrice), 'error'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets/' + ticket.id + '/list-for-resale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ askingPrice: numAskingPrice, note }),
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
          <div className="flex justify-between text-emerald-400 font-bold"><span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /><span>100% Max Cap:</span></span><span className="font-mono">{formatCurrency(maxAllowedPrice)}</span></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Your Resale Price (₹)</label>
            <input type="number" min="0" max={maxAllowedPrice} step="0.5" required value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs font-mono" />
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
}
