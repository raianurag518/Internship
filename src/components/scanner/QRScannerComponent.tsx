'use client';
import React, { useState } from 'react';
import { QrCode, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function QRScannerComponent() {
  const [inputToken, setInputToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

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
    } catch (err: any) {
      setScanResult({ isValid: false, code: 'NETWORK_ERROR', message: 'Could not connect to Gate Admission API.' });
    } finally { setIsScanning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30"><QrCode className="w-5 h-5" /></div>
          <div>
            <h3 className="font-extrabold text-base text-white">Cryptographic Gate Scanner</h3>
            <p className="text-xs text-slate-400">Optical barcode reader or manual HMAC token validator for entrance security.</p>
          </div>
        </div>
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Attendee Dynamic QR Payload / Token</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="e.g. cc_sec_alex_stanford_hackathon_001 or cc_sec_...:123456"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isScanning || !inputToken.trim()} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /><span>{isScanning ? 'Authenticating...' : 'Validate Entrance Pass'}</span>
            </button>
            <button type="button" onClick={() => { setInputToken(''); setScanResult(null); }} className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors">Reset</button>
          </div>
        </form>
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Instant Demo Test Tokens:</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setInputToken('cc_sec_alex_stanford_hackathon_001')} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 hover:border-indigo-500">Stanford Pass (Active)</button>
            <button type="button" onClick={() => setInputToken('cc_sec_alex_mit_concert_002')} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 hover:border-amber-500">MIT Resale Pass</button>
            <button type="button" onClick={() => setInputToken('cc_fake_forged_screenshot_token')} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-400 hover:border-rose-500">Counterfeit Pass</button>
          </div>
        </div>
      </div>
      {scanResult && (
        <div className={'p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 ' + (scanResult.isValid ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100' : scanResult.code === 'ALREADY_USED' ? 'bg-amber-950/80 border-amber-500 text-amber-100' : 'bg-rose-950/80 border-rose-500 text-rose-100')}>
          <div className="flex items-center gap-3">
            {scanResult.isValid ? <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" /> : scanResult.code === 'ALREADY_USED' ? <AlertCircle className="w-8 h-8 text-amber-400 shrink-0" /> : <XCircle className="w-8 h-8 text-rose-400 shrink-0" />}
            <div>
              <h4 className="text-lg font-black tracking-tight">{scanResult.isValid ? 'ADMISSION GRANTED (PASS VALID)' : scanResult.code === 'ALREADY_USED' ? 'ENTRY DENIED: PASS ALREADY USED' : 'ENTRY DENIED: INVALID OR FRAUDULENT PASS'}</h4>
              <p className="text-xs opacity-90">{scanResult.message}</p>
            </div>
          </div>
          {scanResult.ticket && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between"><span className="opacity-75">Event:</span><span className="font-bold">{scanResult.ticket.event?.title}</span></div>
              <div className="flex justify-between"><span className="opacity-75">Verified Attendee:</span><span className="font-bold">{scanResult.ticket.currentOwner?.name} ({scanResult.ticket.currentOwner?.college})</span></div>
              <div className="flex justify-between"><span className="opacity-75">Pass Serial:</span><span className="font-mono font-bold">{scanResult.ticket.ticketNumber}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
