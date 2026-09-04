'use client';
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
}
