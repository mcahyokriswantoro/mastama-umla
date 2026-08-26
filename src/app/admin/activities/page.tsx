'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  X,
  Camera,
  ExternalLink,
  Search,
  Check,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminActivitiesPage() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJourneyFilter, setSelectedJourneyFilter] = useState('ALL');

  // Edit Modal States
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [mode, setMode] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [picName, setPicName] = useState('');
  const [verificationType, setVerificationType] = useState('PHOTO_DESC');
  const [xpReward, setXpReward] = useState('50');
  const [bannerImage, setBannerImage] = useState('');
  const [qrSecret, setQrSecret] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/journeys');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setJourneys(data.journeys || []);
        }
      }
    } catch (err) {
      console.error('Error loading journeys:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (activity: any) => {
    setEditingActivity(activity);
    setTitle(activity.title || '');
    setSubtitle(activity.subtitle || '');
    setDescription(activity.description || '');
    setDate(activity.date ? activity.date.split('T')[0] : '');
    setStartTime(activity.startTime || '08:00');
    setEndTime(activity.endTime || '10:00');
    setLocation(activity.location || '');
    setMode(activity.mode || 'OFFLINE');
    setOnlineUrl(activity.onlineUrl || '');
    setPicName(activity.picName || '');
    setVerificationType(activity.verificationType || 'PHOTO_DESC');
    setXpReward(activity.xpReward ? String(activity.xpReward) : '50');
    setBannerImage(activity.bannerImage || '');
    setQrSecret(activity.qrSecret || '');
    setErrorMsg(null);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          date: date ? new Date(date) : undefined,
          startTime,
          endTime,
          location,
          mode,
          onlineUrl: mode === 'ONLINE' ? onlineUrl : null,
          picName,
          verificationType,
          xpReward: parseInt(xpReward) || 50,
          bannerImage: bannerImage || null,
          qrSecret: qrSecret || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui kegiatan.');
      }

      setSuccessMsg(`Kegiatan "${title}" berhasil diperbarui!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setEditingActivity(null);
      fetchJourneys();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  // Filter activities
  const filteredJourneys = journeys
    .filter((j) => selectedJourneyFilter === 'ALL' || j.id === selectedJourneyFilter)
    .map((j) => {
      const filteredMissions = j.missions?.map((m: any) => {
        const filteredActivities = m.activities?.filter((a: any) => {
          const matchQuery =
            !searchQuery ||
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.location?.toLowerCase().includes(searchQuery.toLowerCase());
          return matchQuery;
        });
        return { ...m, activities: filteredActivities };
      });
      return { ...j, missions: filteredMissions };
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
            <Compass className="w-3.5 h-3.5" />
            DYNAMIC ACTIVITY BUILDER & EDITOR
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            MANAJEMEN & EDIT KEGIATAN MASTAMA
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Kelola judul, jadwal, lokasi, metode verifikasi, kode QR, foto banner, dan reward XP seluruh 23 agenda kegiatan resmi.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-umla-navy-950 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kegiatan berdasarkan nama, kode (ACT_01), atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-umla-gold shrink-0" />
          <select
            value={selectedJourneyFilter}
            onChange={(e) => setSelectedJourneyFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-xl text-xs glass-input bg-umla-navy-900"
          >
            <option value="ALL">Semua Tanggal Journey</option>
            {journeys.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Journeys List */}
      <div className="space-y-8">
        {filteredJourneys.map((j) => (
          <div key={j.id} className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-black text-umla-gold font-mono uppercase">
                  {j.code} • {new Date(j.targetDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </span>
                <h3 className="text-lg font-black text-white">{j.title}</h3>
                <p className="text-xs text-gray-400">{j.subtitle}</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-gray-300">
                Mode: {j.mode}
              </span>
            </div>

            {/* Activities Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 w-16">Foto</th>
                    <th className="pb-3">Kode & Nama Kegiatan</th>
                    <th className="pb-3">Waktu Pelaksanaan</th>
                    <th className="pb-3">Lokasi</th>
                    <th className="pb-3">Verifikasi</th>
                    <th className="pb-3">XP Reward</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {j.missions?.flatMap((m: any) =>
                    m.activities?.map((a: any) => (
                      <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3">
                          <img
                            src={a.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                            alt={a.title}
                            className="w-12 h-9 rounded-lg object-cover border border-white/10 bg-umla-navy-900"
                          />
                        </td>
                        <td className="py-3">
                          <p className="font-mono text-[10px] text-umla-gold font-bold">{a.code}</p>
                          <p className="font-bold text-white text-xs">{a.title}</p>
                          {a.subtitle && <p className="text-[10px] text-gray-400 truncate max-w-xs">{a.subtitle}</p>}
                        </td>
                        <td className="py-3 text-gray-300">
                          {a.startTime} – {a.endTime} WIB
                        </td>
                        <td className="py-3 text-gray-300 truncate max-w-xs">{a.location}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                            a.verificationType === 'QR'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : a.verificationType === 'ONLINE'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {a.verificationType}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-emerald-400">+{a.xpReward} XP</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => openEditModal(a)}
                            className="px-3 py-1.5 rounded-xl bg-umla-gold hover:bg-yellow-400 text-umla-navy-950 font-black text-xs inline-flex items-center gap-1.5 shadow transition-all hover:scale-105"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-panel bg-umla-navy-950 rounded-3xl p-6 sm:p-8 border-2 border-umla-gold/40 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold text-umla-gold uppercase">
                  EDIT KEGIATAN: {editingActivity.code}
                </span>
                <h3 className="text-lg font-black text-white">Edit Detail & Parameter Kegiatan</h3>
              </div>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveActivity} className="space-y-4">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Nama / Judul Kegiatan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Sub Judul Kegiatan</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Deskripsi Lengkap Kegiatan</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input resize-none"
                />
              </div>

              {/* Date, Time & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Jam Mulai</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="08:00"
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Jam Selesai</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="11:30"
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Mode Kegiatan</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'ONLINE' | 'OFFLINE')}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input bg-umla-navy-900"
                  >
                    <option value="OFFLINE">OFFLINE (Tatap Muka)</option>
                    <option value="ONLINE">ONLINE (Daring / Zoom)</option>
                  </select>
                </div>
              </div>

              {/* Location & PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="DOME UMLA / Masjid Ki Bagus Hadikusumo"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Nama PIC / Penanggung Jawab</label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Panitia Sie Acara"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              {/* Online URL if Mode is ONLINE */}
              {mode === 'ONLINE' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Link Zoom / Streaming</label>
                  <input
                    type="url"
                    value={onlineUrl}
                    onChange={(e) => setOnlineUrl(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              )}

              {/* Verification Type, XP & QR Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Metode Verifikasi</label>
                  <select
                    value={verificationType}
                    onChange={(e) => setVerificationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input bg-umla-navy-900"
                  >
                    <option value="PHOTO_DESC">PHOTO_DESC (Upload Foto & Resume)</option>
                    <option value="QR">QR (Scan QR Code Gate)</option>
                    <option value="ONLINE">ONLINE (Presensi Link Zoom)</option>
                    <option value="QR_PHOTO">QR_PHOTO (Scan QR + Foto)</option>
                    <option value="QR_PHOTO_DESC">QR_PHOTO_DESC (Scan + Foto + Resume)</option>
                    <option value="MANUAL">MANUAL (Verifikasi Manual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Reward XP</label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Kode QR Secret (Opsional)</label>
                  <input
                    type="text"
                    value={qrSecret}
                    onChange={(e) => setQrSecret(e.target.value)}
                    placeholder="UMLA-DAY1-2026"
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              {/* Banner Image URL & Preview */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">URL Foto Banner Kegiatan</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                {bannerImage && (
                  <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-white/10">
                    <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-umla-gold/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Perubahan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
