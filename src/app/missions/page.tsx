'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sun,
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Camera,
  Upload,
  Plus,
  ExternalLink,
  Github,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import BadgeModal from '@/components/ui/BadgeModal';

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState<'ORMAWA' | 'SPIRITUAL' | 'AI_CHALLENGE'>('ORMAWA');
  const [loading, setLoading] = useState(true);

  // Data states
  const [ormawaData, setOrmawaData] = useState<any>(null);
  const [spiritualData, setSpiritualData] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);

  // ORMAWA modal state
  const [selectedOrmawaSlot, setSelectedOrmawaSlot] = useState<any | null>(null);
  const [ormawaTitle, setOrmawaTitle] = useState('');
  const [ormawaName, setOrmawaName] = useState('');
  const [ormawaDesc, setOrmawaDesc] = useState('');
  const [ormawaPhoto, setOrmawaPhoto] = useState('');
  const [ormawaError, setOrmawaError] = useState<string | null>(null);
  const [submittingOrmawa, setSubmittingOrmawa] = useState(false);

  // SPIRITUAL Dzuhur modal state
  const [selectedDzuhurSlot, setSelectedDzuhurSlot] = useState<any | null>(null);
  const [dzuhurDate, setDzuhurDate] = useState(new Date().toISOString().split('T')[0]);
  const [dzuhurLocation, setDzuhurLocation] = useState('Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan');
  const [dzuhurPhoto, setDzuhurPhoto] = useState('');
  const [dzuhurError, setDzuhurError] = useState<string | null>(null);
  const [submittingSpiritual, setSubmittingSpiritual] = useState(false);
  const [dzuhurMessage, setDzuhurMessage] = useState<string | null>(null);

  // AI Challenge form state
  const [teamName, setTeamName] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiDesc, setAiDesc] = useState('');
  const [aiStage, setAiStage] = useState('IDE');
  const [proposalUrl, setProposalUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submittingAi, setSubmittingAi] = useState(false);

  // Badge unlock modal state
  const [unlockedBadge, setUnlockedBadge] = useState<any | null>(null);

  useEffect(() => {
    fetchAllTracks();
  }, []);

  const fetchAllTracks = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchOrmawa(), fetchSpiritual(), fetchAiProject()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrmawa = async () => {
    try {
      const res = await fetch('/api/post-mastama/ormawa');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setOrmawaData(data);
      }
    } catch (err) {
      console.error('Error fetching ormawa:', err);
    }
  };

  const fetchSpiritual = async () => {
    try {
      const res = await fetch('/api/post-mastama/spiritual');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setSpiritualData(data);
      }
    } catch (err) {
      console.error('Error fetching spiritual:', err);
    }
  };

  const fetchAiProject = async () => {
    try {
      const res = await fetch('/api/post-mastama/ai-project');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setAiData(data.project);

        if (data.project) {
          setTeamName(data.project.teamName || '');
          setAiTitle(data.project.title || '');
          setAiDesc(data.project.description || '');
          setAiStage(data.project.stage || 'IDE');
          setProposalUrl(data.project.proposalUrl || '');
          setRepoUrl(data.project.repoUrl || '');
          setDemoUrl(data.project.demoUrl || '');
        }
      }
    } catch (err) {
      console.error('Error fetching AI project:', err);
    }
  };

  const handleOrmawaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setOrmawaError('Ukuran file foto melebihi batas maksimal 5MB.');
        return;
      }
      setOrmawaError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrmawaPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveOrmawa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrmawaSlot) return;

    setSubmittingOrmawa(true);
    setOrmawaError(null);
    try {
      const res = await fetch('/api/post-mastama/ormawa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityIndex: selectedOrmawaSlot.index,
          title: ormawaTitle,
          ormawaName,
          description: ormawaDesc,
          evidencePhoto: ormawaPhoto || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedOrmawaSlot(null);
        setOrmawaTitle('');
        setOrmawaName('');
        setOrmawaDesc('');
        setOrmawaPhoto('');
        fetchOrmawa();

        if (data.gamification?.newlyUnlockedBadges?.length > 0) {
          setUnlockedBadge(data.gamification.newlyUnlockedBadges[0]);
        }
      } else {
        setOrmawaError(data.error || 'Gagal menyimpan kegiatan.');
      }
    } catch (err: any) {
      setOrmawaError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmittingOrmawa(false);
    }
  };

  const handleDzuhurPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setDzuhurError('Ukuran file foto melebihi batas maksimal 5MB.');
        return;
      }
      setDzuhurError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDzuhurPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDzuhur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDzuhurSlot) return;

    setSubmittingSpiritual(true);
    try {
      const res = await fetch('/api/post-mastama/spiritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotIndex: selectedDzuhurSlot.slotIndex,
          date: new Date(dzuhurDate),
          location: dzuhurLocation,
          evidencePhoto: dzuhurPhoto || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDzuhurMessage(data.message);
        setTimeout(() => {
          setSelectedDzuhurSlot(null);
          setDzuhurMessage(null);
          setDzuhurPhoto('');
        }, 1200);
        fetchSpiritual();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSpiritual(false);
    }
  };

  const handleSaveAiProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAi(true);

    try {
      const res = await fetch('/api/post-mastama/ai-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          title: aiTitle,
          description: aiDesc,
          proposalUrl,
          repoUrl,
          demoUrl,
          stage: aiStage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchAiProject();
        if (data.gamification?.newlyUnlockedBadges?.length > 0) {
          setUnlockedBadge(data.gamification.newlyUnlockedBadges[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAi(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/15 text-umla-gold text-xs font-bold mb-3 border border-umla-gold/30">
          <Sparkles className="w-3.5 h-3.5" />
          YOUR JOURNEY CONTINUES
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">MISI & TRACKER LANJUTAN</h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-2">
          Setelah MASTAMA, perjalanan mahasiswa UMLA berlanjut dengan eksplorasi ORMAWA, ibadah berjamaah, dan tantangan inovasi AI.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl glass-panel bg-umla-navy-950 max-w-xl mx-auto border border-umla-gold/30">
        <button
          onClick={() => setActiveTab('ORMAWA')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ORMAWA'
              ? 'bg-umla-gold text-umla-navy-950 shadow-lg shadow-umla-gold/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          15× ORMAWA
        </button>

        <button
          onClick={() => setActiveTab('SPIRITUAL')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'SPIRITUAL'
              ? 'bg-umla-gold text-umla-navy-950 shadow-lg shadow-umla-gold/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sun className="w-4 h-4" />
          24× Dzuhur
        </button>

        <button
          onClick={() => setActiveTab('AI_CHALLENGE')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'AI_CHALLENGE'
              ? 'bg-umla-gold text-umla-navy-950 shadow-lg shadow-umla-gold/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          AI Challenge
        </button>
      </div>

      {/* TAB 1: 15x ORMAWA EXPLORER (Requirement 33) */}
      {activeTab === 'ORMAWA' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Progress Header Card */}
          <div className="p-6 rounded-3xl glass-panel-gold bg-umla-navy-950 border-2 border-umla-gold/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                <Users className="w-4 h-4" />
                ORMAWA EXPLORER TRACK
              </div>
              <h2 className="text-2xl font-black text-white mt-1">15× Mengikuti Kegiatan ORMAWA UMLA</h2>
              <p className="text-xs text-gray-300 mt-1">
                BEM, DPM, IMM, HIMA, UKM. (+50 XP per aktivitas)
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
              <span className="text-3xl font-black text-cyan-400">
                {ormawaData?.completedCount ?? 0} <span className="text-sm text-gray-400 font-normal">/ 15</span>
              </span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aktivitas Selesai</p>
              <div className="w-36 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${ormawaData?.progressPercent ?? Math.round(((ormawaData?.completedCount || 0) / 15) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 15 Dynamic Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ormawaData?.slots?.map((slot: any) => {
              const isDone = slot.status === 'COMPLETED';

              return (
                <div
                  key={slot.index}
                  className={`p-4 rounded-2xl glass-panel border transition-all ${
                    isDone
                      ? 'bg-cyan-950/30 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                      : 'bg-umla-navy-900/60 border-white/10 hover:border-umla-gold/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                      ORMAWA #{slot.index < 10 ? `0${slot.index}` : slot.index}
                    </span>
                    {isDone ? (
                      <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500">BELUM DIISI</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{slot.title}</h4>
                  <p className="text-[11px] text-cyan-300 font-semibold mt-0.5">{slot.ormawaName || 'Pilih ORMAWA UMLA'}</p>

                  {slot.date && (
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-umla-gold" />
                      {new Date(slot.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setSelectedOrmawaSlot(slot);
                      setOrmawaTitle(slot.title || '');
                      setOrmawaName(slot.ormawaName || '');
                      setOrmawaDesc(slot.description || '');
                      setOrmawaPhoto(slot.evidencePhoto || '');
                      setOrmawaError(null);
                    }}
                    className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                        : 'bg-umla-gold hover:bg-yellow-400 text-umla-navy-950 font-black shadow-md'
                    }`}
                  >
                    {isDone ? 'Lihat / Edit Bukti' : '+ Catat Kegiatan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Modal Form Submission ORMAWA */}
          {selectedOrmawaSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-umla-gold/40 shadow-2xl">
                <button
                  onClick={() => setSelectedOrmawaSlot(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-base font-black text-white mb-1">
                  Catat Aktivitas ORMAWA #{selectedOrmawaSlot.index}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Unggah judul, keterangan, dan dokumentasi foto kegiatan organisasi mahasiswa yang Anda ikuti (Maks 5MB).
                </p>

                {ormawaError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{ormawaError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveOrmawa} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Nama Organisasi (ORMAWA) <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="Contoh: HIMA UMLA / BEM UMLA / IMM / UKM"
                      value={ormawaName}
                      onChange={(e) => setOrmawaName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Nama / Judul Kegiatan <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="Contoh: Workshop Web Dev & AI 101"
                      value={ormawaTitle}
                      onChange={(e) => setOrmawaTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Foto Bukti / Sertifikat Kegiatan (Maks 5MB)
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-umla-gold/30 hover:border-umla-gold rounded-2xl p-3.5 bg-umla-navy-900/60 cursor-pointer transition-all">
                      {ormawaPhoto ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden">
                          <img src={ormawaPhoto} alt="Bukti Foto" className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-bold">
                            Ubah Foto
                          </span>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-umla-gold mb-1" />
                          <span className="text-xs font-bold text-white">Ambil Foto / Unggah Bukti</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG (Maksimal 5MB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleOrmawaPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Keterangan Aktivitas</label>
                    <textarea
                      rows={3}
                      placeholder="Deskripsikan peran atau materi yang Anda pelajari..."
                      value={ormawaDesc}
                      onChange={(e) => setOrmawaDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrmawaSlot(null)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrmawa}
                      className="flex-1 py-2.5 rounded-xl bg-umla-gold text-umla-navy-950 text-xs font-black uppercase tracking-wider shadow-lg"
                    >
                      {submittingOrmawa ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Simpan & Dapatkan +50 XP'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 24x SPIRITUAL JOURNEY (Monitoring & Approval Kakak Pendamping) */}
      {activeTab === 'SPIRITUAL' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Progress Header Card */}
          <div className="p-6 rounded-3xl glass-panel-gold bg-umla-navy-950 border-2 border-umla-gold/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-teal-400 uppercase tracking-wider">
                <Sun className="w-4 h-4" />
                SPIRITUAL JOURNEY TRACK • DIVERIFIKASI PENDAMPING
              </div>
              <h2 className="text-2xl font-black text-white mt-1">24× Sholat Dzuhur Berjamaah</h2>
              <p className="text-xs text-gray-300 mt-1">
                Upload foto kehadiran Sholat Dzuhur di Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan untuk diverifikasi Kakak Pendamping (+25 XP per presensi).
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
              <span className="text-3xl font-black text-teal-400">
                {spiritualData?.completedCount ?? 0} <span className="text-sm text-gray-400 font-normal">/ 24</span>
              </span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Presensi Terverifikasi</p>
              <div className="w-36 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${spiritualData?.progressPercent ?? Math.round(((spiritualData?.completedCount || 0) / 24) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 24 Dzuhur Calendar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {spiritualData?.slots?.map((slot: any) => {
              const isDone = slot.status === 'COMPLETED';
              const isUnderReview = slot.status === 'UNDER_REVIEW' || slot.status === 'SUBMITTED';
              const isRejected = slot.status === 'REJECTED';

              return (
                <div
                  key={slot.slotIndex}
                  className={`p-3.5 rounded-2xl glass-panel border text-center transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-teal-950/40 border-teal-500/50 shadow-lg shadow-teal-500/10'
                      : isUnderReview
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : isRejected
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-umla-navy-900/60 border-white/10'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-black font-mono text-gray-400 uppercase">
                      DZUHUR #{slot.slotIndex < 10 ? `0${slot.slotIndex}` : slot.slotIndex}
                    </span>

                    <div className="my-2">
                      {isDone ? (
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : isUnderReview ? (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                          <Clock className="w-4 h-4 animate-pulse" />
                        </div>
                      ) : isRejected ? (
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto">
                          <Sun className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-300 truncate" title="Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan">
                      {slot.location && !slot.location.includes('Ahmad Dahlan')
                        ? slot.location
                        : 'Masjid Ki Bagus Hadikusumo UMLA'}
                    </p>
                    {slot.date && (
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {new Date(slot.date).toLocaleDateString('id-ID', { dateStyle: 'short' })}
                      </p>
                    )}
                  </div>

                  {isDone ? (
                    <span className="mt-2 text-[9px] font-bold text-teal-300 bg-teal-500/20 py-1 rounded-lg">
                      Terverifikasi ✓
                    </span>
                  ) : isUnderReview ? (
                    <span className="mt-2 text-[9px] font-bold text-amber-300 bg-amber-500/20 py-1 rounded-lg">
                      Menunggu Pendamping
                    </span>
                  ) : isRejected ? (
                    <button
                      onClick={() => {
                        setSelectedDzuhurSlot(slot);
                        setDzuhurLocation(slot.location || 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan');
                      }}
                      className="mt-2 w-full py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[9px] uppercase hover:bg-rose-500/30 transition-all"
                    >
                      Ajukan Ulang
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedDzuhurSlot(slot);
                        setDzuhurLocation(slot.location || 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan');
                        setDzuhurPhoto('');
                      }}
                      className="mt-2 w-full py-1.5 rounded-lg bg-umla-gold text-umla-navy-950 font-bold text-[10px] uppercase hover:bg-yellow-400 transition-all shadow"
                    >
                      + Presensi Foto
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Presensi Sholat Dzuhur */}
          {selectedDzuhurSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-teal-500/40 shadow-2xl">
                <button
                  onClick={() => setSelectedDzuhurSlot(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 border border-teal-500/30">
                  <Sun className="w-6 h-6" />
                </div>

                <h3 className="text-base font-black text-white mb-1">
                  Upload Presensi Sholat Dzuhur #{selectedDzuhurSlot.slotIndex}
                </h3>
                <p className="text-xs text-gray-300 mb-4">
                  Ambil/unggah foto kehadiran Anda di Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan untuk diverifikasi oleh Kakak Pendamping Kelompok.
                </p>

                {selectedDzuhurSlot.rejectionNote && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Catatan Perbaikan Pendamping Sebelumnya:
                    </p>
                    <p className="mt-0.5 italic">"{selectedDzuhurSlot.rejectionNote}"</p>
                  </div>
                )}

                {dzuhurMessage ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    {dzuhurMessage}
                  </div>
                ) : (
                  <form onSubmit={handleSaveDzuhur} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Tanggal Sholat Dzuhur</label>
                      <input
                        type="date"
                        value={dzuhurDate}
                        onChange={(e) => setDzuhurDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Lokasi Masjid</label>
                      <input
                        type="text"
                        value={dzuhurLocation}
                        onChange={(e) => setDzuhurLocation(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Foto Bukti Kehadiran Sholat di Masjid <span className="text-rose-400">*</span>
                      </label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-teal-500/30 hover:border-teal-400 rounded-2xl p-4 bg-teal-950/20 cursor-pointer transition-all">
                        {dzuhurPhoto ? (
                          <div className="relative w-full h-36 rounded-xl overflow-hidden">
                            <img src={dzuhurPhoto} alt="Bukti Foto" className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-bold">
                              Ubah Foto
                            </span>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-7 h-7 text-teal-400 mb-1" />
                            <span className="text-xs font-bold text-white">Ambil Foto / Unggah Bukti</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG (Maks 5MB)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDzuhurPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDzuhurSlot(null)}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submittingSpiritual}
                        className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
                      >
                        {submittingSpiritual ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            Kirim ke Pendamping
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI CHALLENGE PROJECT (Requirement 35) */}
      {activeTab === 'AI_CHALLENGE' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Progress Header Card */}
          <div className="p-6 rounded-3xl glass-panel-gold bg-umla-navy-950 border-2 border-umla-gold/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                AI CHALLENGE: THINK – CREATE – IMPACT
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                aiData?.stage === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : aiData?.stage === 'LAPORAN'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                {aiData?.stage === 'COMPLETED'
                  ? '✓ Disetujui Pendamping'
                  : aiData?.stage === 'LAPORAN'
                  ? '⏳ Menunggu Review'
                  : `Stage: ${aiStage || 'IDE'}`}
              </span>
            </div>

            {/* Stepper (3 SIMPLE STAGES: IDE -> EKSEKUSI -> LAPORAN) */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              {[
                { key: 'IDE', num: '01', title: 'IDE', desc: 'Rumusan Ide & Solusi' },
                { key: 'EKSEKUSI', num: '02', title: 'EKSEKUSI', desc: 'Pengerjaan & Prototype' },
                { key: 'LAPORAN', num: '03', title: 'LAPORAN', desc: 'Laporan & Approval' },
              ].map((st, idx) => {
                const stages = ['IDE', 'EKSEKUSI', 'LAPORAN'];
                const currentIdx = aiData?.stage === 'COMPLETED' ? 2 : stages.indexOf(aiStage || 'IDE');
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-2xl text-center border transition-all ${
                      aiData?.stage === 'COMPLETED' && idx === 2
                        ? 'bg-emerald-600 text-white font-black border-emerald-400 shadow-lg shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-purple-600 text-white font-black border-purple-400 shadow-lg shadow-purple-500/30'
                        : isPassed
                        ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                        : 'bg-white/5 text-gray-500 border-white/5'
                    }`}
                  >
                    <span className="text-[10px] block font-mono font-bold opacity-80">{st.num}</span>
                    <span className="text-xs font-black block mt-0.5">{st.title}</span>
                    <span className="text-[10px] opacity-75 hidden sm:block">{st.desc}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              💡 <strong>Alur Proyek AI:</strong> Pengerjaan inovasi AI dilakukan secara <strong>berkelompok</strong>, namun pengumpulan laporan refleksi dilakukan secara <strong>individu</strong>. Poin (+150 XP) akan masuk setelah laporan diverifikasi dan disetujui oleh <strong>Kakak Pendamping</strong>.
            </p>
          </div>

          {/* Status Alert if Completed or Under Review */}
          {aiData?.stage === 'COMPLETED' ? (
            <div className="p-6 rounded-3xl glass-panel bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Laporan AI Challenge Disetujui! (+150 XP)</h4>
                  <p className="text-xs text-emerald-300">Telah diverifikasi dan dinilai oleh Kakak Pendamping.</p>
                </div>
              </div>
              {aiData?.mentorFeedback && (
                <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/10 mt-3 italic">
                  "{aiData.mentorFeedback}"
                </p>
              )}
            </div>
          ) : aiData?.stage === 'LAPORAN' ? (
            <div className="p-5 rounded-3xl glass-panel bg-amber-950/40 border border-amber-500/40 text-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Laporan Telah Dikirim — Menunggu Verifikasi Kakak Pendamping</h4>
                  <p className="text-[11px] text-amber-300/80">Kakak pendamping kelompok Anda akan memeriksa dan memberikan persetujuan laporan ini.</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Form & Project Details */}
          <div className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-white/10 shadow-xl">
            <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-umla-gold" />
              Kelola Proyek & Laporan AI Challenge
            </h3>

            <form onSubmit={handleSaveAiProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Nama Tim / Kelompok</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelompok 07 / CyberUMLA"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    disabled={aiData?.stage === 'COMPLETED'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Tahap Pengerjaan</label>
                  <select
                    value={aiStage}
                    onChange={(e) => setAiStage(e.target.value)}
                    disabled={aiData?.stage === 'COMPLETED'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input bg-umla-navy-900 disabled:opacity-60"
                  >
                    <option value="IDE">01. IDE (Brainstorming & Rumusan Masalah)</option>
                    <option value="EKSEKUSI">02. EKSEKUSI (Pengerjaan Karya & Prototype AI)</option>
                    <option value="LAPORAN">03. LAPORAN (Pengumpulan Akhir untuk Approval)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Judul Inovasi AI</label>
                <input
                  type="text"
                  placeholder="Contoh: SmartCampus AI — Asisten Cerdas Pelayanan & Konseling UMLA"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  required
                  disabled={aiData?.stage === 'COMPLETED'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  {aiStage === 'LAPORAN' ? 'Deskripsi Laporan & Refleksi Individu' : 'Deskripsi Proyek & Solusi AI'}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    aiStage === 'LAPORAN'
                      ? 'Tuliskan ringkasan hasil karya, peran individu Anda dalam tim, dan teknologi AI yang digunakan...'
                      : 'Jelaskan masalah yang diselesaikan, teknologi AI yang digunakan, dan manfaat nyata bagi kampus/masyarakat...'
                  }
                  value={aiDesc}
                  onChange={(e) => setAiDesc(e.target.value)}
                  required
                  disabled={aiData?.stage === 'COMPLETED'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input resize-none disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Link Dokumen / Laporan (Google Drive / Docs)</label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/..."
                    value={proposalUrl}
                    onChange={(e) => setProposalUrl(e.target.value)}
                    disabled={aiData?.stage === 'COMPLETED'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Link Demo / Video / Screenshot Karya</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    disabled={aiData?.stage === 'COMPLETED'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input disabled:opacity-60"
                  />
                </div>
              </div>

              {aiData?.mentorFeedback && aiData?.stage !== 'COMPLETED' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  <p className="font-bold flex items-center gap-1.5 text-white">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    Catatan Perbaikan dari Kakak Pendamping:
                  </p>
                  <p className="mt-1 leading-relaxed italic">"{aiData.mentorFeedback}"</p>
                </div>
              )}

              {aiData?.stage !== 'COMPLETED' && (
                <button
                  type="submit"
                  disabled={submittingAi}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                >
                  {submittingAi ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : aiStage === 'LAPORAN' ? (
                    <>
                      <Upload className="w-4 h-4" />
                      Kirim Laporan ke Pendamping (+150 XP)
                    </>
                  ) : (
                    'Simpan Progres AI Challenge'
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Badge Unlocked Celebration Modal */}
      <BadgeModal badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />
    </div>
  );
}
