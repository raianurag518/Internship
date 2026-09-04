'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, ArrowLeft, Loader2, Save, Sparkles, Building, MapPin, Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import DateTimePicker from '@/components/common/DateTimePicker';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'HACKATHONS',
    college: '',
    city: '',
    venue: '',
    startDate: '',
    endDate: '',
    basePrice: '' as string | number,
    totalCapacity: '' as string | number,
  });

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.event) {
          const e = data.event;
          setForm({
            title: e.title || '',
            description: e.description || '',
            category: e.category || 'HACKATHONS',
            college: e.college || '',
            city: e.city || '',
            venue: e.venue || '',
            startDate: e.startDate ? new Date(e.startDate).toISOString() : '',
            endDate: e.endDate ? new Date(e.endDate).toISOString() : '',
            basePrice: e.basePrice !== undefined ? String(e.basePrice) : '0',
            totalCapacity: e.totalCapacity !== undefined ? String(e.totalCapacity) : '100',
          });
        } else {
          showToast('Event not found', 'error');
          router.push('/profile');
        }
      } catch (err) {
        showToast('Error loading event', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast('Please enter an event title', 'error');
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      showToast('Invalid date format selected', 'error');
      return;
    }

    if (end <= start) {
      showToast('End date & time must be strictly after the start date & time', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
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
          basePrice: form.basePrice === '' ? 0 : Number(form.basePrice),
          totalCapacity: form.totalCapacity === '' ? 100 : Number(form.totalCapacity),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update event');

      showToast('Event updated successfully!', 'success');
      router.push('/profile');
    } catch (err: any) {
      showToast(err.message || 'Error updating event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently remove this published event? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete event');
      showToast('Event successfully removed!', 'success');
      router.push('/profile');
    } catch (err: any) {
      showToast(err.message || 'Error removing event', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-mono">Loading event for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to College Profile</span>
      </Link>

      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl">
        <div className="border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Host Event Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Edit Published Event</h1>
          <p className="text-xs text-slate-400 mt-1">
            Update your event title, description, schedule, venue, and pass pricing.
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
              <span>Event Schedule (Interactive Calendar)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DateTimePicker
                label="Start Date & Time"
                value={form.startDate}
                onChange={(val) => setForm((prev) => ({ ...prev, startDate: val }))}
                minDate={new Date()}
                required
              />

              <DateTimePicker
                label="End Date & Time"
                value={form.endDate}
                onChange={(val) => setForm((prev) => ({ ...prev, endDate: val }))}
                minDate={new Date()}
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
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Ticket Pricing & Capacity */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Pass Pricing & Seat Capacity (₹ INR)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pass Price (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0 for Free"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
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
                  value={form.totalCapacity}
                  onChange={(e) => setForm({ ...form, totalCapacity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">Available seats to issue</p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Remove Event + Cancel + Save */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-5 py-3 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-2 transition"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-rose-400" />}
              <span>Remove Event</span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition hover:scale-105"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Event Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}