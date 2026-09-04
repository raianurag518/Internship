'use client';
import React from 'react';
import { TicketItem } from '@/types/ticket';
import { formatCurrency, formatDate } from '@/lib/utils';
import { QrCode, Repeat, ShieldCheck, CheckCircle2, Clock, XCircle, Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TicketPassCard({
  ticket, onViewQr, onListResale, onCancelResale
}: {
  ticket: TicketItem; onViewQr?: (t: TicketItem) => void; onListResale?: (t: TicketItem) => void; onCancelResale?: (t: TicketItem) => void;
}) {
  const event = ticket.event;
  const isUsed = ticket.isUsed || ticket.status === 'USED';
  const isListed = ticket.status === 'LISTED_FOR_RESALE';
  const isActive = ticket.status === 'ACTIVE';

  return (
    <div className={'relative overflow-hidden rounded-3xl border transition-all duration-300 ' + (isUsed ? 'bg-slate-900/50 border-slate-800/80 opacity-70' : isListed ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-500/40 shadow-xl' : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-2xl hover:border-indigo-500/50')}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">#{ticket.ticketNumber}</span>
            {isUsed && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Checked In</span></span>}
            {isListed && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full"><Clock className="w-3.5 h-3.5 animate-pulse" /><span>Listed in Clearinghouse</span></span>}
            {isActive && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /><span>Valid Pass</span></span>}
            <span className="text-[11px] font-semibold text-slate-400">Tier: <strong className="text-white">{ticket.category?.name || 'General Pass'}</strong></span>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">{event?.title || 'Campus Event'}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium"><Building2 className="w-3.5 h-3.5 text-slate-500" /><span>{event?.college}</span></p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /><span>{event ? formatDate(event.startDate) : 'TBD'}</span></span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /><span>{event?.venue || 'Campus Venue'}</span></span>
          </div>
        </div>
        <div className="flex md:flex-col items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Face Value</span>
            <p className="text-lg md:text-xl font-extrabold text-white font-mono">{ticket.originalPrice === 0 ? 'FREE' : formatCurrency(ticket.originalPrice)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <>
                <button onClick={() => onViewQr && onViewQr(ticket)} className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-1.5"><QrCode className="w-4 h-4" /><span>Show Pass</span></button>
                <button onClick={() => onListResale && onListResale(ticket)} className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5 text-emerald-400" /><span>Resell (100% Cap)</span></button>
              </>
            )}
            {isListed && (
              <button onClick={() => onCancelResale && onCancelResale(ticket)} className="px-3.5 py-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs transition-all flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /><span>Cancel Listing</span></button>
            )}
            <Link href={'/tickets/' + ticket.id} className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Audit Lineage"><ExternalLink className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
