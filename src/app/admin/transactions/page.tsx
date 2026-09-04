'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/transactions')
      .then((res) => (res.ok ? res.json() : { transactions: [] }))
      .then((data) => setTransactions(data.transactions || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 pt-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Panel</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-white">Escrow Clearinghouse Transactions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete ledger of peer trades, held vaults, and released seller payouts.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <th className="pb-3 px-2">Txn Number</th>
              <th className="pb-3 px-2">Event Title</th>
              <th className="pb-3 px-2">Buyer</th>
              <th className="pb-3 px-2">Seller</th>
              <th className="pb-3 px-2">Escrow Amount</th>
              <th className="pb-3 px-2">Status</th>
              <th className="pb-3 px-2 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-950/40">
                <td className="py-3 px-2 font-mono text-indigo-400 font-bold">{t.transactionNumber}</td>
                <td className="py-3 px-2 font-bold text-white max-w-[180px] truncate">
                  {t.ticket?.event?.title || 'Campus Event'}
                </td>
                <td className="py-3 px-2 text-slate-300">{t.buyer?.name}</td>
                <td className="py-3 px-2 text-slate-300">{t.seller?.name}</td>
                <td className="py-3 px-2 font-mono font-bold text-emerald-400">{formatCurrency(t.amount)}</td>
                <td className="py-3 px-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {t.transactionStatus}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-slate-500 font-mono text-[11px]">
                  {formatDate(t.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

