'use client';

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, X, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  activityId?: string;
  activityTitle?: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export default function QrScannerModal({
  isOpen,
  activityId,
  activityTitle,
  onClose,
  onSuccess,
}: QrScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);

  useEffect(() => {
    let scanner: any = null;

    if (isOpen && !scanResult) {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText: string) => {
            handleValidateQr(decodedText);
            try {
              scanner.clear();
            } catch (e) {}
          },
          (errorMessage: any) => {
            // Ignore scan errors while seeking
          }
        );
      } catch (err) {
        console.warn('QR Scanner init info:', err);
      }
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [isOpen, scanResult]);

  if (!isOpen) return null;

  const handleValidateQr = async (code: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/submissions/checkin-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: code,
          activityId: activityId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'QR Code tidak valid.');
      } else {
        setScanResult(data);
        onSuccess(data);
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidateQr(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-umla-gold/40 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-umla-gold" />
            <h3 className="text-base font-bold text-white">QR Check-in Presensi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activityTitle && (
          <p className="text-xs text-umla-gold mt-2 font-medium">Aktivitas: {activityTitle}</p>
        )}

        {/* Scan Result Success View */}
        {scanResult ? (
          <div className="my-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">{scanResult.message}</h4>
            <p className="text-xs text-gray-300 mt-1">{scanResult.activityTitle}</p>

            {scanResult.xpEarned > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/20 text-umla-gold text-xs font-bold mt-4 border border-umla-gold/40">
                <Sparkles className="w-4 h-4" />
                +{scanResult.xpEarned} XP Didapatkan!
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 rounded-xl bg-umla-gold text-umla-navy-950 font-bold text-sm shadow-lg shadow-umla-gold/20 hover:scale-[1.02] transition-transform"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            {/* Camera Viewport */}
            <div className="my-4">
              <div
                id="qr-reader-container"
                className="overflow-hidden rounded-2xl border-2 border-dashed border-umla-gold/30 bg-umla-navy-900/80 text-white min-h-[220px] flex items-center justify-center"
              />
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Manual Code Input Fallback */}
            <form onSubmit={handleManualSubmit} className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <p className="text-[11px] text-gray-400">Atau masukkan kode rahasia QR secara manual:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: QR-ACT_OPEN_01-2026"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs glass-input font-mono"
                />
                <button
                  type="submit"
                  disabled={loading || !manualCode.trim()}
                  className="px-4 py-2 rounded-xl bg-umla-gold/20 hover:bg-umla-gold/30 border border-umla-gold/40 text-umla-gold font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verifikasi'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
