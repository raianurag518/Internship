'use client';
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
}
