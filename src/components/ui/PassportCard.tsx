'use client';

import React from 'react';
import { Award, Shield, Sparkles, CheckCircle2, Lock, Check } from 'lucide-react';
import { UserSession } from '@/types';

interface PassportCardProps {
  user: UserSession;
  stamps?: {
    preMastama: boolean;
    opening: boolean;
    university: boolean;
    faculty: boolean;
    pensi: boolean;
    closing: boolean;
    ormawa: boolean;
    spiritual: boolean;
    aiChallenge: boolean;
  };
}

export default function PassportCard({ user, stamps }: PassportCardProps) {
  const profile = user.studentProfile;
  if (!profile) return null;

  const defaultStamps = stamps || {
    preMastama: true,
    opening: true,
    university: false,
    faculty: false,
    pensi: false,
    closing: false,
    ormawa: false,
    spiritual: false,
    aiChallenge: false,
  };

  const stampList = [
    { key: 'preMastama', label: 'PRA MASTAMA', code: 'PRA-26', unlocked: defaultStamps.preMastama, color: 'text-emerald-400 border-emerald-500' },
    { key: 'opening', label: 'OPENING DOME', code: 'OPN-26', unlocked: defaultStamps.opening, color: 'text-blue-400 border-blue-500' },
    { key: 'university', label: 'UNIVERSITAS', code: 'UNI-26', unlocked: defaultStamps.university, color: 'text-indigo-400 border-indigo-500' },
    { key: 'faculty', label: 'FAKULTAS & PRODI', code: 'FAK-26', unlocked: defaultStamps.faculty, color: 'text-amber-400 border-amber-500' },
    { key: 'pensi', label: 'PENSI & INAP', code: 'PNS-26', unlocked: defaultStamps.pensi, color: 'text-pink-400 border-pink-500' },
    { key: 'closing', label: 'PENUTUPAN', code: 'CLS-26', unlocked: defaultStamps.closing, color: 'text-purple-400 border-purple-500' },
    { key: 'ormawa', label: '15× ORMAWA', code: 'ORM-15', unlocked: defaultStamps.ormawa, color: 'text-cyan-400 border-cyan-500' },
    { key: 'spiritual', label: '24× DZUHUR', code: 'DZH-24', unlocked: defaultStamps.spiritual, color: 'text-teal-400 border-teal-500' },
    { key: 'aiChallenge', label: 'AI CHALLENGE', code: 'AIC-01', unlocked: defaultStamps.aiChallenge, color: 'text-yellow-400 border-yellow-500' },
  ];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel-gold border-2 border-umla-gold/50 shadow-2xl p-6 sm:p-8 bg-gradient-to-br from-umla-navy-950 via-umla-navy-900 to-umla-navy-950 text-white">
      {/* Background Watermark Stamp & Gold Lines */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-umla-gold/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Passport Header */}
      <div className="flex items-start justify-between border-b border-umla-gold/20 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo-umla.png"
            alt="Logo UMLA"
            className="h-10 sm:h-11 w-auto object-contain drop-shadow-lg"
          />
          <div>
            <span className="text-[10px] font-black tracking-widest text-umla-gold uppercase block">
              UNIVERSITAS MUHAMMADIYAH LAMONGAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              DIGITAL STUDENT PASSPORT
            </h2>
            <p className="text-[11px] text-umla-gold tracking-widest uppercase font-semibold">MASTAMA 2026 • OFFICIAL DOCUMENT</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] uppercase text-gray-400 font-mono tracking-wider">DOCUMENT ID</span>
          <p className="font-mono text-xs font-bold text-umla-gold">UMLA-{profile.nim}-2026</p>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-umla-gold/20 border border-umla-gold/40 text-[10px] font-bold text-umla-gold inline-block">
            ✨ {profile.totalXp || 0} / 2.850 XP ({Math.min(100, Math.round(((profile.totalXp || 0) / 2850) * 100))}%)
          </div>
        </div>
      </div>

      {/* Passport Bio Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        {/* Left: Photo & Holographic Seal */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-umla-gold/60 shadow-xl bg-umla-navy-800 p-1">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-umla-gold text-umla-navy-950 flex items-center justify-center font-black shadow-lg border-2 border-umla-navy-950 text-xs">
              ✓
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-2 uppercase tracking-widest">VERIFIED IDENTITY</p>
        </div>

        {/* Right: Personal & Academic Details */}
        <div className="md:col-span-8 grid grid-cols-2 gap-x-4 gap-y-3 text-left">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Nama Lengkap</span>
            <p className="font-bold text-sm text-white truncate">{user.fullName}</p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Nomor Induk Mahasiswa (NIM)</span>
            <p className="font-mono font-bold text-sm text-umla-gold">{profile.nim}</p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Fakultas</span>
            <p className="font-semibold text-xs text-gray-200 truncate">{profile.faculty.name}</p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Program Studi</span>
            <p className="font-semibold text-xs text-gray-200 truncate">{profile.studyProgram.name}</p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Kelompok MASTAMA</span>
            <p className="font-bold text-xs text-emerald-400">{profile.group?.name || 'Kelompok 07'}</p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pendamping Kelompok</span>
            <p className="font-semibold text-xs text-gray-200 truncate">{profile.group?.mentor || 'Budi Santoso, S.Kom.'}</p>
          </div>
        </div>
      </div>

      {/* Stamp Section */}
      <div className="pt-4 border-t border-umla-gold/20">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-umla-gold flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Official Journey Stamps
          </h4>
          <span className="text-[10px] text-gray-400 font-mono">
            {stampList.filter((s) => s.unlocked).length} / {stampList.length} STAMPS UNLOCKED
          </span>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {stampList.map((stamp) => (
            <div
              key={stamp.key}
              className={`relative h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                stamp.unlocked
                  ? `${stamp.color} bg-white/5 shadow-lg shadow-umla-gold/5 scale-100 hover:scale-105`
                  : 'border-white/10 text-gray-500 bg-black/20 opacity-40'
              }`}
            >
              {stamp.unlocked ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-[9px] font-black tracking-tight leading-tight">{stamp.label}</span>
                  <span className="text-[8px] font-mono mt-0.5 text-gray-400">{stamp.code}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-gray-500 mb-1" />
                  <span className="text-[9px] font-semibold text-gray-500 leading-tight">{stamp.label}</span>
                  <span className="text-[7px] text-gray-600 font-mono mt-0.5">LOCKED</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
