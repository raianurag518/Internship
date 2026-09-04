const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`[PART 4] Wrote ${relPath} (${content.length} chars)`);
}

// -------------------------------------------------------------
// App Pages
// -------------------------------------------------------------
save('src/app/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventItem } from '@/types/event';
import { ResaleListingItem } from '@/types/escrow';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import EscrowCheckoutModal from '@/components/escrow/EscrowCheckoutModal';
import {
  Ticket,
  ShieldCheck,
  Repeat,
  Lock,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sparkles,
  Users,
  Building2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [activeResales, setActiveResales] = useState<ResaleListingItem[]>([]);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);
  const [selectedResaleForCheckout, setSelectedResaleForCheckout] =
    useState<ResaleListingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, resalesRes] = await Promise.all([
          fetch('/api/events?limit=6'),
          fetch('/api/resale'),
        ]);

        const eventsData = await eventsRes.json();
        const resalesData = await resalesRes.json();

        if (eventsData.events) setFeaturedEvents(eventsData.events);
        if (resalesData.listings) setActiveResales(resalesData.listings.slice(0, 3));
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md animate-in fade-in">
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
              Discover hackathons, college fests, and workshops. If plans change, resell passes
              in our P2P escrow clearinghouse with a strict{' '}
              <strong className="text-emerald-400">15% anti-scalping price cap</strong> and{' '}
              <strong className="text-indigo-300">dynamic 30s rotating QR passes</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5" />
              <span>Explore All Events</span>
            </Link>
            <Link
              href="/resale"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Repeat className="w-5 h-5 text-emerald-400" />
              <span>P2P Clearinghouse (15% Cap)</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-white font-mono">15% Max</p>
              <p className="text-xs text-slate-400 mt-0.5">Anti-Scalping Price Cap</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-indigo-400 font-mono">30s TOTP</p>
              <p className="text-xs text-slate-400 mt-0.5">Rotating Gate Pass</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-emerald-400 font-mono">Atomic</p>
              <p className="text-xs text-slate-400 mt-0.5">Smart Escrow Transfers</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <p className="text-2xl font-black text-purple-400 font-mono">.EDU ID</p>
              <p className="text-xs text-slate-400 mt-0.5">Collegiate Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Campus Aggregator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Featured Events & Hackathons
            </h2>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View all campus events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-900/50 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onBookClick={(evt) => setSelectedEventForBooking(evt)}
              />
            ))}
          </div>
        )}
      </section>

      {/* P2P Resale Clearinghouse Live Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                15% Anti-Scalping Capped Escrow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                P2P Resale Clearinghouse
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Students resell spare passes at fair prices. Our escrow engine holds payments until
                the ticket is atomically transferred and a new QR token is minted.
              </p>
            </div>
            <Link
              href="/resale"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Explore Resale Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeResales.map((resale) => (
              <div
                key={resale.id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-emerald-500/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-indigo-400 font-bold">
                      {resale.ticket?.ticketNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-bold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white line-clamp-1">
                    {resale.ticket?.event?.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Seller: <strong className="text-slate-300">{resale.seller?.name}</strong> (
                    {resale.seller?.college})
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Price</span>
                    <p className="text-base font-extrabold text-emerald-400 font-mono">
                      {formatCurrency(resale.askingPrice)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResaleForCheckout(resale)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Escrow Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Engineered For Trust
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            End-to-End Collegiate Security Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">15% Anti-Scalping Markup Cap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resale prices are hardcoded in backend transaction logic to never exceed 115% of the
              original face value. Black market scalping is mathematically impossible.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dynamic 30-Second TOTP Passes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ticket QR codes refresh every 30 seconds with HMAC SHA-256 signatures, rendering
              screenshots, duplicate printouts, and counterfeit codes invalid at the gate.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Atomic Escrow Transfers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Funds are held safely in escrow during transfer. The seller's QR code is invalidated
              instantly as a new pass is minted to the buyer in a single database transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
        />
      )}

      {/* Resale Escrow Checkout Modal */}
      {selectedResaleForCheckout && (
        <EscrowCheckoutModal
          listing={selectedResaleForCheckout}
          onClose={() => setSelectedResaleForCheckout(null)}
        />
      )}
    </div>
  );
}
`);

save('src/app/events/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { EventItem } from '@/types/event';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import { Search, SlidersHorizontal, Compass, Sparkles, Filter } from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'HACKATHONS',
  'TECHNICAL',
  'CULTURAL',
  'MUSIC',
  'SPORTS',
  'WORKSHOPS',
  'ENTREPRENEURSHIP',
  'COMPETITIONS',
];

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

      const res = await fetch(\`/api/events?\${params.toString()}\`);
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-medium mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Multi-College Event Aggregator</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Discover Campus Events & Hackathons
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live aggregated listings from top university portals, student councils, and technical
            societies.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, colleges, venues..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Horizontal Category Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all \${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                {cat.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date_asc">Date: Upcoming First</option>
            <option value="date_desc">Date: Furthest Out</option>
            <option value="price_asc">Price: Lowest to Highest</option>
            <option value="price_desc">Price: Highest to Lowest</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-900/50 animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No campus events match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try choosing a different category or clearing your search filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onBookClick={(evt) => setSelectedEventForBooking(evt)}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
          onSuccess={() => fetchEvents()}
        />
      )}
    </div>
  );
}
`);

