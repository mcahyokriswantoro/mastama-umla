'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Shield,
  Clock,
  User,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch('/api/admin/audit-logs?limit=100');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/admin/export');
      if (!res.ok) {
        let errMessage = 'Gagal mengunduh berkas Excel.';
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        alert(errMessage);
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `REKAP_DIGITAL_PASSPORT_MASTAMA_UMLA_2026_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Terjadi kesalahan saat mengunduh Excel: ' + (err.message || ''));
    } finally {
      setDownloading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            EXPORT & AUDIT LOGS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            LAPORAN & AUDIT SISTEM
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Ekspor rekap lengkap passport ke format Microsoft Excel (.xlsx) dan telusuri jejak aktivitas sistem.
          </p>
        </div>

        {/* 1-Click Excel Download Button (Requirement 45) */}
        <button
          onClick={handleDownloadExcel}
          disabled={downloading}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
        >
          {downloading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? 'Memproses Excel...' : 'Download Rekap Passport (.xlsx)'}
        </button>
      </div>

      {/* Audit Logs Trail Table (Requirement 46) */}
      <div className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-umla-gold" />
              Sistem Audit Trail (Jejak Aktivitas Terinci)
            </h3>
            <p className="text-xs text-gray-400">Catatan kronologis login, approval, QR check-in, dan transaksi XP</p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari aksi, user, rincian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {loadingLogs ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-umla-gold animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Waktu (WIB)</th>
                  <th className="pb-3">Aksi</th>
                  <th className="pb-3">User & Peran</th>
                  <th className="pb-3">Rincian Perubahan / Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-umla-gold/20 text-umla-gold font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-white font-semibold">
                      {log.user?.fullName || 'Sistem'}
                      <span className="text-[10px] text-gray-400 block font-normal capitalize">
                        {log.user?.role?.toLowerCase().replace('_', ' ') || 'Internal'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
