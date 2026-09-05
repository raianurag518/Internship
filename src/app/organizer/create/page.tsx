'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  Building,
  MapPin,
  Tag,
  Trash2,
  Percent,
  Layers,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import DateTimePicker from '@/components/common/DateTimePicker';
import { formatCurrency } from '@/lib/utils';

interface TicketTierInput {
  id: string;
  name: string;
  price: string | number;
  totalQuantity: string | number;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart default dates (Tomorrow 10:00 AM to Tomorrow 06:00 PM)
  const getInitialStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T10:00:00`;
  };

  const getInitialEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T18:00:00`;
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'HACKATHONS',
    college: 'Indian Institute of Technology Delhi (IIT Delhi)',
    city: 'New Delhi',
    venue: 'Dogra Hall & Campus Grounds',
    startDate: getInitialStartDate(),
    endDate: getInitialEndDate(),
  });

  // Multi-tier tickets state
  const [tiers, setTiers] = useState<TicketTierInput[]>([
    {
      id: 'tier-1',
      name: 'General Student Pass',
      price: '',
      totalQuantity: '150',
      description: 'Standard campus access & general entry pass',
    },
  ]);

  // Host Discount & Promotional Codes state
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    code: 'CAMPUS20',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    value: '20' as string | number,
  });

  const addTier = () => {
    const newId = `tier-${Date.now()}`;
    const count = tiers.length + 1;
    const presets = [
      'VIP / Front Row Pass',
      'Early Bird Pass',
      'Hackathon Participant Pass',
      'Workshop Hands-On Pass',
      'Team / Squad Pass',
    ];
    const suggestedName = presets[count - 2] || `Tier ${count} Pass`;
    setTiers((prev) => [
      ...prev,
      {
        id: newId,
        name: suggestedName,
        price: '',
        totalQuantity: '50',
        description: 'Includes priority access and exclusive event perks',
      },
    ]);
  };

  const removeTier = (id: string) => {
    if (tiers.length <= 1) {
      showToast('You must have at least one ticket tier for this event.', 'warning');
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTier = (id: string, field: keyof TicketTierInput, val: any) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  };

  const totalCapacity = tiers.reduce((acc, t) => acc + (Number(t.totalQuantity) || 0), 0);
  const validPrices = tiers.map((t) => (t.price === '' ? 0 : Number(t.price))).filter((p) => !isNaN(p));
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast('Please enter an event title', 'error');
      return;
    }
    if (!form.startDate) {
      showToast('Please select a valid start date', 'error');
      return;
    }
    if (!form.endDate) {
      showToast('Please select a valid end date', 'error');
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      showToast('Invalid date format selected. Please use the calendar.', 'error');
      return;
    }

    const now = new Date();
    if (start < new Date(now.getTime() - 60 * 1000)) {
      showToast('Event start date & time must be current date and time or later. Past dates are not permitted.', 'error');
      return;
    }

    if (end <= start) {
      showToast('End date & time must be strictly after the start date & time', 'error');
      return;
    }

    // Validate Tiers
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (!t.name.trim()) {
        showToast(`Please enter a name for Tier #${i + 1}`, 'error');
        return;
      }
      const qty = Number(t.totalQuantity);
      if (isNaN(qty) || qty <= 0) {
        showToast(`Please enter a valid seat capacity for ${t.name}`, 'error');
        return;
      }
    }

    if (discountEnabled) {
      if (!discountForm.code.trim()) {
        showToast('Please enter a promotional discount code (e.g. CAMPUS20)', 'error');
        return;
      }
      const val = Number(discountForm.value);
      if (isNaN(val) || val <= 0) {
        showToast('Please enter a valid discount amount or percentage', 'error');
        return;
      }
      if (discountForm.type === 'PERCENTAGE' && val > 100) {
        showToast('Percentage discount cannot exceed 100%', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          college: form.college.trim(),
          city: form.city.trim(),
          venue: form.venue.trim(),
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          basePrice: minPrice,
          totalCapacity: totalCapacity || 100,
          discountCode: discountEnabled && discountForm.code.trim() ? discountForm.code.trim().toUpperCase() : null,
          discountPercent: discountEnabled && discountForm.type === 'PERCENTAGE' ? Number(discountForm.value) || 0 : 0,
          discountAmount: discountEnabled && discountForm.type === 'FLAT' ? Number(discountForm.value) || 0 : 0,
          ticketCategories: tiers.map((t) => {
            const price = t.price === '' ? 0 : Number(t.price) || 0;
            return {
              name: t.name.trim(),
              description: t.description ? t.description.trim() : null,
              price,
              originalPrice: null,
              discountPercent: 0,
              totalQuantity: Number(t.totalQuantity) || 50,
              maxPerUser: 4,
            };
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish event');

      showToast('College Event with Multi-Tier Tickets Published Successfully!', 'success');
      router.push('/organizer');
    } catch (err: any) {
      showToast(err.message || 'Error creating event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/organizer"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Organizer Dashboard</span>
      </Link>

      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl">
        <div className="border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>College Host Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Create & Publish Campus Event</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish event passes with multi-tier ticket categories, promotional host discounts, and automated anti-scalping gate tokens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stanford TreeHacks 2026: AI & Web3 Championship"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-2xl py-3 px-4 text-white text-xs font-medium transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the schedule, prizes, keynote speakers, and eligibility..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-2xl py-3 px-4 text-white text-xs leading-relaxed transition"
            />
          </div>

          {/* Category & College Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-white text-xs font-medium"
              >
                <option value="HACKATHONS">💻 Hackathon / Competition</option>
                <option value="MUSIC">🎵 Music, Fest & Concert</option>
                <option value="WORKSHOPS">🛠️ Workshop & Masterclass</option>
                <option value="TECH_TALKS">🎙️ Tech Talk / Conference</option>
                <option value="SPORTS">🏆 Sports & Tournaments</option>
                <option value="CULTURAL">🎭 Cultural & Drama</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Host College / University <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Delhi or Stanford University"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-white text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Visual Calendar Date Pickers */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span>Event Schedule (Interactive Visual Calendar)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Start Date Picker */}
              <DateTimePicker
                label="Start Date & Time"
                value={form.startDate}
                onChange={(val) => setForm((prev) => ({ ...prev, startDate: val }))}
                required
              />

              {/* End Date Picker */}
              <DateTimePicker
                label="End Date & Time"
                value={form.endDate}
                onChange={(val) => setForm((prev) => ({ ...prev, endDate: val }))}
                required
              />
            </div>
          </div>

          {/* Venue & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Venue Location <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dogra Hall or Main Auditorium"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-white text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                City & Campus
              </label>
              <input
                type="text"
                placeholder="e.g. New Delhi, India"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* MULTI-TIER TICKET CONFIGURATION */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <Layers className="w-4 h-4" />
                  <span>Ticket Tiers & Pass Types</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add multiple tiers (e.g. Early Bird, VIP, General Pass) with custom prices and capacities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2.5 py-1 rounded-full">
                  Total Capacity: {totalCapacity} Seats
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full">
                  Starting at: {minPrice === 0 ? 'FREE' : formatCurrency(minPrice)}
                </span>
              </div>
            </div>

            {/* List of Tiers */}
            <div className="space-y-4">
              {tiers.map((tier, idx) => {
                return (
                  <div
                    key={tier.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Tier #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {tier.name || `Tier ${idx + 1}`}
                        </span>
                      </div>

                      {tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(tier.id)}
                          className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition text-xs flex items-center gap-1"
                          title="Delete this ticket tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Tier Name */}
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Tier Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. VIP Front-Row Pass or Early Bird"
                          value={tier.name}
                          onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Tier Price */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Ticket Price (₹ INR) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0 = Free"
                          value={tier.price}
                          onChange={(e) => updateTier(tier.id, 'price', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Seats / Capacity */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Seat Capacity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="e.g. 50"
                          value={tier.totalQuantity}
                          onChange={(e) => updateTier(tier.id, 'totalQuantity', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tier Perks / Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Tier Perks & Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Fast-track entry, lunch buffet included, and official certificate"
                        value={tier.description}
                        onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-1.5 px-3 text-slate-300 text-xs placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Tier Button */}
            <button
              type="button"
              onClick={addTier}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition bg-slate-950/40 hover:bg-slate-900"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>+ Add Another Ticket Tier</span>
            </button>
          </div>

          {/* HOST DISCOUNT & PROMO CODE PANEL */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">
                    Host Discount & Promo Code Option
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Offer students an exclusive discount coupon code during pass reservation
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={discountEnabled}
                  onChange={(e) => setDiscountEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {discountEnabled && (
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/60 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Discount Code *
                    </label>
                    <input
                      type="text"
                      required={discountEnabled}
                      placeholder="e.g. CAMPUS20"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono font-black tracking-wider uppercase focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={discountForm.type}
                      onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-medium focus:border-purple-500 focus:outline-none"
                    >
                      <option value="PERCENTAGE">% Percentage Off</option>
                      <option value="FLAT">₹ Flat Rupees Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Discount Value ({discountForm.type === 'PERCENTAGE' ? '%' : '₹'}) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={discountForm.type === 'PERCENTAGE' ? 100 : undefined}
                      required={discountEnabled}
                      placeholder={discountForm.type === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 50'}
                      value={discountForm.value}
                      onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-900/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-700">
                      {discountForm.code || 'CODE'}
                    </span>
                    <span className="text-slate-300">
                      will grant{' '}
                      <strong className="text-emerald-400">
                        {discountForm.value || 0}
                        {discountForm.type === 'PERCENTAGE' ? '%' : '₹'} OFF
                      </strong>{' '}
                      on pass reservations
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href="/organizer"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition hover:scale-105"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Publish College Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
