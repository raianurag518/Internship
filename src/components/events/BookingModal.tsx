'use client';
import React, { useState } from 'react';
import { EventItem, TicketCategoryItem } from '@/types/event';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Ticket, X, CheckCircle2, Building2, Loader2, Tag, Percent, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function BookingModal({
  event,
  onClose,
  onSuccess,
}: {
  event: EventItem;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const categories = event.ticketCategories || [];
  const [selectedCategory, setSelectedCategory] = useState<TicketCategoryItem | null>(categories[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedTicket, setBookedTicket] = useState<any>(null);

  // Discount & Promo Code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const handleApplyPromo = () => {
    setDiscountError(null);
    const input = promoInput.trim().toUpperCase();
    if (!input) {
      setAppliedPromo(null);
      return;
    }
    if (event.discountCode && input === event.discountCode.trim().toUpperCase()) {
      setAppliedPromo(input);
      showToast(`Promo code ${input} applied successfully!`, 'success');
    } else {
      setDiscountError('Invalid promo code for this event.');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setDiscountError(null);
  };

  // Price calculations
  const basePrice = selectedCategory?.price || 0;
  let finalPrice = basePrice;
  let discountAmountSaved = 0;

  if (appliedPromo && event.discountCode && appliedPromo === event.discountCode.trim().toUpperCase()) {
    if (event.discountPercent && event.discountPercent > 0) {
      discountAmountSaved = Math.round(basePrice * (event.discountPercent / 100));
      finalPrice = Math.max(0, basePrice - discountAmountSaved);
    } else if (event.discountAmount && event.discountAmount > 0) {
      discountAmountSaved = Math.min(basePrice, event.discountAmount);
      finalPrice = Math.max(0, basePrice - discountAmountSaved);
    }
  }

  const handleBooking = async () => {
    if (!user) {
      showToast('Please sign in to complete booking.', 'error');
      router.push('/login');
      return;
    }
    if (!selectedCategory) {
      showToast('Please select a ticket pass tier.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/tickets/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          categoryId: selectedCategory.id,
          discountCode: appliedPromo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete reservation.');
      setBookedTicket(data.ticket);
      setIsSuccess(true);
      showToast('Pass booked successfully! Added to your Digital Vault.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Booking error.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono mb-2 border border-indigo-800">
                <Ticket className="w-3.5 h-3.5" />
                <span>Direct Primary Pass Booking</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{event.title}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {event.college} • {formatDate(event.startDate)}
                </span>
              </p>
            </div>

            {/* Host Promotional Discount Banner */}
            {event.discountCode && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-900/60 text-purple-300">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Host Promotional Discount Available!</p>
                    <p className="text-[10px] text-purple-300">
                      Use code <span className="font-mono font-black text-purple-200">{event.discountCode}</span> for{' '}
                      {event.discountPercent ? `${event.discountPercent}% OFF` : formatCurrency(event.discountAmount || 0) + ' OFF'}
                    </p>
                  </div>
                </div>
                {!appliedPromo && (
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput(event.discountCode || '');
                      setAppliedPromo(event.discountCode || '');
                      showToast(`Promo code ${event.discountCode} applied!`, 'success');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shadow-sm transition"
                  >
                    Auto Apply
                  </button>
                )}
              </div>
            )}

            {/* Ticket Tier Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Select Ticket Tier ({categories.length} Available)
                </label>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isSoldOut = cat.availableQuantity <= 0;
                  const hasTierDiscount = cat.originalPrice && cat.originalPrice > cat.price;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isSoldOut && setSelectedCategory(cat)}
                      className={
                        'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ' +
                        (isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                          : isSoldOut
                          ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700')
                      }
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{cat.name}</span>
                          {hasTierDiscount && (
                            <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-800">
                              {cat.discountPercent || Math.round((((cat.originalPrice || 0) - cat.price) / (cat.originalPrice || 1)) * 100)}% OFF
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                        )}
                        <p className="text-[10px] text-emerald-400 font-mono">
                          {isSoldOut ? 'Sold Out' : `${cat.availableQuantity} passes left`}
                        </p>
                      </div>

                      <div className="text-right">
                        {hasTierDiscount && (
                          <p className="text-[10px] text-slate-500 line-through font-mono">
                            {formatCurrency(cat.originalPrice || 0)}
                          </p>
                        )}
                        <p className="text-sm font-extrabold text-white font-mono">
                          {cat.price === 0 ? 'FREE' : formatCurrency(cat.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discount Promo Code Input */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Promo / Discount Code</span>
                </label>
                {appliedPromo && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Applied</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  value={promoInput}
                  disabled={!!appliedPromo}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setDiscountError(null);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white uppercase focus:border-purple-500 focus:outline-none disabled:opacity-60"
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30"
                  >
                    Apply
                  </button>
                )}
              </div>

              {discountError && (
                <p className="text-[11px] text-rose-400 font-medium">{discountError}</p>
              )}

              {appliedPromo && discountAmountSaved > 0 && (
                <div className="pt-1 flex items-center justify-between text-xs font-medium border-t border-slate-800/80">
                  <span className="text-slate-400">Discount Saved:</span>
                  <span className="text-emerald-400 font-bold font-mono">-{formatCurrency(discountAmountSaved)}</span>
                </div>
              )}
            </div>

            {/* Price Summary & Submit */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Payable:</span>
                <div className="text-right">
                  {appliedPromo && discountAmountSaved > 0 && (
                    <span className="text-xs text-slate-500 line-through font-mono mr-2">
                      {formatCurrency(basePrice)}
                    </span>
                  )}
                  <span className="text-lg font-black text-white font-mono">
                    {finalPrice === 0 ? 'FREE' : formatCurrency(finalPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={isProcessing || !selectedCategory || selectedCategory.availableQuantity <= 0}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition hover:scale-105"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirm Pass ({finalPrice === 0 ? 'Free' : formatCurrency(finalPrice)})</span>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Event Pass Issued!</h3>
            <p className="text-xs text-slate-400">
              Ticket Serial Number:{' '}
              <strong className="font-mono text-indigo-300">{bookedTicket?.ticketNumber}</strong>
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  router.push('/tickets');
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                View in My Tickets
              </button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
