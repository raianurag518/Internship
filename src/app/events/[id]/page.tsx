'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/types/event';
import BookingModal from '@/components/events/BookingModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, MapPin, Building2, Ticket, ArrowLeft, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await fetch('/api/events/' + params.id);
      const data = await res.json();
      if (data.event) setEvent(data.event);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvent(); }, [params.id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20"><div className="h-96 rounded-3xl bg-slate-900 animate-pulse"></div></div>;
  if (!event) return <div className="max-w-md mx-auto px-4 py-20 text-center text-white"><p>Event not found</p><Link href="/events" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-xs font-bold rounded-xl">Back</Link></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /><span>Back to Events</span></Link>
      <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800">
        <Image src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'} alt={event.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-white">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-semibold"><Building2 className="w-4 h-4 text-indigo-400" />{event.college}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-indigo-400" />{formatDate(event.startDate)}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-400" />{event.venue}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase">About Event</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pass Pricing</span>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {event.basePrice === 0 ? 'FREE' : `From ${formatCurrency(event.basePrice)}`}
            </p>
          </div>

          {/* Promotional Discount Badge */}
          {event.discountCode && (
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-purple-300">Host Special Offer</span>
              <p className="text-xs font-bold text-white">
                Use code <span className="font-mono font-black text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded">{event.discountCode}</span>
              </p>
              <p className="text-[10px] text-purple-300">
                Get {event.discountPercent ? `${event.discountPercent}% OFF` : `${formatCurrency(event.discountAmount || 0)} OFF`} on all passes!
              </p>
            </div>
          )}

          {/* Ticket Tiers Overview */}
          {event.ticketCategories && event.ticketCategories.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Available Pass Tiers ({event.ticketCategories.length})
              </span>
              <div className="space-y-1.5">
                {event.ticketCategories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div>
                      <p className="font-bold text-white text-[11px]">{cat.name}</p>
                      <p className="text-[10px] text-emerald-400 font-mono">{cat.availableQuantity} seats</p>
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      {cat.price === 0 ? 'FREE' : formatCurrency(cat.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setIsBookingOpen(true)} className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition hover:scale-105">
            <Ticket className="w-4 h-4" /><span>Reserve Pass</span>
          </button>
        </div>
      </div>
      {isBookingOpen && <BookingModal event={event} onClose={() => setIsBookingOpen(false)} onSuccess={() => fetchEvent()} />}
    </div>
  );
}
