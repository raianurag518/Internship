import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-4">
      <h2 className="text-4xl font-black text-white">404 - Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-md">
        The requested page or campus event does not exist on UniPass.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
      >
        Return Home
      </Link>
    </div>
  );
}

