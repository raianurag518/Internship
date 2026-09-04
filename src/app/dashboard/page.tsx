'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <p className="text-xs text-slate-400">Redirecting to College Profile...</p>
    </div>
  );
}
