'use client';
import React, { useEffect, useState } from 'react';
import { TransactionItem } from '@/types/escrow';
import { formatCurrency, formatDate } from '@/lib/utils';
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  useEffect(() => { fetch('/api/admin/transactions').then(r => r.json()).then(d => setTransactions(d.transactions || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white">Escrow Transaction History</h1>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
            <div><p className="font-mono text-indigo-400 font-bold">{tx.transactionNumber}</p><p className="text-sm font-bold text-white">{tx.ticket?.event?.title}</p></div>
            <p className="text-base font-extrabold text-emerald-400 font-mono">{formatCurrency(tx.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
