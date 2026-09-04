const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/components/events/EventCard.tsx', `'use client';
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
}`);

save('src/components/events/BookingModal.tsx', `'use client';
import React, { useState } from 'react';
import { EventItem, TicketCategoryItem } from '@/types/event';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Ticket, X, CheckCircle2, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function BookingModal({ event, onClose, onSuccess }: { event: EventItem; onClose: () => void; onSuccess?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const categories = event.ticketCategories || [];
  const [selectedCategory, setSelectedCategory] = useState<TicketCategoryItem | null>(categories[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedTicket, setBookedTicket] = useState<any>(null);

  const handleBooking = async () => {
    if (!user) { showToast('Please sign in to complete booking.', 'error'); router.push('/login'); return; }
    if (!selectedCategory) { showToast('Please select a ticket pass tier.', 'warning'); return; }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/tickets/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, categoryId: selectedCategory.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete reservation.');
      setBookedTicket(data.ticket);
      setIsSuccess(true);
      showToast('Pass booked successfully! Added to your Digital Vault.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) { showToast(err.message || 'Booking error.', 'error'); } finally { setIsProcessing(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        {!isSuccess ? (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono mb-2">
                <Ticket className="w-3.5 h-3.5" /><span>Direct Primary Pass Booking</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{event.title}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" /><span>{event.college} • {formatDate(event.startDate)}</span>
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase">Select Ticket Tier</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isSoldOut = cat.availableQuantity <= 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isSoldOut && setSelectedCategory(cat)}
                      className={'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ' + (isSelected ? 'bg-indigo-950/60 border-indigo-500' : isSoldOut ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800' : 'bg-slate-950/70 border-slate-800')}
                    >
                      <div>
                        <span className="font-bold text-xs text-white">{cat.name}</span>
                        <p className="text-[10px] text-emerald-400 font-mono">{cat.availableQuantity} passes left</p>
                      </div>
                      <p className="text-sm font-extrabold text-white font-mono">{cat.price === 0 ? 'FREE' : formatCurrency(cat.price)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button
                type="button"
                onClick={handleBooking}
                disabled={isProcessing || !selectedCategory || selectedCategory.availableQuantity <= 0}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm ({selectedCategory?.price === 0 ? 'Free' : formatCurrency(selectedCategory?.price || 0)})</span>}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400"><CheckCircle2 className="w-8 h-8" /></div>
            <h3 className="text-xl font-extrabold text-white">Event Pass Issued!</h3>
            <p className="text-xs text-slate-400">Ticket Serial Number: <strong className="font-mono text-indigo-300">{bookedTicket?.ticketNumber}</strong></p>
            <div className="pt-4 flex justify-center gap-3">
              <button onClick={() => { onClose(); router.push('/tickets'); }} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">View in My Tickets</button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`);

save('src/components/scanner/QRScannerComponent.tsx', `'use client';
import React, { useState } from 'react';
import { QrCode, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function QRScannerComponent() {
  const [inputToken, setInputToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: inputToken.trim() }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err: any) {
      setScanResult({ isValid: false, code: 'NETWORK_ERROR', message: 'Could not connect to Gate Admission API.' });
    } finally { setIsScanning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30"><QrCode className="w-5 h-5" /></div>
          <div>
            <h3 className="font-extrabold text-base text-white">Cryptographic Gate Scanner</h3>
            <p className="text-xs text-slate-400">Optical barcode reader or manual HMAC token validator for entrance security.</p>
          </div>
        </div>
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Attendee Dynamic QR Payload / Token</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="e.g. cc_sec_alex_stanford_hackathon_001 or cc_sec_...:123456"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isScanning || !inputToken.trim()} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /><span>{isScanning ? 'Authenticating...' : 'Validate Entrance Pass'}</span>
            </button>
            <button type="button" onClick={() => { setInputToken(''); setScanResult(null); }} className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors">Reset</button>
          </div>
        </form>
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Instant Demo Test Tokens:</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setInputToken('cc_sec_alex_stanford_hackathon_001')} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 hover:border-indigo-500">Stanford Pass (Active)</button>
            <button type="button" onClick={() => setInputToken('cc_sec_alex_mit_concert_002')} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 hover:border-amber-500">MIT Resale Pass</button>
            <button type="button" onClick={() => setInputToken('cc_fake_forged_screenshot_token')} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-400 hover:border-rose-500">Counterfeit Pass</button>
          </div>
        </div>
      </div>
      {scanResult && (
        <div className={'p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 ' + (scanResult.isValid ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100' : scanResult.code === 'ALREADY_USED' ? 'bg-amber-950/80 border-amber-500 text-amber-100' : 'bg-rose-950/80 border-rose-500 text-rose-100')}>
          <div className="flex items-center gap-3">
            {scanResult.isValid ? <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" /> : scanResult.code === 'ALREADY_USED' ? <AlertCircle className="w-8 h-8 text-amber-400 shrink-0" /> : <XCircle className="w-8 h-8 text-rose-400 shrink-0" />}
            <div>
              <h4 className="text-lg font-black tracking-tight">{scanResult.isValid ? 'ADMISSION GRANTED (PASS VALID)' : scanResult.code === 'ALREADY_USED' ? 'ENTRY DENIED: PASS ALREADY USED' : 'ENTRY DENIED: INVALID OR FRAUDULENT PASS'}</h4>
              <p className="text-xs opacity-90">{scanResult.message}</p>
            </div>
          </div>
          {scanResult.ticket && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between"><span className="opacity-75">Event:</span><span className="font-bold">{scanResult.ticket.event?.title}</span></div>
              <div className="flex justify-between"><span className="opacity-75">Verified Attendee:</span><span className="font-bold">{scanResult.ticket.currentOwner?.name} ({scanResult.ticket.currentOwner?.college})</span></div>
              <div className="flex justify-between"><span className="opacity-75">Pass Serial:</span><span className="font-mono font-bold">{scanResult.ticket.ticketNumber}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`);