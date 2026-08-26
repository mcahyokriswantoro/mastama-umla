'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  X,
  Eye,
  Sun,
  Users,
  Compass,
  Cpu,
  ExternalLink,
} from 'lucide-react';

export default function MentorApprovalsPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [historySubmissions, setHistorySubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MASTAMA' | 'SPIRITUAL' | 'ORMAWA' | 'AI_PROJECT'>('ALL');

  // Selected submission for rejection modal
  const [rejectingSub, setRejectingSub] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mentor/approvals');
      const data = await res.json();
      setPendingSubmissions(data.pendingSubmissions || []);
      setHistorySubmissions(data.historySubmissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sub: any) => {
    setProcessingId(sub.id);
    try {
      const res = await fetch('/api/mentor/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: sub.id,
          submissionType: sub.type || 'MASTAMA',
          action: 'APPROVE',
          feedback: 'Disetujui dan memenuhi kriteria kehadiran/aktivitas.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSub || !rejectionReason.trim()) return;

    setProcessingId(rejectingSub.id);
    try {
      const res = await fetch('/api/mentor/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: rejectingSub.id,
          submissionType: rejectingSub.type || 'MASTAMA',
          action: 'REJECT',
          feedback: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRejectingSub(null);
        setRejectionReason('');
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPending = pendingSubmissions.filter((s) => {
    if (categoryFilter === 'ALL') return true;
    return s.type === categoryFilter;
  });

  const filteredHistory = historySubmissions.filter((s) => {
    if (categoryFilter === 'ALL') return true;
    return s.type === categoryFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PENDAMPING KELOMPOK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">APPROVAL CENTER</h1>
          <p className="text-xs text-gray-400">
            Review dan validasi bukti MASTAMA, Sholat Dzuhur Berjamaah, dan ORMAWA mahasiswa binaan Anda.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel bg-umla-navy-950 border border-white/10">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-umla-gold text-umla-navy-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Menunggu Review ({pendingSubmissions.length})
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-umla-gold text-umla-navy-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Riwayat Approval ({historySubmissions.length})
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'ALL'
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Semua Kategori
        </button>

        <button
          onClick={() => setCategoryFilter('MASTAMA')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === 'MASTAMA'
              ? 'bg-umla-gold text-umla-navy-950 shadow'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          5 Journey MASTAMA
        </button>

        <button
          onClick={() => setCategoryFilter('SPIRITUAL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === 'SPIRITUAL'
              ? 'bg-teal-500 text-white shadow'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          24× Sholat Dzuhur
        </button>

        <button
          onClick={() => setCategoryFilter('ORMAWA')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === 'ORMAWA'
              ? 'bg-cyan-500 text-white shadow'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          15× ORMAWA
        </button>

        <button
          onClick={() => setCategoryFilter('AI_PROJECT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === 'AI_PROJECT'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          AI Challenge
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-umla-gold animate-spin" />
        </div>
      ) : activeTab === 'PENDING' ? (
        <div className="space-y-4">
          {filteredPending.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel bg-umla-navy-950 text-center border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-black text-white">Semua Submission Telah Diverifikasi!</h3>
              <p className="text-xs text-gray-400 mt-1">Tidak ada antrean approval yang tertunda untuk kelompok Anda.</p>
            </div>
          ) : (
            filteredPending.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-3xl glass-panel bg-umla-navy-950 border-2 border-umla-gold/30 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-umla-gold/60 transition-all"
              >
                {/* Left: Student & Activity Details */}
                <div className="flex items-start gap-4">
                  {/* Evidence Photo / Icon Preview */}
                  {sub.type === 'AI_PROJECT' ? (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex flex-col items-center justify-center text-purple-400 shrink-0 shadow-lg p-2 text-center">
                      <Cpu className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-black text-purple-300">AI REPORT</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => sub.evidencePhoto && setPreviewPhoto(sub.evidencePhoto)}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-umla-navy-900 border border-umla-gold/40 shrink-0 cursor-pointer group shadow-lg"
                    >
                      <img
                        src={sub.evidencePhoto || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'}
                        alt={sub.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                        {sub.student.group?.name || 'Kelompok 07'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">NIM: {sub.student.nim}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                        sub.type === 'SPIRITUAL'
                          ? 'bg-teal-500/20 text-teal-300'
                          : sub.type === 'ORMAWA'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : sub.type === 'AI_PROJECT'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-umla-gold/20 text-umla-gold'
                      }`}>
                        {sub.category}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">{sub.student.user.fullName}</h3>
                    <p className="text-xs text-umla-gold font-bold">{sub.title}</p>

                    <p className="text-xs text-gray-300 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed mt-2">
                      "{sub.description}"
                    </p>

                    {sub.type === 'AI_PROJECT' && (
                      <div className="flex flex-wrap gap-2 pt-1.5">
                        {sub.proposalUrl && (
                          <a
                            href={sub.proposalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold border border-purple-500/30 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Dokumen / Laporan
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {sub.demoUrl && (
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Demo / Video Karya
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-umla-gold" />
                        {new Date(sub.submittedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                      {sub.type !== 'AI_PROJECT' && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-umla-gold" />
                          {sub.locationNote || 'Masjid Ki Bagus Hadikusumo UMLA'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Approve & Reject Actions */}
                <div className="flex items-center gap-3 shrink-0 lg:border-l lg:border-white/10 lg:pl-6">
                  <button
                    onClick={() => setRejectingSub(sub)}
                    disabled={processingId === sub.id}
                    className="px-5 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                    Tolak
                  </button>

                  <button
                    onClick={() => handleApprove(sub)}
                    disabled={processingId === sub.id}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    {processingId === sub.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        Setujui (+{sub.xpReward} XP)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="space-y-3">
          {filteredHistory.map((sub) => {
            const isApproved = sub.status === 'COMPLETED' || sub.status === 'APPROVED';

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl glass-panel bg-umla-navy-950/70 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-white">{sub.student.user.fullName}</p>
                      <span className="text-[10px] text-gray-400 font-mono">({sub.student.group?.name || 'Kelompok'})</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-gray-300 font-bold">{sub.category}</span>
                    </div>
                    <p className="text-xs text-gray-300">{sub.title}</p>
                    {sub.feedback && (
                      <p className="text-[11px] text-gray-400 italic mt-0.5">Catatan: "{sub.feedback}"</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {isApproved ? 'DISETUJUI' : 'DITOLAK'}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(sub.submittedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-rose-500/40 shadow-2xl">
            <h3 className="text-base font-black text-white mb-1">Tolak Submission / Presensi</h3>
            <p className="text-xs text-gray-300 mb-4">
              Berikan catatan alasan penolakan agar <span className="text-white font-bold">{rejectingSub.student.user.fullName}</span> dapat memperbaiki foto/bukti kegiatannya.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Alasan Penolakan <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Foto kurang jelas / tidak memperlihatkan lokasi Masjid Ki Bagus Hadikusumo UMLA..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSub(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingSub.id}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center"
                >
                  {processingId === rejectingSub.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Kirim Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden border-2 border-umla-gold/50 shadow-2xl">
            <img src={previewPhoto} alt="Bukti Kegiatan" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
