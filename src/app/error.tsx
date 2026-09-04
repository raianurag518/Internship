'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-4">
      <h2 className="text-2xl sm:text-3xl font-black text-white">Something went wrong</h2>
      <p className="text-xs text-slate-400 max-w-md">
        {error?.message || 'An unexpected error occurred. Please try again or return to the homepage.'}
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

