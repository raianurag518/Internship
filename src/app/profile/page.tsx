'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Ticket,
  IndianRupee,
  Star,
  Edit,
  PlusCircle,
  QrCode,
  MapPin,
  X,
  Loader2,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Trash2,
  Phone,
  BookOpen,
  Bookmark,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import DateTimePicker from '@/components/common/DateTimePicker';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>({
    totalEvents: 0,
    totalTicketsIssued: 0,
    totalRevenue: 0,
    checkInRate: 0,
  });
  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Event Modal State
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editTab, setEditTab] = useState<'personal' | 'academic'>('personal');
  const [profileForm, setProfileForm] = useState({
    name: '',
    college: '',
    phone: '',
    roll: '',
    dept: '',
    batch: 'Class of 2027',
    location: 'Hauz Khas, New Delhi',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch tickets in vault
      const tRes = await fetch('/api/tickets/my');
      if (tRes.ok) {
        const tData = await tRes.json();
        setMyTickets(tData.tickets || []);
      }

      // 2. Fetch hosted events & analytics only if organizer or admin
      if (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') {
        try {
          const aRes = await fetch('/api/organizer/analytics');
          if (aRes.ok) {
            const aData = await aRes.json();
            if (aData.stats) setStats(aData.stats);
            if (aData.events && aData.events.length > 0) setHostedEvents(aData.events);
          }
        } catch (e) {}

        try {
          const oRes = await fetch('/api/organizer/events');
          if (oRes.ok) {
            const oData = await oRes.json();
            if (oData.events && oData.events.length > 0) {
              setHostedEvents(oData.events);
            }
          }
        } catch (e) {}
      }

      // 3. Fetch bookmarked / saved events
      try {
        const sRes = await fetch('/api/saved-events');
        if (sRes.ok) {
          const sData = await sRes.json();
          setBookmarkedEvents(sData.events || []);
        }
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const savedBatch = typeof window !== 'undefined' ? localStorage.getItem('unipass_user_batch') : null;
      const savedLocation = typeof window !== 'undefined' ? localStorage.getItem('unipass_user_location') : null;
      setProfileForm({
        name: user.name || '',
        college: user.college || '',
        phone: user.phoneNumber ? user.phoneNumber.replace(/\D/g, '') : '9723890793',
        roll: user.studentId ? user.studentId.replace(/\D/g, '') : '202310842',
        dept: user.department || 'Computer Science & Engineering',
        batch: savedBatch || 'Class of 2027',
        location: savedLocation || 'Hauz Khas, New Delhi',
      });
      fetchData();
    }
  }, [user]);

  const handleOpenEditEvent = (evt: any) => {
    setEditingEvent({
      id: evt.id,
      title: evt.title || '',
      description: evt.description || '',
      category: evt.category || 'HACKATHONS',
      college: evt.college || user?.college || '',
      city: evt.city || '',
      venue: evt.venue || '',
      startDate: evt.startDate ? new Date(evt.startDate).toISOString() : new Date().toISOString(),
      endDate: evt.endDate ? new Date(evt.endDate).toISOString() : new Date().toISOString(),
      basePrice: evt.basePrice !== undefined ? String(evt.basePrice) : '',
      totalCapacity: evt.totalCapacity !== undefined ? String(evt.totalCapacity) : '100',
    });
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const start = new Date(editingEvent.startDate);
    const end = new Date(editingEvent.endDate);

    if (end <= start) {
      showToast('End date & time must be strictly after the start date & time', 'error');
      return;
    }

    setIsUpdatingEvent(true);
    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingEvent.title.trim(),
          description: editingEvent.description.trim(),
          category: editingEvent.category,
          college: editingEvent.college.trim(),
          city: editingEvent.city.trim(),
          venue: editingEvent.venue.trim(),
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          basePrice: editingEvent.basePrice === '' ? 0 : Number(editingEvent.basePrice),
          totalCapacity: editingEvent.totalCapacity === '' ? 100 : Number(editingEvent.totalCapacity),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update event');

      showToast('Event updated successfully!', 'success');
      setEditingEvent(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating event', 'error');
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to remove this published event? This action will permanently delete the event.')) {
      return;
    }
    setIsDeletingEvent(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete event');
      showToast('Event removed successfully!', 'success');
      setEditingEvent(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error removing event', 'error');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          college: profileForm.college,
          phoneNumber: profileForm.phone,
          studentId: profileForm.roll,
          department: profileForm.dept,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      if (typeof window !== 'undefined') {
        localStorage.setItem('unipass_user_batch', profileForm.batch);
        localStorage.setItem('unipass_user_location', profileForm.location);
      }

      await refreshUser();
      showToast('Profile credentials saved successfully!', 'success');
      setIsEditProfileOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRemoveBookmark = async (eventId: string) => {
    // Instant optimistic removal in 0ms!
    const previous = bookmarkedEvents;
    setBookmarkedEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      const res = await fetch(`/api/events/${eventId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Removed from bookmarked events', 'success');
      } else {
        setBookmarkedEvents(previous);
        showToast(data.message || 'Failed to update bookmark', 'error');
      }
    } catch (err: any) {
      setBookmarkedEvents(previous);
      showToast(err.message || 'Error updating bookmark', 'error');
    }
  };

  // Dynamic user metrics (starts at 0)
  const trustScore = user?.trustRating !== undefined && user?.trustRating !== null ? Number(user.trustRating).toFixed(1) : '0.0';
  const reviewCount = user?.totalTrades || 0;
  const activePassesCount = myTickets.filter((t) => t.status === 'ACTIVE' || t.status === 'LISTED_FOR_RESALE').length;
  const eventsHostedCount = stats?.totalEvents || hostedEvents.length || 0;
  const currentRevenue = stats?.totalRevenue || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-indigo-500/30 flex-shrink-0">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-indigo-300 text-2xl font-black font-mono">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Anurag'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {user?.role || 'STUDENT'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified .EDU / .AC.IN</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 flex items-center gap-1.5 font-semibold">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{user?.college || 'Affiliated Institution'}</span>
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Edit className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Details</span>
            </button>
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <Link
                href="/organizer/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Event</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Trust Rating */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? 'Host Trust Rating' : 'Trust Rating'}
            </span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{trustScore} ★</p>
          <p className="text-[10px] text-slate-500">{reviewCount} campus ratings</p>
        </div>

        {/* Metric 2: Active Passes in Vault */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active Passes</span>
            <Ticket className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 font-mono">{activePassesCount}</p>
          <p className="text-[10px] text-slate-500">In dynamic vault</p>
        </div>

        {user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? (
          <>
            {/* Organizer Metric 3: Events Hosted */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Events Hosted</span>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">{eventsHostedCount}</p>
              <p className="text-[10px] text-slate-500">Published campus events</p>
            </div>

            {/* Organizer Metric 4: Total Revenue */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Revenue</span>
                <IndianRupee className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-400 font-mono">{formatCurrency(currentRevenue)}</p>
              <p className="text-[10px] text-slate-500">From pass reservations</p>
            </div>
          </>
        ) : (
          <>
            {/* Student Metric 3: Bookmarked Events */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Bookmarked Events</span>
                <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 font-mono">{bookmarkedEvents.length}</p>
              <p className="text-[10px] text-slate-500">Saved for later</p>
            </div>

            {/* Student Metric 4: Academic Verification Status */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Student Status</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400 font-mono pt-0.5">
                Verified
              </p>
              <p className="text-[10px] text-slate-500">Active .EDU / .AC.IN</p>
            </div>
          </>
        )}
      </div>

      {/* 2-Column Section: Personal Details + College Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Personal Details */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Personal Information</h3>
                <p className="text-[11px] text-slate-400">Contact & verification credentials</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditTab('personal');
                setIsEditProfileOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition hover:border-indigo-500"
            >
              <Edit className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Info</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">Full Name:</span>
              <span className="font-bold text-white text-sm">{profileForm.name || user?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">College Email:</span>
              <span className="font-mono text-indigo-300 font-bold">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mobile Number:</span>
              </span>
              <span className="font-mono text-slate-200 font-bold">{user?.phoneNumber || profileForm.phone || '9723890793'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">College ID / Roll No:</span>
              <span className="font-mono text-emerald-400 font-bold">{user?.studentId ? user.studentId.replace(/\D/g, '') : (profileForm.roll || '202310842')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: College & Academic Details */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">College & Academic Details</h3>
                <p className="text-[11px] text-slate-400">Studying institution & department</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditTab('academic');
                setIsEditProfileOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition hover:border-purple-500"
            >
              <Edit className="w-3.5 h-3.5 text-purple-400" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">College / University:</span>
              <span className="font-bold text-white text-right">{user?.college || profileForm.college}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Department / Major:</span>
              </span>
              <span className="font-bold text-indigo-300 text-right">{user?.department || profileForm.dept || 'Computer Science & Engineering'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">Academic Batch:</span>
              <span className="font-mono text-slate-200 font-bold">{profileForm.batch}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">Campus Location:</span>
              <span className="font-bold text-slate-300 text-right">{profileForm.location || 'Hauz Khas, New Delhi'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">Academic KYC Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Approved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKMARKED EVENTS SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase mb-1">
              <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Saved For Later</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Bookmarked Events</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono border border-slate-700">
                {bookmarkedEvents.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Campus events you have bookmarked to explore, track, or attend later (separate from your active entrance passes).
            </p>
          </div>
          <Link
            href="/events"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-slate-700"
          >
            <span>Explore Campus Events</span>
          </Link>
        </div>

        {bookmarkedEvents.length === 0 ? (
          <div className="text-center py-10 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No bookmarked events yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore college fests, hackathons, and workshops, then tap the bookmark icon on any event to save it here.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold mt-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Browse All Events</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {evt.category}
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(evt.id)}
                      title="Remove Bookmark"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-amber-400 hover:text-rose-400 transition"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                  <h3 className="font-black text-base text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{evt.venue} {evt.city ? `• ${evt.city}` : ''}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>{new Date(evt.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold text-xs">
                    {evt.basePrice === 0 ? 'FREE PASS' : formatCurrency(evt.basePrice)}
                  </span>
                  <Link
                    href={`/events/${evt.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30 transition hover:scale-105"
                  >
                    <span>View Event</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOSTED EVENTS SECTION WITH "EDIT EVENT" OPTION (Organizers & Admins Only) */}
      {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold uppercase mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Host Event Management</span>
              </div>
              <h2 className="text-xl font-black text-white">My Published Events</h2>
              <p className="text-xs text-slate-400">Edit event details, schedule, venue, price, and capacity</p>
            </div>
            <Link
              href="/organizer/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Host New Event</span>
            </Link>
          </div>

          {hostedEvents.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No events published yet</p>
              <p className="text-xs text-slate-500">Create your first campus event to manage and edit it here.</p>
              <Link
                href="/organizer/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold mt-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create First Event</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hostedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {evt.category}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        {evt.basePrice === 0 ? 'FREE' : formatCurrency(evt.basePrice)}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-white">{evt.title}</h3>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        title="Remove Event"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/organizer/events/${evt.id}/edit`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                        <span>Edit Page</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEditEvent(evt)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition hover:scale-105"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Event</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-400" />
                  <span>Edit Published Event</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Update details, schedule, venue, price, or capacity</p>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white"
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
                  <label className="block font-bold text-slate-300 uppercase mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white"
                  />
                </div>
              </div>

              {/* Visual Calendar Schedule Picker */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-indigo-400 uppercase text-[11px]">Event Schedule (Interactive Calendar)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DateTimePicker
                    label="Start Date & Time"
                    value={editingEvent.startDate}
                    onChange={(val) => setEditingEvent((prev: any) => ({ ...prev, startDate: val }))}
                    minDate={new Date()}
                    required
                  />
                  <DateTimePicker
                    label="End Date & Time"
                    value={editingEvent.endDate}
                    onChange={(val) => setEditingEvent((prev: any) => ({ ...prev, endDate: val }))}
                    minDate={new Date()}
                    required
                  />
                </div>
              </div>

              {/* Price & Capacity Inputs (Clean string inputs allowing 0 deletion) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Pass Price (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free"
                    value={editingEvent.basePrice}
                    onChange={(e) => setEditingEvent({ ...editingEvent, basePrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">₹0 or empty = Free</p>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 200"
                    value={editingEvent.totalCapacity}
                    onChange={(e) => setEditingEvent({ ...editingEvent, totalCapacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Available seats</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isDeletingEvent}
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold flex items-center gap-1.5 transition"
                >
                  {isDeletingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-rose-400" />}
                  <span>Remove Event</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingEvent}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    {isUpdatingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Edit Profile & Credentials</h3>
                <p className="text-xs text-slate-400">Update personal and college academic details</p>
              </div>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs: Personal Information vs College & Academic */}
            <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setEditTab('personal')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  editTab === 'personal'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal Info</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('academic')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  editTab === 'academic'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>College & Academic</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {editTab === 'personal' ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Anurag Rai"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Contact / Mobile Number *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                      placeholder="9723890793"
                      maxLength={15}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">College ID / Roll Number</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={profileForm.roll}
                      onChange={(e) => setProfileForm({ ...profileForm, roll: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                      placeholder="202310842"
                      maxLength={15}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Institutional Email (Verified)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-400 font-mono cursor-not-allowed"
                    />
                    <span className="text-[10px] text-emerald-400 mt-1 inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Collegiate domain verified
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">College / University *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.college}
                      onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                      placeholder="Indian Institute of Technology Delhi"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 uppercase mb-1">Department / Major</label>
                      <input
                        type="text"
                        value={profileForm.dept}
                        onChange={(e) => setProfileForm({ ...profileForm, dept: e.target.value })}
                        placeholder="Computer Science & Engineering"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 uppercase mb-1">Academic Batch / Year</label>
                      <input
                        type="text"
                        value={profileForm.batch}
                        onChange={(e) => setProfileForm({ ...profileForm, batch: e.target.value })}
                        placeholder="Class of 2027"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Campus Location / Residence</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="Hauz Khas, New Delhi"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditTab(editTab === 'personal' ? 'academic' : 'personal')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  {editTab === 'personal' ? 'Switch to College & Academic Details →' : '← Switch to Personal Info'}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
                  >
                    {isUpdatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}