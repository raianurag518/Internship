const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/app/page.tsx', `'use client';
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
              Discover hackathons, college fests, and workshops. Resell passes in our P2P escrow clearinghouse with a strict <strong className="text-emerald-400">15% anti-scalping price cap</strong> and <strong className="text-indigo-300">dynamic 30s rotating QR passes</strong>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/events" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" /><span>Explore All Events</span>
            </Link>
            <Link href="/resale" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2">
              <Repeat className="w-5 h-5 text-emerald-400" /><span>P2P Clearinghouse (15% Cap)</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-white font-mono">15% Max</p><p className="text-xs text-slate-400 mt-0.5">Anti-Scalping Cap</p></div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-indigo-400 font-mono">30s TOTP</p><p className="text-xs text-slate-400 mt-0.5">Rotating Gate Pass</p></div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-emerald-400 font-mono">Atomic</p><p className="text-xs text-slate-400 mt-0.5">Escrow Transfers</p></div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800"><p className="text-2xl font-black text-purple-400 font-mono">.EDU ID</p><p className="text-xs text-slate-400 mt-0.5">Collegiate Verified</p></div>
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
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">15% Anti-Scalping Capped Escrow</span>
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
}`);

save('src/app/events/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import { EventItem } from '@/types/event';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import { Search, SlidersHorizontal, Compass, Sparkles } from 'lucide-react';

const CATEGORIES = ['ALL', 'HACKATHONS', 'TECHNICAL', 'CULTURAL', 'MUSIC', 'SPORTS', 'WORKSHOPS', 'ENTREPRENEURSHIP', 'COMPETITIONS'];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_asc');
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);
      const res = await fetch('/api/events?' + params.toString());
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono mb-2"><Compass className="w-3.5 h-3.5" /><span>Multi-College Event Aggregator</span></div>
          <h1 className="text-3xl font-black text-white tracking-tight">Discover Campus Events & Hackathons</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(); }} className="w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, colleges..." className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs" />
          </div>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ' + (selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800')}>{cat.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <option value="date_asc">Date: Upcoming First</option>
            <option value="date_desc">Date: Furthest Out</option>
            <option value="price_asc">Price: Lowest to Highest</option>
            <option value="price_desc">Price: Highest to Lowest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-80 bg-slate-900 rounded-3xl animate-pulse"></div>)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} onBookClick={(e) => setSelectedEventForBooking(e)} />
          ))}
        </div>
      )}

      {selectedEventForBooking && <BookingModal event={selectedEventForBooking} onClose={() => setSelectedEventForBooking(null)} onSuccess={() => fetchEvents()} />}
    </div>
  );
}`);

save('src/app/events/[id]/page.tsx', `'use client';
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
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <p className="text-2xl font-black text-white font-mono">{event.basePrice === 0 ? 'FREE' : formatCurrency(event.basePrice)}</p>
          <button onClick={() => setIsBookingOpen(true)} className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2">
            <Ticket className="w-4 h-4" /><span>Reserve Pass</span>
          </button>
        </div>
      </div>
      {isBookingOpen && <BookingModal event={event} onClose={() => setIsBookingOpen(false)} onSuccess={() => fetchEvent()} />}
    </div>
  );
}`);

