'use client';
import React, { useEffect, useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import EscrowCheckoutModal from '@/components/escrow/EscrowCheckoutModal';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Search, Building2, Lock, Repeat, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ResalePage() {
  const [listings, setListings] = useState<ResaleListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<ResaleListingItem | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      const res = await fetch('/api/resale?' + params.toString());
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fair P2P Clearinghouse • 100% Face Value Price Cap Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Student Ticket Resale & Escrow Vault</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Zero-scalping peer-to-peer ticket clearinghouse. All passes are capped strictly at 100% of original face value. When purchased, original tokens are atomically invalidated and re-minted for the buyer in Indian Rupees (₹).
        </p>
      </div>

      {/* Listings Grid or Clean Empty State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-mono">Loading P2P Escrow Clearinghouse...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-lg">
            <Repeat className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">No Passes Currently Listed in P2P Escrow</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              There are currently no resale passes listed. When a student lists an unwanted ticket from their vault (at or below 100% face value), it will immediately appear here for escrow purchase.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/tickets"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition hover:scale-105"
            >
              <Repeat className="w-4 h-4" />
              <span>List a Pass from My Vault</span>
            </Link>
            <Link
              href="/events"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>Explore Direct Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition duration-200 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-indigo-400 font-bold text-xs">#{listing.ticket?.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                    100% Capped
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white line-clamp-1">{listing.ticket?.event?.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{listing.ticket?.event?.college}</span>
                </p>
                {listing.note && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    &quot;{listing.note}&quot;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Resale Price</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(listing.askingPrice)}</p>
                </div>
                <button
                  onClick={() => setSelectedListing(listing)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition hover:scale-105"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Escrow Buy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedListing && (
        <EscrowCheckoutModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={() => fetchListings()}
        />
      )}
    </div>
  );
}