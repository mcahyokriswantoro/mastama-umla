'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ backgroundColor: '#09142A', color: '#FFFFFF', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D4AF37' }}>Sistem Sedang Memuat Ulang</h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.5rem' }}>Silakan muat ulang halaman.</p>
          <button
            onClick={() => reset()}
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#D4AF37', color: '#09142A', border: 'none', borderRadius: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
