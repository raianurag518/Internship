const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/app/tickets/page.tsx', `'use client';
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
}`);

save('src/app/tickets/[id]/page.tsx', `'use client';
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
}`);

save('src/app/organizer/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { QrCode, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/organizer/analytics').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.stats) setStats(d.stats);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div><h1 className="text-3xl font-black text-white">Organizer Dashboard</h1><p className="text-xs text-slate-400 mt-1">Host hub for campus events</p></div>
        <div className="flex gap-3">
          <Link href="/organizer/scanner" className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"><QrCode className="w-4 h-4" /><span>Gate Scanner</span></Link>
          <Link href="/organizer/create" className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"><PlusCircle className="w-4 h-4" /><span>Create Event</span></Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold uppercase">Events Hosted</p><p className="text-2xl font-black text-white font-mono mt-1">{stats?.totalEvents || 0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold uppercase">Passes Issued</p><p className="text-2xl font-black text-indigo-400 font-mono mt-1">{stats?.totalTicketsIssued || 0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold uppercase">Check-In Rate</p><p className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats?.checkInRate || 0}%</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-500 font-bold uppercase">Revenue</p><p className="text-2xl font-black text-amber-400 font-mono mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p></div>
      </div>
    </div>
  );
}`);

save('src/app/organizer/create/page.tsx', `'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function CreateEventPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'HACKATHONS', college: 'Stanford University', city: 'Stanford, CA', venue: 'Arrillaga Center',
    startDate: '', endDate: '', basePrice: 0, totalCapacity: 200, tierName: 'General Student Pass', tierPrice: 0, tierQuantity: 200
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: Number(form.basePrice),
          totalCapacity: Number(form.totalCapacity),
          ticketCategories: [{ name: form.tierName, price: Number(form.tierPrice), totalQuantity: Number(form.tierQuantity), maxPerUser: 2 }]
        })
      });
      if (!res.ok) throw new Error('Failed to create event');
      showToast('Event created!', 'success');
      router.push('/organizer');
    } catch (err: any) { showToast(err.message || 'Error', 'error'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h1 className="text-2xl font-black text-white">Create New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title</label><input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
          <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label><textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Start Date</label><input type="datetime-local" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">End Date</label><input type="datetime-local" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs" /></div>
          </div>
          <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Venue</label><input type="text" required value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs" /></div>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}<span>Publish Event</span></button>
        </form>
      </div>
    </div>
  );
}`);

save('src/app/organizer/events/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode } from 'lucide-react';
export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { fetch('/api/organizer/events').then(r => r.json()).then(d => setEvents(d.events || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">All Created Events</h1>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div><p className="font-bold text-white text-base">{e.title}</p><p className="text-xs text-slate-400">{e.venue}</p></div>
            <Link href="/organizer/scanner" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"><QrCode className="w-4 h-4" /><span>Scan</span></Link>
          </div>
        ))}
      </div>
    </div>
  );
}`);

save('src/app/organizer/scanner/page.tsx', `'use client';
import React from 'react';
import QRScannerComponent from '@/components/scanner/QRScannerComponent';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function OrganizerScannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">Gate Admission Scanner</h1>
      <QRScannerComponent />
    </div>
  );
}`);