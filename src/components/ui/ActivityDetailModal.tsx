'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Camera,
  FileText,
  RefreshCw,
  Lock,
} from 'lucide-react';
import QrScannerModal from '@/components/ui/QrScannerModal';

interface ActivityDetailModalProps {
  activity: any | null;
  onClose: () => void;
  onSuccessSubmission: () => void;
}

export default function ActivityDetailModal({
  activity,
  onClose,
  onSuccessSubmission,
}: ActivityDetailModalProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [description, setDescription] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [locationNote, setLocationNote] = useState('');
  const [submissionTime, setSubmissionTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!activity) return null;

  const isCompleted = activity.submissionStatus === 'COMPLETED' || activity.submissionStatus === 'APPROVED';
  const isUnderReview = activity.submissionStatus === 'UNDER_REVIEW' || activity.submissionStatus === 'SUBMITTED';
  const isRejected = activity.submissionStatus === 'REJECTED';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Ukuran file foto melebihi batas maksimal 2MB.');
        return;
      }
      setErrorMsg(null);
      // Create local data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Keterangan aktivitas wajib diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          description,
          evidencePhoto: evidencePhoto || activity.bannerImage || null,
          submissionTime: submissionTime || undefined,
          locationNote: locationNote || activity.location,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengirimkan submission.');
      } else {
        setSuccessMsg(data.message);
        setShowSubmitForm(false);
        setTimeout(() => {
          onSuccessSubmission();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="relative w-full max-w-xl glass-panel bg-umla-navy-950 rounded-3xl border-2 border-umla-gold/30 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
          {/* Prominent Floating Close Button */}
          <button
            onClick={onClose}
            aria-label="Tutup Modal"
            className="absolute top-3.5 right-3.5 z-50 p-2.5 rounded-full bg-black/80 hover:bg-black text-white hover:text-umla-gold border border-white/20 shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Activity Banner */}
          <div className="relative h-48 sm:h-56 w-full bg-umla-navy-900 overflow-hidden">
            <img
              src={activity.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
              alt={activity.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-umla-navy-950 via-umla-navy-950/50 to-transparent pointer-events-none" />

            {/* Mode & XP Badges */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                activity.mode === 'ONLINE' ? 'bg-blue-500/80 text-white' : 'bg-emerald-500/80 text-white'
              }`}>
                {activity.mode}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold text-umla-navy-950 text-xs font-black shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                +{activity.xpReward} XP
              </div>
            </div>
          </div>

          {/* Activity Body */}
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs text-umla-gold font-bold">
              <span>{activity.journeyTitle || 'MASTAMA 2026'}</span>
              <span>•</span>
              <span className="font-mono">{activity.code}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{activity.title}</h2>
            {activity.subtitle && (
              <p className="text-xs text-gray-300 font-medium mt-0.5">{activity.subtitle}</p>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-umla-gold shrink-0" />
                <span>{new Date(activity.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-umla-gold shrink-0" />
                <span>{activity.startTime} – {activity.endTime} WIB</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-umla-gold shrink-0" />
                <span className="truncate">{activity.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4 text-umla-gold shrink-0" />
                <span>PIC: {activity.picName || 'Panitia MASTAMA'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-gray-300 leading-relaxed mb-6">
              <p>{activity.description}</p>
            </div>

            {/* Status Alert Banner */}
            {isCompleted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-xs font-black text-white">Aktivitas Selesai & Disetujui!</p>
                  <p className="text-[11px] text-emerald-300 mt-0.5">
                    Stamp dan +{activity.xpReward} XP telah dicatat pada Digital Student Passport Anda.
                  </p>
                </div>
              </div>
            )}

            {isUnderReview && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-300">
                <Clock className="w-6 h-6 shrink-0 text-amber-400 animate-pulse" />
                <div>
                  <p className="text-xs font-black text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Menunggu Verifikasi Kakak Pendamping
                  </p>
                  <p className="text-[11px] text-amber-200 mt-0.5">
                    Bukti kehadiran Anda telah berhasil dikirim. Formulir dikunci sementara hingga diverifikasi oleh Kakak Pendamping Kelompok.
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Submission Perlu Perbaikan (Ditolak)
                </div>
                <p className="text-xs text-white bg-black/30 p-2.5 rounded-xl border border-rose-500/20">
                  <span className="font-bold text-rose-300">Alasan Pendamping:</span> "{activity.rejectionReason || 'Mohon unggah bukti foto yang lebih jelas.'}"
                </p>
              </div>
            )}

            {/* Submission / QR Action Buttons */}
            {!isCompleted && !isUnderReview && !showSubmitForm && (
              <div className="space-y-3">
                {activity.onlineUrl && (
                  <a
                    href={activity.onlineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka Link Zoom / Live Streaming
                  </a>
                )}

                {(activity.verificationType === 'QR' || activity.verificationType === 'QR_PHOTO' || activity.verificationType === 'QR_PHOTO_DESC') && (
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 hover:from-yellow-400 hover:to-umla-gold text-umla-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-umla-gold/20 hover:scale-[1.01] transition-transform"
                  >
                    <QrCode className="w-5 h-5" />
                    Scan QR Check-in
                  </button>
                )}

                {(activity.verificationType !== 'QR' || isRejected) && (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="w-full py-3.5 rounded-xl bg-umla-navy-800 hover:bg-umla-navy-700 border border-umla-gold/50 text-umla-gold font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {isRejected ? 'Kirim Ulang Bukti (Resubmit)' : 'Kirim Bukti Kegiatan (Submit Activity)'}
                  </button>
                )}
              </div>
            )}

            {/* Submission Form */}
            {showSubmitForm && !isCompleted && !isUnderReview && (
              <form onSubmit={handleSubmitActivity} className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-umla-gold" />
                    Form Submission Kegiatan
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-gray-300"
                  >
                    Batal
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Evidence Photo Upload */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Foto Bukti Kegiatan / Sertifikat / Kehadiran (Maks 5MB)
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center h-28 border-2 border-dashed border-umla-gold/30 hover:border-umla-gold rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors p-2 text-center">
                      {evidencePhoto ? (
                        <div className="relative w-full h-full">
                          <img src={evidencePhoto} alt="Bukti" className="w-full h-full object-cover rounded-xl" />
                        </div>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-umla-gold mb-1" />
                          <span className="text-[11px] text-gray-300">Pilih Foto atau Ambil Gambar</span>
                          <span className="text-[9px] text-gray-500">JPG, PNG (Maks 2MB)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Keterangan & Resume Aktivitas <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan ringkasan materi, kegiatan yang diikuti, atau poin penting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input resize-none"
                  />
                </div>

                {/* Location & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Lokasi Kegiatan</label>
                    <input
                      type="text"
                      placeholder={activity.location}
                      value={locationNote}
                      onChange={(e) => setLocationNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      placeholder="Contoh: 09:30 WIB"
                      value={submissionTime}
                      onChange={(e) => setSubmissionTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-umla-gold/20 hover:scale-[1.01] transition-transform disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Kirim ke Pendamping'}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Close Button (Always Available) */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded QR Scanner Modal */}
      <QrScannerModal
        isOpen={showQrModal}
        activityId={activity.id}
        activityTitle={activity.title}
        onClose={() => setShowQrModal(false)}
        onSuccess={() => {
          setShowQrModal(false);
          onSuccessSubmission();
          onClose();
        }}
      />
    </>
  );
}
