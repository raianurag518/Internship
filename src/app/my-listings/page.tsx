'use client';
import React, { useEffect, useState } from 'react';
import { ResaleListingItem } from '@/types/escrow';
import { formatCurrency } from '@/lib/utils';
import { Repeat } from 'lucide-react';
export default function MyListingsPage() {
  const [listings, setListings] = useState<ResaleListingItem[]>([]);
  useEffect(() => { fetch('/api/resale').then(r => r.json()).then(d => setListings(d.listings || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">My Active Resale Listings</h1>
      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div><p className="font-bold text-white text-base">{l.ticket?.event?.title}</p><p className="text-xs text-slate-400">{l.ticket?.event?.college}</p></div>
            <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(l.askingPrice)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
