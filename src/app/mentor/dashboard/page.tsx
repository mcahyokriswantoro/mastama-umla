'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Compass,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function MentorDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [groupData, setGroupData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, matrixRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/mentor/group-matrix'),
      ]);

      const uData = await userRes.json();
      const mData = await matrixRes.json();

      setCurrentUser(uData.user);
      setGroupData(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-umla-gold animate-spin" />
      </div>
    );
  }

  const group = groupData?.group;
  const stats = groupData?.stats;
  const members = groupData?.members || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header (Requirement 39) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-black tracking-wider border border-blue-500/30">
              PORTAL PENDAMPING KELOMPOK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase">
            WELCOME, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Memonitoring & memvalidasi mahasiswa kelompok binaan: <span className="text-umla-gold font-bold">{group?.name || 'Kelompok 07'}</span>
          </p>
        </div>

        <Link
          href="/mentor/approvals"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-umla-gold to-yellow-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-umla-gold/25 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Buka Approval Center ({stats?.pendingApprovalsCount || 1})
        </Link>
      </div>

      {/* QUICK STATS (Requirement 39) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">KELOMPOK BINAAN</span>
            <Users className="w-4 h-4 text-umla-gold" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{group?.name || 'Kelompok 07'}</p>
          <span className="text-[10px] text-gray-400">{members.length} / {group?.capacity || 30} Mahasiswa</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">ATTENDANCE HARI INI</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {members.length > 0 ? members.length - 1 : 0} <span className="text-xs text-gray-400 font-normal">/ {members.length}</span>
          </p>
          <span className="text-[10px] text-emerald-300 font-medium">95% Hadir</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">MASTAMA PROGRESS</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-gold-gradient mt-1">{stats?.avgProgress || 75}%</p>
          <span className="text-[10px] text-gray-400">Rata-rata Kelompok</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">PENDING APPROVAL</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats?.pendingApprovalsCount || 1}</p>
          <span className="text-[10px] text-amber-200">Perlu Review Segera</span>
        </div>
      </div>

      {/* Member Progress Table Preview */}
      <div className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-black text-white">Anggota {group?.name || 'Kelompok 07'}</h3>
            <p className="text-xs text-gray-400">Daftar mahasiswa baru di bawah bimbingan Anda</p>
          </div>
          <Link
            href="/mentor/members"
            className="text-xs font-bold text-umla-gold hover:underline flex items-center gap-1"
          >
            Lihat Matriks Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Mahasiswa</th>
                <th className="pb-3">NIM</th>
                <th className="pb-3">Program Studi</th>
                <th className="pb-3">Total XP</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <img src={m.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <span>{m.fullName}</span>
                  </td>
                  <td className="py-3 font-mono text-umla-gold font-bold">{m.nim}</td>
                  <td className="py-3 text-gray-300">{m.studyProgram}</td>
                  <td className="py-3 font-bold text-emerald-400">{m.totalXp} XP</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-umla-gold rounded-full" style={{ width: `${m.progressPercent}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-300">{m.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href="/mentor/approvals"
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-umla-gold/20 text-white hover:text-umla-gold font-bold text-[10px]"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
