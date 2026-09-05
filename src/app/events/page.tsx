'use client';
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

  const handleBookmarkToggle = (eventId: string, isSaved: boolean) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isSaved } : e))
    );
  };

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
            <EventCard
              key={evt.id}
              event={evt}
              onBookClick={(e) => setSelectedEventForBooking(e)}
              onBookmarkToggle={(isSaved) => handleBookmarkToggle(evt.id, isSaved)}
            />
          ))}
        </div>
      )}

      {selectedEventForBooking && <BookingModal event={selectedEventForBooking} onClose={() => setSelectedEventForBooking(null)} onSuccess={() => fetchEvents()} />}
    </div>
  );
}
