'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventItem } from '@/types/event';
import { ResaleListingItem } from '@/types/escrow';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import EscrowCheckoutModal from '@/components/escrow/EscrowCheckoutModal';
import { Ticket, ShieldCheck, Repeat, Lock, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [activeResales, setActiveResales] = useState<ResaleListingItem[]>([]);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);
  const [selectedResaleForCheckout, setSelectedResaleForCheckout] = useState<ResaleListingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/events?limit=6'), fetch('/api/resale')])
      .then(async ([evRes, resRes]) => {
        const evData = await evRes.json();
        const resData = await resRes.json();
        if (evData.events) setFeaturedEvents(evData.events);
        if (resData.listings) setActiveResales(resData.listings.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Summer 2026 Production Platform • Verified .edu Students Only</span>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
              College Events, Aggregated.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tickets Resold Safely.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Discover hackathons, college fests, and workshops. Resell passes in our P2P escrow clearinghouse with a strict <strong className="text-emerald-400">100% face value price cap</strong> and <strong className="text-indigo-300">dynamic 30s rotating QR passes</strong>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/events" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" /><span>Explore All Events</span>
            </Link>
            <Link href="/resale" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2">
              <Repeat className="w-5 h-5 text-emerald-400" /><span>P2P Clearinghouse (100% Cap)</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-white font-mono">100% Max</p><p className="text-xs text-slate-400 mt-0.5">Face Value Cap</p></div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-indigo-400 font-mono">30s TOTP</p><p className="text-xs text-slate-400 mt-0.5">Rotating Gate Pass</p></div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-emerald-400 font-mono">Atomic</p><p className="text-xs text-slate-400 mt-0.5">Escrow Transfers</p></div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-purple-400 font-mono">.EDU ID</p><p className="text-xs text-slate-400 mt-0.5">College Verified</p></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Campus Aggregator</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Events & Hackathons</h2>
          </div>
          <Link href="/events" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><span>View all</span><ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onBookClick={(e) => setSelectedEventForBooking(e)} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">100% Face Value Capped Escrow</span>
              <h2 className="text-2xl font-extrabold text-white mt-2">P2P Resale Clearinghouse</h2>
            </div>
            <Link href="/resale" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"><span>Explore Resale</span><ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeResales.map((resale) => (
              <div key={resale.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <span className="font-mono text-indigo-400 font-bold text-xs">{resale.ticket?.ticketNumber}</span>
                  <h4 className="font-extrabold text-sm text-white mt-1">{resale.ticket?.event?.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Seller: {resale.seller?.name} ({resale.seller?.college})</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <p className="text-base font-extrabold text-emerald-400 font-mono">{formatCurrency(resale.askingPrice)}</p>
                  <button onClick={() => setSelectedResaleForCheckout(resale)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Escrow Buy</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedEventForBooking && <BookingModal event={selectedEventForBooking} onClose={() => setSelectedEventForBooking(null)} />}
      {selectedResaleForCheckout && <EscrowCheckoutModal listing={selectedResaleForCheckout} onClose={() => setSelectedResaleForCheckout(null)} />}
    </div>
  );
}
