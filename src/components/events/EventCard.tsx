'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/types/event';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, MapPin, Building2, Ticket, Bookmark, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface EventCardProps {
  event: EventItem;
  onBookClick?: (event: EventItem) => void;
  onBookmarkToggle?: () => void;
}

export default function EventCard({ event, onBookClick, onBookmarkToggle }: EventCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { showToast('Please sign in to save events', 'info'); return; }
    try {
      const res = await fetch('/api/events/' + event.id + '/bookmark', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(data.isSaved ? 'Added to bookmarks' : 'Removed from bookmarks', 'success');
        if (onBookmarkToggle) onBookmarkToggle();
      }
    } catch (err) { showToast('Failed to update bookmark', 'error'); }
  };

  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        <Image
          src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40"></div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/40 font-mono">
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 font-mono">
              Featured
            </span>
          )}
        </div>
        <button onClick={handleBookmark} className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-amber-400 hover:scale-110 transition-all">
          <Bookmark className={'w-4 h-4 ' + (event.isSaved ? 'fill-amber-400 text-amber-400' : '')} />
        </button>
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700 text-white font-extrabold text-xs font-mono shadow-lg">
            {event.basePrice === 0 ? <span className="text-emerald-400">FREE</span> : formatCurrency(event.basePrice)}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-300 truncate">{event.college}</span>
          </div>
          <Link href={'/events/' + event.id}>
            <h3 className="font-black text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{event.title}</h3>
          </Link>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.description}</p>
        </div>
        <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /><span>{formatDate(event.startDate)}</span></div>
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /><span className="truncate max-w-[110px]">{event.venue}</span></div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px]">
              <span className="text-slate-500">Seats: </span>
              <span className={'font-mono font-bold ' + (isSoldOut ? 'text-rose-400' : 'text-emerald-400')}>{isSoldOut ? 'Sold Out' : event.availableSeats + ' available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={'/events/' + event.id} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="View Details"><ExternalLink className="w-4 h-4" /></Link>
              <button onClick={() => onBookClick && onBookClick(event)} disabled={isSoldOut} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5" /><span>{isSoldOut ? 'Sold Out' : 'Reserve'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
