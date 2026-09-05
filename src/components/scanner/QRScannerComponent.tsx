'use client';
import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  Users,
  Building2,
  Mail,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AttendeeTicket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: string;
  isUsed: boolean;
  usedAt?: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    college: string;
    startDate: string;
    venue: string;
  };
  category?: {
    id: string;
    name: string;
    price: number;
  };
  currentOwner?: {
    id: string;
    name: string;
    email: string;
    college: string;
    studentId?: string | null;
    department?: string | null;
  };
}

export default function QRScannerComponent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

  // Scanner state
  const [inputToken, setInputToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Manual Roster state
  const [attendees, setAttendees] = useState<AttendeeTicket[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Fetch attendee roster for manual verification
  const fetchAttendees = async () => {
    setIsLoadingAttendees(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedEventId !== 'ALL') params.append('eventId', selectedEventId);

      const res = await fetch('/api/organizer/registrations?' + params.toString());
      const data = await res.json();
      if (data.tickets) {
        setAttendees(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manual') {
      fetchAttendees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedEventId]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendees();
  };

  // Handle QR / Serial Scanner validation
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
      if (data.isValid) {
        showToast(`Pass Verified! Welcome ${data.ticket?.currentOwner?.name || 'Attendee'}`, 'success');
      } else {
        showToast(data.message || 'Admission denied', 'error');
      }
    } catch (err: any) {
      setScanResult({ isValid: false, code: 'NETWORK_ERROR', message: 'Could not connect to Gate Admission API.' });
      showToast('Network error verifying ticket', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle Manual Check-In from roster
  const handleManualCheckIn = async (t: AttendeeTicket) => {
    setCheckingInId(t.id);
    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: t.ticketNumber }),
      });
      const data = await res.json();
      if (data.isValid) {
        showToast(`Manual Check-In Approved for ${t.currentOwner?.name}!`, 'success');
        setAttendees((prev) =>
          prev.map((item) =>
            item.id === t.id ? { ...item, isUsed: true, status: 'USED', usedAt: new Date().toISOString() } : item
          )
        );
        setScanResult(data);
      } else {
        showToast(data.message || 'Manual verification failed', 'error');
        setScanResult(data);
      }
    } catch (err: any) {
      showToast('Error executing manual check-in', 'error');
    } finally {
      setCheckingInId(null);
    }
  };

  // Extract unique events for the filter dropdown
  const uniqueEvents = Array.from(
    new Map(
      attendees
        .filter((a) => a.event)
        .map((a) => [a.event!.id, { id: a.event!.id, title: a.event!.title }])
    ).values()
  );

  const totalRegistered = attendees.length;
  const totalCheckedIn = attendees.filter((a) => a.isUsed).length;

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-full sm:w-max">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scan'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Dynamic QR / Serial Scanner</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'manual'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Manual Attendee Verification & Check-In</span>
        </button>
      </div>

      {/* TAB 1: DYNAMIC QR & TICKET SERIAL SCANNER */}
      {activeTab === 'scan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Cryptographic Gate Scanner</h3>
                  <p className="text-xs text-slate-400">
                    Scan live mobile QR code or enter pass serial (e.g. <span className="font-mono text-indigo-400">CC-TKT-...</span>)
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Dynamic QR Payload or Pass Serial Number
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="Scan QR barcode, or paste Ticket Serial (e.g. CC-TKT-207582-CAA2D4) or QR token"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Compatible with 2D barcode scanner guns, camera scanners, and manual serial entry.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isScanning || !inputToken.trim()}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isScanning ? 'Authenticating...' : 'Validate Entrance Pass'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputToken('');
                    setScanResult(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL ATTENDEE VERIFICATION & ROSTER */}
      {activeTab === 'manual' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Manual Attendee Identity Verification</h3>
                  <p className="text-xs text-slate-400">
                    Verify attendees manually via college ID card, student roll number, or institutional email
                  </p>
                </div>
              </div>

              {/* Attendance quick stats */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Check-In Status</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {totalCheckedIn} / {totalRegistered} Admitted
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchAttendees}
                  disabled={isLoadingAttendees}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Refresh Attendee Roster"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingAttendees ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search & Event Filters */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search attendee by Name, Roll No / Student ID, Email, or Ticket Serial..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {uniqueEvents.length > 0 && (
                <div className="sm:w-64">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ALL">All Hosted Events</option>
                    {uniqueEvents.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Attendee Roster List */}
            <div className="space-y-3">
              {isLoadingAttendees ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                  <p className="text-xs">Fetching registered attendees...</p>
                </div>
              ) : attendees.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <Users className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-bold text-slate-300">No registered attendees found</p>
                  <p className="text-[11px] text-slate-500">
                    {searchQuery ? 'Try adjusting your search keywords' : 'Attendees who reserve tickets will appear here'}
                  </p>
                </div>
              ) : (
                attendees.map((att) => {
                  const owner = att.currentOwner;
                  const isAdmitted = att.isUsed || att.status === 'USED';

                  return (
                    <div
                      key={att.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isAdmitted
                          ? 'bg-slate-950/50 border-slate-800/80 opacity-75'
                          : 'bg-slate-950 border-slate-800 hover:border-purple-500/50'
                      }`}
                    >
                      {/* Left: Attendee Identity */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center font-black text-sm shrink-0">
                          {owner?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-sm text-white">{owner?.name || 'Anonymous Student'}</h4>
                            {owner?.studentId && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-indigo-300">
                                Roll #{owner.studentId}
                              </span>
                            )}
                            {isAdmitted ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Admitted
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                Ready for Entry
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{owner?.college || 'College'}</span>
                            </span>
                            {owner?.email && (
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                {owner.email}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 font-mono pt-0.5">
                            <span>Pass: <strong className="text-slate-300">{att.ticketNumber}</strong></span>
                            {att.category && (
                              <span>Tier: <strong className="text-purple-300">{att.category.name}</strong></span>
                            )}
                            {att.event && (
                              <span className="text-slate-400">Event: <strong>{att.event.title}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Manual Verification Action */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                        {isAdmitted ? (
                          <div className="text-right text-[11px] text-slate-500 font-mono">
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pass Consumed
                            </span>
                            {att.usedAt && (
                              <p className="text-[10px] text-slate-500">
                                {new Date(att.usedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={checkingInId === att.id}
                            onClick={() => handleManualCheckIn(att)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 hover:scale-105"
                          >
                            {checkingInId === att.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Verify ID & Admit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCAN RESULT BANNER (Shared across both tabs) */}
      {scanResult && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 ${
            scanResult.isValid
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
              : scanResult.code === 'ALREADY_USED'
              ? 'bg-amber-950/80 border-amber-500 text-amber-100'
              : 'bg-rose-950/80 border-rose-500 text-rose-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {scanResult.isValid ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : scanResult.code === 'ALREADY_USED' ? (
              <AlertCircle className="w-8 h-8 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <h4 className="text-lg font-black tracking-tight">
                {scanResult.isValid
                  ? 'ADMISSION GRANTED (PASS VALID)'
                  : scanResult.code === 'ALREADY_USED'
                  ? 'ENTRY DENIED: PASS ALREADY USED'
                  : 'ENTRY DENIED: INVALID OR FRAUDULENT PASS'}
              </h4>
              <p className="text-xs opacity-90">{scanResult.message}</p>
            </div>
          </div>
          {scanResult.ticket && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="opacity-75">Event:</span>
                <span className="font-bold">{scanResult.ticket.event?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Verified Attendee:</span>
                <span className="font-bold">
                  {scanResult.ticket.currentOwner?.name} ({scanResult.ticket.currentOwner?.college})
                </span>
              </div>
              {scanResult.ticket.currentOwner?.studentId && (
                <div className="flex justify-between">
                  <span className="opacity-75">College Student ID / Roll:</span>
                  <span className="font-mono font-bold text-indigo-300">
                    {scanResult.ticket.currentOwner?.studentId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="opacity-75">Pass Serial:</span>
                <span className="font-mono font-bold">{scanResult.ticket.ticketNumber}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