save('src/app/resale/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import EscrowCheckoutModal from '@/components/escrow/EscrowCheckoutModal';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Search, Building2, Lock } from 'lucide-react';

export default function ResalePage() {
  const [listings, setListings] = useState<ResaleListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<ResaleListingItem | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      const res = await fetch('/api/resale?' + params.toString());
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase"><ShieldCheck className="w-3.5 h-3.5" /><span>Fair P2P Clearinghouse • 15% Price Cap Guarantee</span></div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Student Ticket Resale & Escrow Vault</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-indigo-400 font-bold text-xs">#{listing.ticket?.ticketNumber}</span>
              <h3 className="font-extrabold text-base text-white mt-1">{listing.ticket?.event?.title}</h3>
              <p className="text-xs text-slate-400">{listing.ticket?.event?.college}</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(listing.askingPrice)}</p>
              <button onClick={() => setSelectedListing(listing)} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /><span>Escrow Buy</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedListing && <EscrowCheckoutModal listing={selectedListing} onClose={() => setSelectedListing(null)} onSuccess={() => fetchListings()} />}
    </div>
  );
}`);

save('src/app/dashboard/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TicketItem } from '@/types/ticket';
import TicketPassCard from '@/components/tickets/TicketPassCard';
import DynamicQrModal from '@/components/tickets/DynamicQrModal';
import ResaleListModal from '@/components/tickets/ResaleListModal';
import { Ticket, Repeat, Bookmark, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicketForQr, setSelectedTicketForQr] = useState<TicketItem | null>(null);
  const [selectedTicketForResale, setSelectedTicketForResale] = useState<TicketItem | null>(null);

  useEffect(() => {
    fetch('/api/tickets/my').then(r => r.ok ? r.json() : null).then(d => { if (d?.tickets) setTickets(d.tickets); });
  }, [user]);

  const activeTickets = tickets.filter((t) => !t.isUsed && t.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">Verified Student</span>
          <h1 className="text-3xl font-black text-white mt-1">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-400">{user?.college}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Active Passes</p><p className="text-2xl font-black text-white font-mono mt-1">{activeTickets.length}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Trust Rating</p><p className="text-2xl font-black text-amber-400 font-mono mt-1">⭐ {user?.trustRating || 5.0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Total Trades</p><p className="text-2xl font-black text-emerald-400 font-mono mt-1">{user?.totalTrades || 0}</p></div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800"><p className="text-xs text-slate-400 uppercase font-bold">Total Passes</p><p className="text-2xl font-black text-indigo-400 font-mono mt-1">{tickets.length}</p></div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">Active Entrance Passes</h2>
        {activeTickets.map((t) => (
          <TicketPassCard key={t.id} ticket={t} onViewQr={(tkt) => setSelectedTicketForQr(tkt)} onListResale={(tkt) => setSelectedTicketForResale(tkt)} />
        ))}
      </div>
      {selectedTicketForQr && <DynamicQrModal ticket={selectedTicketForQr} onClose={() => setSelectedTicketForQr(null)} />}
      {selectedTicketForResale && <ResaleListModal ticket={selectedTicketForResale} onClose={() => setSelectedTicketForResale(null)} onSuccess={() => { fetch('/api/tickets/my').then(r => r.json()).then(d => setTickets(d.tickets)); }} />}
    </div>
  );
}`);

save('src/app/profile/page.tsx', `'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, Building2 } from 'lucide-react';
export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">Student Profile</h1>
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white">{user?.name?.charAt(0) || 'U'}</div>
          <div><h2 className="text-xl font-extrabold text-white">{user?.name}</h2><p className="text-xs text-slate-400 font-mono">{user?.email}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-500 font-bold uppercase">Affiliated College</span><p className="font-bold text-white mt-1">{user?.college}</p></div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800"><span className="text-slate-500 font-bold uppercase">Role</span><p className="font-bold text-indigo-400 mt-1">{user?.role}</p></div>
        </div>
      </div>
    </div>
  );
}`);

save('src/app/saved/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import { EventItem } from '@/types/event';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import { Bookmark } from 'lucide-react';

export default function SavedEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);

  const fetchSaved = async () => {
    const res = await fetch('/api/saved-events');
    const data = await res.json();
    if (data.events) setEvents(data.events);
  };
  useEffect(() => { fetchSaved(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">Saved Campus Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <EventCard key={evt.id} event={evt} onBookClick={(e) => setSelectedEventForBooking(e)} onBookmarkToggle={() => fetchSaved()} />
        ))}
      </div>
      {selectedEventForBooking && <BookingModal event={selectedEventForBooking} onClose={() => setSelectedEventForBooking(null)} onSuccess={() => fetchSaved()} />}
    </div>
  );
}`);

save('src/app/my-listings/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import { formatCurrency } from '@/lib/utils';
import { Repeat } from 'lucide-react';
export default function MyListingsPage() {
  const [listings, setListings] = useState<ResaleListingItem[]>([]);
  useEffect(() => { fetch('/api/resale').then(r => r.json()).then(d => setListings(d.listings || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">My Active Resale Listings</h1>
      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div><p className="font-bold text-white text-base">{l.ticket?.event?.title}</p><p className="text-xs text-slate-400">{l.ticket?.event?.college}</p></div>
            <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(l.askingPrice)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`);

save('src/app/transactions/page.tsx', `'use client';
import React, { useEffect, useState } from 'react';
import { TransactionItem } from '@/types/escrow';
import { formatCurrency, formatDate } from '@/lib/utils';
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  useEffect(() => { fetch('/api/admin/transactions').then(r => r.json()).then(d => setTransactions(d.transactions || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">Escrow Transaction History</h1>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
            <div><p className="font-mono text-indigo-400 font-bold">{tx.transactionNumber}</p><p className="text-sm font-bold text-white">{tx.ticket?.event?.title}</p></div>
            <p className="text-base font-extrabold text-emerald-400 font-mono">{formatCurrency(tx.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`);