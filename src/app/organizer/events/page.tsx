'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Edit, PlusCircle, Calendar, MapPin, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this published event? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert(data.message || 'Failed to remove event');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove event');
    }
  };

  useEffect(() => {
    fetch('/api/organizer/events')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <Link href="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Dashboard</span>
        </Link>
        <Link
          href="/organizer/create"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create New Event</span>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-black text-white">All Published Campus Events</h1>
        <p className="text-xs text-slate-400 mt-1">Manage and edit your hosted events, schedules, venues, and ticket passes.</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-mono">Loading your hosted events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No events published yet</p>
          <p className="text-xs text-slate-400">Host your first campus event to manage and edit it here.</p>
          <Link
            href="/organizer/create"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Campus Event</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div
              key={e.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {e.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {e.basePrice === 0 ? 'FREE' : formatCurrency(e.basePrice)}
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-lg">{e.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {e.venue} {e.city ? `• ${e.city}` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {new Date(e.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  title="Remove Published Event"
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/organizer/events/${e.id}/edit`}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Event</span>
                </Link>
                <Link
                  href="/organizer/scanner"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition hover:scale-105"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate Scanner</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}