save('src/app/events/[id]/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/types/event';
import BookingModal from '@/components/events/BookingModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Building2,
  Ticket,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Bookmark,
  Users,
} from 'lucide-react';
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
      const res = await fetch(\`/api/events/\${params.id}\`);
      const data = await res.json();
      if (data.event) setEvent(data.event);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const handleBookmark = async () => {
    if (!user) {
      showToast('Please sign in to bookmark events', 'info');
      return;
    }

    try {
      const res = await fetch(\`/api/events/\${params.id}/bookmark\`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(data.isSaved ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success');
        fetchEvent();
      }
    } catch (err) {
      showToast('Failed to bookmark', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-6">
        <div className="h-96 rounded-3xl bg-slate-900 animate-pulse"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Event not found</h2>
        <Link
          href="/events"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Discovery</span>
      </Link>

      {/* Banner */}
      <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800">
        <Image
          src={
            event.bannerUrl ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'
          }
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/40 font-mono">
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 font-mono">
              Featured Event
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className="p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Bookmark className={\`w-4 h-4 \${event.isSaved ? 'fill-amber-400 text-amber-400' : ''}\`} />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-semibold">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {event.college}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              {event.venue}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description and Agenda */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              About This Event
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Available Pass Tiers
            </h3>
            <div className="space-y-3">
              {event.ticketCategories?.map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-white">{tier.name}</span>
                    {tier.description && (
                      <p className="text-xs text-slate-400">{tier.description}</p>
                    )}
                    <p className="text-[11px] text-emerald-400 font-mono">
                      {tier.availableQuantity} spots remaining
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-white font-mono">
                      {tier.price === 0 ? 'FREE' : formatCurrency(tier.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Summary Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 sticky top-24">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Registration Pass
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {event.basePrice === 0 ? 'FREE' : formatCurrency(event.basePrice)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Capacity:</span>
                <span className="font-mono text-white font-bold">{event.totalCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Seats:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {event.availableSeats > 0 ? event.availableSeats : 'Sold Out'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organizer:</span>
                <span className="text-indigo-300 font-semibold">{event.organizer?.name}</span>
              </div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              disabled={isSoldOut}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{isSoldOut ? 'Sold Out' : 'Reserve Event Pass'}</span>
            </button>

            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-indigo-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Anti-Scalping Protected</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Purchased passes are transferable via our 15% capped P2P Escrow Clearinghouse.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isBookingOpen && (
        <BookingModal
          event={event}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={() => fetchEvent()}
        />
      )}
    </div>
  );
}
`);

