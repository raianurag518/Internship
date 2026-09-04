'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, Loader2, Sparkles, Building, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import DateTimePicker from '@/components/common/DateTimePicker';

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
    basePrice: 0,
    totalCapacity: 200,
    tierName: 'General Student Pass',
    tierPrice: '' as string | number,
    tierQuantity: '200' as string | number,
  });

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
          basePrice: Number(form.tierPrice) || 0,
          totalCapacity: Number(form.tierQuantity) || 100,
          ticketCategories: [
            {
              name: form.tierName.trim() || 'General Student Pass',
              price: Number(form.tierPrice) || 0,
              totalQuantity: Number(form.tierQuantity) || 100,
              maxPerUser: 2,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish event');

      showToast('College Event Published Successfully!', 'success');
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
            Aggregate your hackathon, fest, or workshop with automated anti-scalping escrow & 30s dynamic gate tokens.
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

          {/* Ticket Tier & Pricing (in ₹ INR) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Primary Ticket Tier & Pricing (₹ INR)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tier Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Early Bird Pass"
                  value={form.tierName}
                  onChange={(e) => setForm({ ...form, tierName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pass Price (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0 for Free"
                  value={form.tierPrice}
                  onChange={(e) => setForm({ ...form, tierPrice: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">₹0 or empty = Free Student Pass</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Total Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 200"
                  value={form.tierQuantity}
                  onChange={(e) => setForm({ ...form, tierQuantity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">Available seats to issue</p>
              </div>
            </div>
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