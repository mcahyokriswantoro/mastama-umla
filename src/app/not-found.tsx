import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-panel bg-umla-navy-950 rounded-3xl p-8 text-center border border-umla-gold/30 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-umla-gold/20 text-umla-gold flex items-center justify-center mx-auto mb-4 border border-umla-gold/40">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-umla-gold">404 NOT FOUND</span>
        <h2 className="text-2xl font-black text-white mt-1">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400 mt-2">
          Rute perjalanan yang Anda cari tidak tersedia di sistem Digital Student Passport UMLA.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-umla-gold text-umla-navy-950 font-black text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-lg"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
