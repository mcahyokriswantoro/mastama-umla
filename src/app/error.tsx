'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-panel bg-umla-navy-950 rounded-3xl p-8 text-center border border-rose-500/30 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-white">Terjadi Kendala Teknis</h2>
        <p className="text-xs text-gray-300 mt-2 leading-relaxed">
          {error.message || 'Sistem sedang memuat ulang halaman. Silakan coba kembali.'}
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-umla-gold text-umla-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
