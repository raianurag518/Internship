'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { QrCode, PlusCircle, Edit, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/organizer/analytics')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.stats) setStats(d.stats);
        if (d?.events) setEvents(d.events);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Organizer Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Host hub for campus events & ticket management</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/organizer/scanner"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Gate Scanner</span>
          </Link>
          <Link
            href="/organizer/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-500 font-bold uppercase">Events Hosted</p>
          <p className="text-2xl font-black text-white font-mono mt-1">{stats?.totalEvents || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-500 font-bold uppercase">Passes Issued</p>
          <p className="text-2xl font-black text-indigo-400 font-mono mt-1">{stats?.totalTicketsIssued || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-500 font-bold uppercase">Check-In Rate</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats?.checkInRate || 0}%</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-500 font-bold uppercase">Revenue</p>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
        </div>
      </div>

      {/* Hosted Events List with Edit Option */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white">Your Hosted Events</h2>
            <p className="text-xs text-slate-400">Manage schedules, venues, ticket prices, and edits</p>
          </div>
          <Link
            href="/organizer/events"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No events hosted yet</p>
            <p className="text-xs text-slate-500">Publish your first college event to get started.</p>
            <Link
              href="/organizer/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold mt-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {evt.category}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {evt.basePrice === 0 ? 'FREE' : formatCurrency(evt.basePrice)}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-base">{evt.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{evt.venue} {evt.city ? `• ${evt.city}` : ''}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{new Date(evt.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Capacity: <strong className="text-white">{evt.totalCapacity}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/organizer/events/${evt.id}/edit`}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30 transition hover:scale-105"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Event</span>
                    </Link>
                    <Link
                      href="/organizer/scanner"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <QrCode className="w-3 h-3 text-emerald-400" />
                      <span>Scan</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}