'use client';
import React, { useEffect, useState } from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';
import DynamicQrModal from '@/components/tickets/DynamicQrModal';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/tickets/' + params.id).then(r => r.ok ? r.json() : null).then(d => { if (d?.ticket) setTicket(d.ticket); });
  }, [params.id]);

  if (!ticket) return <div className="max-w-md mx-auto py-20 text-center text-white"><p>Loading pass...</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/tickets" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /><span>Back to Passes</span></Link>
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-black text-white">Pass #{ticket.ticketNumber}</h1><p className="text-xs text-slate-400">{ticket.event?.title}</p></div>
          {!ticket.isUsed && ticket.status === 'ACTIVE' && (
            <button onClick={() => setIsQrModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"><QrCode className="w-4 h-4" /><span>Show Dynamic QR</span></button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800"><p className="text-slate-500 font-bold">Owner</p><p className="font-bold text-white mt-1">{ticket.currentOwner?.name}</p></div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800"><p className="text-slate-500 font-bold">Price</p><p className="font-bold text-white font-mono mt-1">{formatCurrency(ticket.originalPrice)}</p></div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800"><p className="text-slate-500 font-bold">Status</p><p className="font-bold text-white font-mono mt-1">{ticket.status}</p></div>
        </div>
      </div>
      {isQrModalOpen && <DynamicQrModal ticket={ticket} onClose={() => setIsQrModalOpen(false)} />}
    </div>
  );
}
