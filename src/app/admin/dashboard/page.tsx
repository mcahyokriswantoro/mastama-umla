'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  GraduationCap,
  Award,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Megaphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !statsData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-umla-gold animate-spin" />
      </div>
    );
  }

  const s = statsData.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[11px] font-black tracking-wider border border-purple-500/30">
              PANEL ADMINISTRATOR MASTAMA UMLA 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            EXECUTIVE ANALYTICS & MONITORING
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Pusat kendali 40 kelompok, seluruh journey, submission, analitik kehadiran, dan audit log.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/announcements"
            className="px-5 py-2.5 rounded-2xl bg-umla-gold hover:brightness-110 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-umla-gold/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Megaphone className="w-4 h-4" />
            Pengumuman
          </Link>
          <a
            href="/api/admin/export"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Rekap Excel (.xlsx)
          </a>
        </div>
      </div>

      {/* KPI Cards Grid (Requirement 43, 44) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <span className="text-[10px] uppercase font-bold text-gray-400">MAHASISWA</span>
          <p className="text-2xl font-black text-white mt-1">{s.totalStudents}</p>
          <span className="text-[10px] text-emerald-400 font-bold">Terdaftar</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <span className="text-[10px] uppercase font-bold text-gray-400">KELOMPOK</span>
          <p className="text-2xl font-black text-umla-gold mt-1">{s.totalGroups}</p>
          <span className="text-[10px] text-gray-400">40 Kelompok</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <span className="text-[10px] uppercase font-bold text-gray-400">PENDAMPING</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{s.totalMentors}</p>
          <span className="text-[10px] text-blue-300 font-bold">Aktif Bertugas</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <span className="text-[10px] uppercase font-bold text-gray-400">AKTIVITAS</span>
          <p className="text-2xl font-black text-purple-400 mt-1">{s.totalActivities}</p>
          <span className="text-[10px] text-gray-400">Dynamic Instances</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <span className="text-[10px] uppercase font-bold text-gray-400">PENDING REVIEW</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{s.pendingSubmissionsCount}</p>
          <span className="text-[10px] text-amber-200">Di Antrean</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20">
          <span className="text-[10px] uppercase font-bold text-gray-400">COMPLETED</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{s.completedSubmissionsCount}</p>
          <span className="text-[10px] text-emerald-300 font-bold">Approved</span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid (Requirement 44) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Faculty Distribution Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
          <h3 className="text-sm font-black text-white mb-1">Distribusi Mahasiswa per Fakultas</h3>
          <p className="text-xs text-gray-400 mb-6">Sebaran mahasiswa baru di 5 fakultas UMLA</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.facultyChartData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09142A', borderColor: '#D4AF37', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="students" fill="#D4AF37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Group Capacity Distribution */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
          <h3 className="text-sm font-black text-white mb-1">Kapasitas & Alokasi Kelompok</h3>
          <p className="text-xs text-gray-400 mb-6">Monitoring keterisian 40 kelompok</p>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {statsData.groupDistribution.map((g: any) => (
              <div key={g.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/5">
                <span className="font-bold text-white">{g.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-28 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, (g.members / g.capacity) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-gray-300 w-12 text-right">
                    {g.members}/{g.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs Trail (Requirement 46) */}
      <div className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-black text-white">System Audit Logs (Real-time Trail)</h3>
            <p className="text-xs text-gray-400">Pencatatan otentikasi, approval, QR check-in, dan transaksi XP</p>
          </div>
          <Link href="/admin/reports" className="text-xs font-bold text-umla-gold hover:underline">
            Lihat Semua Log →
          </Link>
        </div>

        <div className="space-y-2.5">
          {statsData.recentAuditLogs.map((log: any) => (
            <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-umla-gold/20 text-umla-gold font-mono font-bold text-[10px]">
                  {log.action}
                </span>
                <span className="text-gray-200">{log.details}</span>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                {new Date(log.createdAt).toLocaleTimeString('id-ID')} WIB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
