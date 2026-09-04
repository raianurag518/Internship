'use client';
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
}