save('src/app/resale/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import EscrowCheckoutModal from '@/components/escrow/EscrowCheckoutModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Repeat,
  ShieldCheck,
  Search,
  Building2,
  Calendar,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

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

      const res = await fetch(\`/api/resale?\${params.toString()}\`);
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fair P2P Clearinghouse • 15% Price Cap Guarantee</span>
        </div>
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Student Ticket Resale & Escrow Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Buy legitimate spare event passes from verified collegiate students. Every ticket is
            guaranteed valid through atomic QR re-minting and strict anti-scalping price caps.
          </p>
        </div>

        {/* Search Bar */}
        <div className="pt-2 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
              placeholder="Search resale passes by event or college..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No active resale passes right now</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Check back soon or explore primary event bookings.
          </p>
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const markup =
              listing.originalPrice > 0
                ? (
                    ((listing.askingPrice - listing.originalPrice) / listing.originalPrice) *
                    100
                  ).toFixed(0)
                : '0';

            return (
              <div
                key={listing.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all p-6 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {listing.ticket?.ticketNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-bold font-mono">
                      +{markup}% Markup (Under 15% Cap)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white line-clamp-1">
                      {listing.ticket?.event?.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{listing.ticket?.event?.college}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Face Value:</span>
                      <span className="font-mono text-white">
                        {formatCurrency(listing.originalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Verified Seller:</span>
                      <span className="font-semibold text-indigo-300">{listing.seller?.name}</span>
                    </div>
                    {listing.note && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                        "{listing.note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      Resale Price
                    </span>
                    <p className="text-xl font-black text-emerald-400 font-mono">
                      {formatCurrency(listing.askingPrice)}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Escrow Buy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Escrow Checkout Modal */}
      {selectedListing && (
        <EscrowCheckoutModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={() => fetchListings()}
        />
      )}
    </div>
  );
}
`);

save('src/app/tickets/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { TicketItem } from '@/types/ticket';
import TicketPassCard from '@/components/tickets/TicketPassCard';
import DynamicQrModal from '@/components/tickets/DynamicQrModal';
import ResaleListModal from '@/components/tickets/ResaleListModal';
import { Ticket, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function TicketsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketForQr, setSelectedTicketForQr] = useState<TicketItem | null>(null);
  const [selectedTicketForResale, setSelectedTicketForResale] = useState<TicketItem | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets/my');
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCancelResale = async (ticket: TicketItem) => {
    try {
      const res = await fetch(\`/api/tickets/\${ticket.id}/cancel-resale\`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Resale listing cancelled. Pass returned to active state.', 'success');
        fetchTickets();
      } else {
        showToast(data.message || 'Failed to cancel listing', 'error');
      }
    } catch (err) {
      showToast('Error cancelling resale', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-medium mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Personal Digital Pass Vault</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Campus Event Passes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your single-use dynamic passes with rotating 30s tokens or list spare passes for
            resale.
          </p>
        </div>

        <Link
          href="/events"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          Discover More Events
        </Link>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your ticket vault is currently empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Book passes for upcoming hackathons, guest lectures, and campus fests.
          </p>
          <Link
            href="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            Explore Events
          </Link>
        </div>
      ) : (
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
      )}

      {/* Dynamic QR Code Modal */}
      {selectedTicketForQr && (
        <DynamicQrModal
          ticket={selectedTicketForQr}
          onClose={() => setSelectedTicketForQr(null)}
        />
      )}

      {/* Resale List Modal */}
      {selectedTicketForResale && (
        <ResaleListModal
          ticket={selectedTicketForResale}
          onClose={() => setSelectedTicketForResale(null)}
          onSuccess={() => fetchTickets()}
        />
      )}
    </div>
  );
}
`);

save('src/app/tickets/[id]/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Ticket,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Building2,
  Clock,
  History,
  QrCode,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import DynamicQrModal from '@/components/tickets/DynamicQrModal';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    fetch(\`/api/tickets/\${params.id}\`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ticket) setTicket(data.ticket);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="h-96 rounded-3xl bg-slate-900 animate-pulse"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Ticket not found</h2>
        <Link
          href="/tickets"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Tickets Vault</span>
      </Link>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Verified Digital Asset Lineage
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Pass #{ticket.ticketNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{ticket.event?.title}</p>
          </div>

          <div className="flex items-center gap-2">
            {!ticket.isUsed && ticket.status === 'ACTIVE' && (
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Show Dynamic QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Current Owner</span>
            <p className="font-bold text-white">{ticket.currentOwner?.name}</p>
            <p className="text-[11px] text-indigo-400">{ticket.currentOwner?.college}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Original Price</span>
            <p className="font-bold text-white font-mono">{formatCurrency(ticket.originalPrice)}</p>
            <p className="text-[11px] text-emerald-400">Tier: {ticket.category?.name}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Status</span>
            <p className="font-bold text-white font-mono">{ticket.status}</p>
            <p className="text-[11px] text-slate-400">
              {ticket.isUsed ? \`Used at \${formatDate(ticket.usedAt!)}\` : 'Valid for admission'}
            </p>
          </div>
        </div>

        {/* Cryptographic Security Details */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Cryptographic Security Parameters</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Base Token Digest:</span>
              <span className="text-indigo-300 truncate max-w-[300px]">{ticket.qrToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TOTP Rotation Window:</span>
              <span className="text-emerald-400">30 Seconds (HMAC-SHA256)</span>
            </div>
          </div>
        </div>

        {/* Ownership Lineage History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Immutable Ownership History Chain
            </h3>
          </div>

          <div className="space-y-2">
            {ticket.ownershipHistory && ticket.ownershipHistory.length > 0 ? (
              ticket.ownershipHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-white font-mono text-[11px]">
                      Step 0{idx + 1}: {item.transferType}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Transferred at {formatDate(item.transferredAt)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-indigo-300">
                    {formatCurrency(item.transferPrice)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No previous transfer records.</p>
            )}
          </div>
        </div>
      </div>

      {isQrModalOpen && (
        <DynamicQrModal ticket={ticket} onClose={() => setIsQrModalOpen(false)} />
      )}
    </div>
  );
}
`);

save('src/app/my-listings/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Repeat, ShieldCheck, XCircle, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function MyListingsPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<ResaleListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const res = await fetch('/api/resale');
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleCancelListing = async (listing: ResaleListingItem) => {
    try {
      const res = await fetch(\`/api/tickets/\${listing.ticketId}/cancel-resale\`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Resale listing cancelled. Ticket returned to active status.', 'success');
        fetchMyListings();
      } else {
        showToast(data.message || 'Failed to cancel listing', 'error');
      }
    } catch (err) {
      showToast('Error cancelling listing', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-medium mb-2">
          <Repeat className="w-3.5 h-3.5" />
          <span>Student Resale Manager</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          My Active Resale Listings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your passes currently offered in the P2P Escrow Clearinghouse.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <Sparkles className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active resale listings</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You can list any unused passes from your ticket vault.
          </p>
          <Link
            href="/tickets"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Go to My Passes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {listing.ticket?.ticketNumber}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    Status: {listing.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white">
                  {listing.ticket?.event?.title}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{listing.ticket?.event?.college}</span>
                </p>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Asking Price
                  </span>
                  <p className="text-xl font-extrabold text-white font-mono">
                    {formatCurrency(listing.askingPrice)}
                  </p>
                </div>

                {listing.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCancelListing(listing)}
                    className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Listing</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

save('src/app/saved/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { EventItem } from '@/types/event';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import { Bookmark, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SavedEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved-events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-mono font-medium mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Personal Bookmarks</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Saved Campus Events</h1>
        <p className="text-xs text-slate-400 mt-1">
          Events and hackathons you have bookmarked for later registration.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No saved events yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any event card to save it here.
          </p>
          <Link
            href="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onBookClick={(evt) => setSelectedEventForBooking(evt)}
              onBookmarkToggle={() => fetchSaved()}
            />
          ))}
        </div>
      )}

      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
          onSuccess={() => fetchSaved()}
        />
      )}
    </div>
  );
}
`);

save('src/app/transactions/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { TransactionItem } from '@/types/escrow';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Repeat, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/transactions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.transactions) setTransactions(data.transactions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-medium mb-2">
          <Repeat className="w-3.5 h-3.5" />
          <span>Ledger & Escrow Settlement Records</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Escrow Transaction History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically audited records of all secondary market ticket settlements.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-900 animate-pulse"></div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
          <p className="text-sm font-bold text-white">No completed escrow transactions yet</p>
          <p className="text-xs text-slate-400">
            Transactions will appear here when you buy or sell via the P2P clearinghouse.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">
                    {tx.transactionNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                    {tx.transactionStatus}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">
                  {tx.ticket?.event?.title || 'Campus Event Pass'}
                </h4>
                <p className="text-slate-400">
                  Buyer: <strong className="text-slate-300">{tx.buyer?.name}</strong> • Seller:{' '}
                  <strong className="text-slate-300">{tx.seller?.name}</strong>
                </p>
              </div>

              <div className="text-right self-end sm:self-auto">
                <span className="font-mono font-black text-emerald-400 text-base">
                  {formatCurrency(tx.amount)}
                </span>
                <p className="text-[10px] text-slate-500 font-mono">
                  Platform Fee: {formatCurrency(tx.platformFee)}
                </p>
                <p className="text-[10px] text-slate-500">{formatDate(tx.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

save('src/app/dashboard/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TicketItem } from '@/types/ticket';
import TicketPassCard from '@/components/tickets/TicketPassCard';
import DynamicQrModal from '@/components/tickets/DynamicQrModal';
import ResaleListModal from '@/components/tickets/ResaleListModal';
import {
  Ticket,
  Repeat,
  ShieldCheck,
  Bookmark,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketForQr, setSelectedTicketForQr] = useState<TicketItem | null>(null);
  const [selectedTicketForResale, setSelectedTicketForResale] = useState<TicketItem | null>(null);

  useEffect(() => {
    fetch('/api/tickets/my')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tickets) setTickets(data.tickets);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const activeTickets = tickets.filter((t) => !t.isUsed && t.status === 'ACTIVE');
  const listedTickets = tickets.filter((t) => t.status === 'LISTED_FOR_RESALE');
  const usedTickets = tickets.filter((t) => t.isUsed || t.status === 'USED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Welcome Header */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
              Verified Student Account
            </span>
            <span className="text-xs text-indigo-300 font-mono">
              ⭐ {user?.trustRating || 5.0} Trust Score
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {user?.college} • Student ID: {user?.studentId || 'N/A'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            Find New Events
          </Link>
          <Link
            href="/resale"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            P2P Clearinghouse
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Active Digital Passes
          </span>
          <p className="text-2xl font-black text-white font-mono">{activeTickets.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Listed for Resale
          </span>
          <p className="text-2xl font-black text-amber-400 font-mono">{listedTickets.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Events Attended
          </span>
          <p className="text-2xl font-black text-indigo-400 font-mono">{usedTickets.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Total P2P Trades
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {user?.totalTrades || 0}
          </p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/tickets"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300">
            Digital Pass Vault
          </h3>
          <p className="text-xs text-slate-400">
            Generate rotating 30-second Dynamic QR codes for entrance gate scanning.
          </p>
        </Link>

        <Link
          href="/my-listings"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400">
            <Repeat className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300">
            My Resale Listings
          </h3>
          <p className="text-xs text-slate-400">
            Track passes you have listed in the 15% capped P2P Escrow Clearinghouse.
          </p>
        </Link>

        <Link
          href="/saved"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-amber-300">
            Saved Bookmarks
          </h3>
          <p className="text-xs text-slate-400">
            View upcoming hackathons and events bookmarked for future participation.
          </p>
        </Link>
      </div>

      {/* Recent Passes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-white">Active Entrance Passes</h2>
          <Link href="/tickets" className="text-xs text-indigo-400 font-bold hover:underline">
            View All ({tickets.length})
          </Link>
        </div>

        {activeTickets.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">No active passes available right now.</p>
            <Link
              href="/events"
              className="inline-block text-xs font-bold text-indigo-400 hover:underline"
            >
              Explore and book events →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTickets.slice(0, 2).map((ticket) => (
              <TicketPassCard
                key={ticket.id}
                ticket={ticket}
                onViewQr={(t) => setSelectedTicketForQr(t)}
                onListResale={(t) => setSelectedTicketForResale(t)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTicketForQr && (
        <DynamicQrModal
          ticket={selectedTicketForQr}
          onClose={() => setSelectedTicketForQr(null)}
        />
      )}

      {selectedTicketForResale && (
        <ResaleListModal
          ticket={selectedTicketForResale}
          onClose={() => setSelectedTicketForResale(null)}
          onSuccess={() => {
            fetch('/api/tickets/my')
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (data?.tickets) setTickets(data.tickets);
              });
          }}
        />
      )}
    </div>
  );
}
`);

save('src/app/profile/page.tsx', `
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, Mail, Building2, Award, Repeat } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-medium mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Collegiate Identity & Reputation</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Your verified university identity parameters and P2P clearinghouse trust metrics.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-600/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Affiliated University
            </span>
            <p className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>{user?.college}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Student Roll / ID</span>
            <p className="font-bold text-white font-mono">{user?.studentId || 'SU-2024-8891'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Verification Status
            </span>
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{user?.verificationStatus || 'VERIFIED'} (Academic .edu)</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Account Role</span>
            <p className="font-bold text-indigo-300 font-mono">{user?.role || 'STUDENT'}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white">Trust & Escrow Reputation</h3>
            <p className="text-xs text-slate-400">
              Calculated dynamically from verified gate check-ins and zero dispute secondary trades.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400 font-mono">
              ⭐ {user?.trustRating || 5.0} / 5.0
            </span>
            <p className="text-[10px] text-slate-500 font-mono">
              {user?.totalTrades || 0} Successful Trades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

save('src/app/organizer/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Ticket,
  Users,
  TrendingUp,
  QrCode,
  PlusCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/organizer/analytics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats(data.stats);
          setEvents(data.events || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-medium mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Event Host & Gate Controller Hub</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Organizer Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your campus event registrations, monitor gate check-in rates, and scan passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/organizer/scanner"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Gate Scanner</span>
          </Link>
          <Link
            href="/organizer/create"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Event</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Total Hosted Events
          </span>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalEvents || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Passes Issued
          </span>
          <p className="text-2xl font-black text-indigo-400 font-mono">
            {stats?.totalTicketsIssued || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Gate Check-In Rate
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {stats?.checkInRate || 0}%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Gross Ticket Value
          </span>
          <p className="text-2xl font-black text-purple-400 font-mono">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>
      </div>

      {/* Hosted Events List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-white">Your Managed Events</h2>
          <Link
            href="/organizer/create"
            className="text-xs font-bold text-indigo-400 hover:underline"
          >
            + Create Another Event
          </Link>
        </div>

        <div className="space-y-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {evt.category}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(evt.startDate)}</span>
                </div>
                <h3 className="font-extrabold text-base text-white">{evt.title}</h3>
                <p className="text-xs text-slate-400">
                  Venue: {evt.venue} • Capacity: {evt.totalCapacity}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Registered Students
                  </span>
                  <p className="text-base font-extrabold text-emerald-400 font-mono">
                    {evt.tickets?.length || 0} / {evt.totalCapacity}
                  </p>
                </div>

                <Link
                  href="/organizer/scanner"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scan Passes</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

save('src/app/organizer/create/page.tsx', `
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { PlusCircle, Trash2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'HACKATHONS',
    college: 'Stanford University',
    city: 'Stanford, CA',
    venue: '',
    bannerUrl: '',
    startDate: '',
    endDate: '',
    basePrice: 0,
    totalCapacity: 200,
    ticketCategories: [
      {
        name: 'General Student Pass',
        description: 'Standard admission',
        price: 0,
        totalQuantity: 200,
        maxPerUser: 2,
      },
    ],
  });

  const handleAddTier = () => {
    setForm({
      ...form,
      ticketCategories: [
        ...form.ticketCategories,
        {
          name: 'VIP Developer Pass',
          description: 'Special access',
          price: 20,
          totalQuantity: 50,
          maxPerUser: 2,
        },
      ],
    });
  };

  const handleRemoveTier = (idx: number) => {
    if (form.ticketCategories.length <= 1) return;
    const updated = [...form.ticketCategories];
    updated.splice(idx, 1);
    setForm({ ...form, ticketCategories: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create event');

      showToast('Event published successfully!', 'success');
      router.push('/organizer');
    } catch (err: any) {
      showToast(err.message || 'Error publishing event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/organizer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Organizer Dashboard</span>
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-medium mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Campus Event Publishing</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Create & Host Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. TreeHacks 2026: AI Championship"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HACKATHONS">HACKATHONS</option>
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="CULTURAL">CULTURAL</option>
                <option value="MUSIC">MUSIC</option>
                <option value="SPORTS">SPORTS</option>
                <option value="WORKSHOPS">WORKSHOPS</option>
                <option value="ENTREPRENEURSHIP">ENTREPRENEURSHIP</option>
                <option value="COMPETITIONS">COMPETITIONS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Hosting University / College
              </label>
              <input
                type="text"
                required
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Description
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Full details regarding schedule, speakers, perks, and eligibility..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Venue Location
              </label>
              <input
                type="text"
                required
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Arrillaga Auditorium, Building 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Banner Image URL (Unsplash)
              </label>
              <input
                type="url"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Multi-Tier Tickets Section */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Ticket Pass Tiers
            </h3>
            <button
              type="button"
              onClick={handleAddTier}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              + Add Tier
            </button>
          </div>

          {form.ticketCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Tier Name</label>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => {
                    const copy = [...form.ticketCategories];
                    copy[idx].name = e.target.value;
                    setForm({ ...form, ticketCategories: copy });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-white text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  value={cat.price}
                  onChange={(e) => {
                    const copy = [...form.ticketCategories];
                    copy[idx].price = Number(e.target.value);
                    setForm({ ...form, ticketCategories: copy });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-white text-xs mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={cat.totalQuantity}
                  onChange={(e) => {
                    const copy = [...form.ticketCategories];
                    copy[idx].totalQuantity = Number(e.target.value);
                    setForm({ ...form, ticketCategories: copy });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-white text-xs mt-1 font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveTier(idx)}
                  disabled={form.ticketCategories.length <= 1}
                  className="p-2 text-rose-400 hover:bg-slate-900 rounded-xl disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <Link
            href="/organizer"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Publish Campus Event</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
`);

save('src/app/organizer/events/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Calendar, Ticket, Users, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/organizer/events')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.events) setEvents(data.events);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Managed Campus Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete list of events organized by your club or council.
          </p>
        </div>

        <Link
          href="/organizer/create"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          + Create Event
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs"
          >
            <div>
              <span className="font-mono font-bold text-indigo-400 text-[10px] bg-indigo-950 px-2 py-0.5 rounded">
                {evt.category}
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">{evt.title}</h3>
              <p className="text-slate-400">
                {formatDate(evt.startDate)} • {evt.venue}
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-emerald-400">
                {evt.tickets?.length || 0} Registered
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

save('src/app/organizer/scanner/page.tsx', `
'use client';

import React from 'react';
import QRScannerComponent from '@/components/scanner/QRScannerComponent';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ScannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/organizer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Organizer Hub</span>
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-medium mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-time Gate Access Control</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Gate QR Scanner</h1>
        <p className="text-xs text-slate-400 mt-1">
          Scan attendees' 30-second dynamic TOTP passes to verify identity and record entrance
          atomically.
        </p>
      </div>

      <QRScannerComponent />
    </div>
  );
}
`);

save('src/app/admin/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Repeat,
  DollarSign,
  Calendar,
  AlertTriangle,
  History,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) setStats(data.stats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-mono font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Governance & Security Audit</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Operations Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global system monitoring, escrow clearinghouse volume, user verification, and audit
            logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/audit-logs"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Audit Logs</span>
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            User Governance
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Total Users
          </span>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalUsers || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Total Events
          </span>
          <p className="text-2xl font-black text-indigo-400 font-mono">{stats?.totalEvents || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Escrow Volume
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(stats?.totalEscrowVolume || 0)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Active Resale Listings
          </span>
          <p className="text-2xl font-black text-purple-400 font-mono">
            {stats?.activeResales || 0}
          </p>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300">
            User Accounts & Roles
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review .edu academic verifications, adjust user roles (Student, Host, Admin), and ban
            malicious accounts.
          </p>
        </Link>

        <Link
          href="/admin/events"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300">
            Event Moderation
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Approve, moderate, or cancel university events and verify legitimacy of external
            aggregated fests.
          </p>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400">
            <History className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white group-hover:text-amber-300">
            Security Audit Trail
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Immutable log of all user registrations, logins, ticket mints, escrow transfers, and
            gate check-ins.
          </p>
        </Link>
      </div>
    </div>
  );
}
`);

save('src/app/admin/users/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data?.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        showToast('User role updated', 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleToggleSuspend = async (userId: string, isSuspended: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isSuspended: !isSuspended }),
      });
      if (res.ok) {
        showToast(isSuspended ? 'User unbanned' : 'User suspended', 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Hub</span>
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">
          User Directory & Governance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review collegiate students, event organizers, and platform administrators.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">University</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Trust Rating</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/40">
                <td className="py-3 px-4">
                  <span className="font-bold text-white block">{u.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                </td>
                <td className="py-3 px-4 text-slate-300">{u.college}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold">
                    {u.verificationStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono text-[11px]"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="ORGANIZER">ORGANIZER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-amber-400">
                  ⭐ {u.trustRating.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                    className={\`px-3 py-1 rounded-lg font-bold text-[11px] \${
                      u.isSuspended
                        ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                    }\`}
                  >
                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

save('src/app/admin/events/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Calendar, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function AdminEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (data?.events) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApprove = async (eventId: string) => {
    try {
      const res = await fetch(\`/api/admin/events/\${eventId}/approve\`, { method: 'POST' });
      if (res.ok) {
        showToast('Event approved and published', 'success');
        fetchEvents();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      const res = await fetch(\`/api/admin/events/\${eventId}/reject\`, { method: 'POST' });
      if (res.ok) {
        showToast('Event rejected and cancelled', 'success');
        fetchEvents();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Hub</span>
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Event Moderation</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, approve, and oversee campus fests and hackathons.
        </p>
      </div>

      <div className="space-y-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-400 text-[10px] bg-indigo-950 px-2 py-0.5 rounded">
                  {evt.category}
                </span>
                <span
                  className={\`font-mono font-bold text-[10px] px-2 py-0.5 rounded \${
                    evt.status === 'PUBLISHED'
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-amber-950 text-amber-400'
                  }\`}
                >
                  {evt.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">{evt.title}</h3>
              <p className="text-slate-400">
                {evt.college} • {formatDate(evt.startDate)} • Organizer:{' '}
                <strong className="text-slate-300">{evt.organizer?.name}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {evt.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handleApprove(evt.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Approve
                </button>
              )}
              {evt.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleReject(evt.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold"
                >
                  Cancel Event
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

save('src/app/admin/audit-logs/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { History, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.logs) setLogs(data.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Hub</span>
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically timestamped immutable event trail across authentication, escrow, and
          gate operations.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{log.entityType}</td>
                <td className="py-3 px-4 text-slate-300">{log.user?.name || log.userId || 'SYSTEM'}</td>
                <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                  {log.metadata || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

save('src/app/login/page.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Ticket, Lock, Mail, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      showToast('Signed in successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to CampusConnect</h1>
          <p className="text-xs text-slate-400">
            Enter your university credentials to access your ticket vault.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@stanford.edu"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold text-center">
              Quick 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoFill('student@stanford.edu', 'Student@1234')}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-indigo-500"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('organizer@campusconnect.demo', 'Organizer@1234')}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 hover:border-emerald-500"
              >
                🎪 Host
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@campusconnect.demo', 'Admin@1234')}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 hover:border-amber-500"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-indigo-400 hover:underline">
            Join with your .edu email
          </Link>
        </p>
      </div>
    </div>
  );
}
`);

save('src/app/register/page.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Ticket, Lock, Mail, User, Building2, ShieldCheck, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    studentId: '',
    role: 'STUDENT' as any,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(form);
      showToast('Registration complete! Welcome to CampusConnect.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Create Verified Account</h1>
          <p className="text-xs text-slate-400">
            Academic collegiate accounts are verified automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Rivera"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              University Email (.edu / .ac.in)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@stanford.edu"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                University / College
              </label>
              <input
                type="text"
                required
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="Stanford University"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Roll No. (Optional)
              </label>
              <input
                type="text"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                placeholder="SU-2024-8891"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Account Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="STUDENT">Student (Event Attendee / Ticket Reseller)</option>
              <option value="ORGANIZER">Event Organizer / College Club Council</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
`);

save('src/app/forgot-password/page.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.demoResetToken) {
        setGeneratedToken(data.demoResetToken);
        showToast('Demo reset token generated!', 'success');
      } else {
        showToast(data.message, 'info');
      }
    } catch (err) {
      showToast('Error requesting password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter your university email to receive a recovery token.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@stanford.edu"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
          </button>

          {generatedToken && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs space-y-2">
              <p className="font-bold text-indigo-300">Demo Reset Token Generated:</p>
              <p className="font-mono text-[11px] bg-slate-900 p-2 rounded-lg text-slate-300 break-all">
                {generatedToken}
              </p>
              <Link
                href={\`/reset-password?token=\${generatedToken}\`}
                className="block text-center py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs mt-2"
              >
                Proceed to Set New Password →
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
`);

save('src/app/reset-password/page.tsx', `
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      showToast('Password updated successfully! Please log in.', 'success');
      router.push('/login');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">Create New Password</h1>
        <p className="text-xs text-slate-400">
          Enter your recovery token and new account password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Reset Token
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste reset token string"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading reset form...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
`);

console.log('[PART 4] Completed all App Pages!');

