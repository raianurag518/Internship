const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`[PART 5] Wrote ${relPath} (${content.length} chars)`);
}

save('src/app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #020617;
  --foreground: #f8fafc;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  min-height: 100vh;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #020617;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`);

save('src/app/layout.tsx', `
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DemoSwitcher from '@/components/common/DemoSwitcher';

export const metadata: Metadata = {
  title: 'CampusConnect – Multi-Platform College Event Aggregator & Secure Ticket Escrow',
  description:
    'Production-grade college event aggregation platform with P2P escrow clearinghouse, 15% anti-scalping price caps, and dynamic 30s TOTP QR verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <DemoSwitcher />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
`);

save('src/app/admin/transactions/page.tsx', `
'use client';

import React, { useEffect, useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Repeat, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/transactions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.transactions) setTransactions(data.transactions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Hub</span>
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Escrow Settlement Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete ledger of secondary market ticket transfers and automated 2% fee collections.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Tx Number</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Buyer</th>
              <th className="py-3 px-4">Seller</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Fee</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-indigo-400 font-bold">{tx.transactionNumber}</td>
                <td className="py-3 px-4 text-white">{tx.ticket?.event?.title}</td>
                <td className="py-3 px-4 text-slate-300">{tx.buyer?.name}</td>
                <td className="py-3 px-4 text-slate-300">{tx.seller?.name}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{formatCurrency(tx.amount)}</td>
                <td className="py-3 px-4 text-slate-400">{formatCurrency(tx.platformFee)}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    {tx.transactionStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

console.log('[PART 5] Completed globals.css, layout.tsx, and admin transactions page!');

