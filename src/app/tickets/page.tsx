'use client';
import React, { useEffect, useState } from 'react';
import { TicketItem } from '@/types/ticket';
import TicketPassCard from '@/components/tickets/TicketPassCard';
import DynamicQrModal from '@/components/tickets/DynamicQrModal';
import ResaleListModal from '@/components/tickets/ResaleListModal';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function TicketsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicketForQr, setSelectedTicketForQr] = useState<TicketItem | null>(null);
  const [selectedTicketForResale, setSelectedTicketForResale] = useState<TicketItem | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets/my');
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTickets(); }, [user]);

  const handleCancelResale = async (ticket: TicketItem) => {
    try {
      const res = await fetch('/api/tickets/' + ticket.id + '/cancel-resale', { method: 'POST' });
      if (res.ok) {
        showToast('Resale cancelled', 'success');
        fetchTickets();
      }
    } catch (e) { showToast('Error cancelling resale', 'error'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">My Campus Event Passes</h1>
          <p className="text-xs text-slate-400 mt-1">Single-use dynamic passes with rotating 30s tokens</p>
        </div>
        <Link href="/events" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">Discover More</Link>
      </div>

      <div className="space-y-6">
        {tickets.map((ticket) => (
          <TicketPassCard
            key={ticket.id}
            ticket={ticket}
            onViewQr={(t) => setSelectedTicketForQr(t)}
            onListResale={(t) => setSelectedTicketForResale(t)}
            onCancelResale={(t) => handleCancelResale(t)}
          />
        ))}
      </div>

      {selectedTicketForQr && <DynamicQrModal ticket={selectedTicketForQr} onClose={() => setSelectedTicketForQr(null)} />}
      {selectedTicketForResale && <ResaleListModal ticket={selectedTicketForResale} onClose={() => setSelectedTicketForResale(null)} onSuccess={() => fetchTickets()} />}
    </div>
  );
}
