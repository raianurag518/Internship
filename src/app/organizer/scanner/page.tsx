'use client';
import React from 'react';
import QRScannerComponent from '@/components/scanner/QRScannerComponent';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function OrganizerScannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
      <h1 className="text-3xl font-black text-white">Gate Admission Scanner</h1>
      <QRScannerComponent />
    </div>
  );
}
