'use client';
import React, { useEffect, useState } from 'react';
import { EventItem } from '@/types/event';
import EventCard from '@/components/events/EventCard';
import BookingModal from '@/components/events/BookingModal';
import { Bookmark, Compass, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SavedEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved-events');
      if (res.ok) {
        const data = await res.json();
        if (data.events) setEvents(data.events);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase mb-2">
            <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Saved For Later</span>
          </div>
          <h1 className="text-3xl font-black text-white">Bookmarked Campus Events</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Campus events you have bookmarked to explore or attend. These are saved separately from your purchased Active Entrance Passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Events</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading your bookmarked events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-950/50 border border-amber-800/60 flex items-center justify-center mx-auto text-amber-400">
            <Bookmark className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No bookmarked events yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When you discover hackathons, music fests, or workshops you want to track or attend, click the bookmark icon on any event card to save it here.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Browse All Campus Events</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onBookClick={(e) => setSelectedEventForBooking(e)}
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
