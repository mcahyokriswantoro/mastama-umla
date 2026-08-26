'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  Sparkles,
  Shield,
  QrCode,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import PassportCard from '@/components/ui/PassportCard';
import { UserSession } from '@/types';

export default function PassportPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        setCurrentUser(data.user);

        // Generate dynamic QR Code for student ID pass
        const nim = data.user.studentProfile?.nim || '240101001';
        const qrData = JSON.stringify({
          nim,
          name: data.user.fullName,
          doc: `UMLA-${nim}-2026`,
        });
        const qrImg = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#0F2042',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrImg);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Award className="w-8 h-8 text-umla-gold animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Memuat Digital Passport...</p>
        </div>
      </div>
    );
  }

  const profile = currentUser.studentProfile;
  const badges = profile?.badges || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/15 text-umla-gold text-xs font-bold mb-3 border border-umla-gold/30">
          <Award className="w-3.5 h-3.5" />
          OFFICIAL CREDENTIAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">DIGITAL STUDENT PASSPORT</h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-2">
          Identitas resmi perjalanan mahasiswa Universitas Muhammadiyah Lamongan.
        </p>
      </div>

      {/* Main Realistic Passport Card */}
      <PassportCard user={currentUser} />

      {/* Grid: QR Identity Pass + Badges Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: QR Identity Card */}
        <div className="md:col-span-4 p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 text-center flex flex-col items-center justify-between">
          <div className="w-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-umla-gold flex items-center justify-center gap-1 mb-2">
              <QrCode className="w-4 h-4" />
              STUDENT QR ID PASS
            </span>
            <p className="text-xs text-gray-300">Tunjukkan saat check-in presensi di posko & gate kegiatan UMLA.</p>

            {/* QR Code Container */}
            <div className="my-6 p-4 rounded-2xl bg-white shadow-2xl inline-block border-4 border-umla-gold/50">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Student QR Pass" className="w-44 h-44 mx-auto" />
              ) : (
                <div className="w-44 h-44 bg-gray-200 animate-pulse" />
              )}
            </div>

            <p className="font-mono text-xs font-bold text-white">{profile?.nim}</p>
            <p className="text-[10px] text-gray-400">Scan untuk verifikasi kehadiran pendamping</p>
          </div>
        </div>

        {/* Right: Badges & Achievements Showcase (Requirement 37) */}
        <div className="md:col-span-8 p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-umla-gold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                ACHIEVEMENT BADGES
              </span>
              <h3 className="text-lg font-black text-white">Koleksi Lencana Kehormatan</h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-umla-gold/20 text-umla-gold border border-umla-gold/30">
              {badges.length} / 8 Terbuka
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { code: 'FIRST_STEP', name: 'First Step', desc: 'Aktivitas pertama selesai', unlocked: true },
              { code: 'PRE_MASTAMA', name: 'Pioneer 2026', desc: 'Lulus Pra MASTAMA', unlocked: true },
              { code: 'OPENING_HONOR', name: 'Opening Champion', desc: 'Hadir di DOME UMLA', unlocked: true },
              { code: 'MASTAMA_COMPLETED', name: 'MASTAMA Graduate', desc: '5 Journey tuntas', unlocked: false },
              { code: 'ORMAWA_EXPLORER', name: 'ORMAWA Explorer', desc: '15 aktivitas ORMAWA', unlocked: false },
              { code: 'SPIRITUAL_WARRIOR', name: 'Spiritual Champion', desc: '24 Sholat Dzuhur', unlocked: false },
              { code: 'AI_INNOVATOR', name: 'AI Innovator', desc: 'Proyek AI tuntas', unlocked: false },
              { code: 'UMLA_EXPLORER', name: 'True UMLA Legend', desc: 'Semua misi lengkap', unlocked: false },
            ].map((badge) => (
              <div
                key={badge.code}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  badge.unlocked
                    ? 'glass-panel-gold bg-umla-navy-900 border-umla-gold/60 shadow-lg shadow-umla-gold/10'
                    : 'bg-black/30 border-white/5 opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold ${
                  badge.unlocked ? 'bg-umla-gold text-umla-navy-950 shadow-md' : 'bg-white/5 text-gray-500'
                }`}>
                  {badge.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>
                <h4 className="text-xs font-black text-white">{badge.name}</h4>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{badge.desc}</p>
                {badge.unlocked && (
                  <span className="inline-block mt-2 text-[8px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    UNLOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
