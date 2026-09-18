'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, AlertCircle, X, Shield, Sparkles, Copy, Radio } from 'lucide-react';

interface ManageYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newYearId?: string) => void;
  existingYears: any[];
}

export default function ManageYearModal({
  isOpen,
  onClose,
  onSuccess,
  existingYears,
}: ManageYearModalProps) {
  const [activeTab, setActiveTab] = useState<'NEW' | 'LIST'>('NEW');
  const [yearInput, setYearInput] = useState(new Date().getFullYear() + 1);
  const [nameInput, setNameInput] = useState(`MASTAMA UMLA ${new Date().getFullYear() + 1}`);
  const [groupAssignMode, setGroupAssignMode] = useState<'ADMIN_ASSIGN' | 'STUDENT_SELECT'>('ADMIN_ASSIGN');
  const [setActive, setSetActive] = useState(true);
  const [copyFromYearId, setCopyFromYearId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setNameInput(`MASTAMA UMLA ${yearInput}`);
  }, [yearInput]);

  if (!isOpen) return null;

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_YEAR',
          year: yearInput,
          name: nameInput,
          groupAssignMode,
          setActive,
          copyJourneysFromYearId: copyFromYearId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan tahun ajaran.');
      }

      setSuccessMsg(`Tahun Ajaran ${yearInput} berhasil ditambahkan!`);
      setTimeout(() => {
        onSuccess(data.year?.id);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveYear = async (yearId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_ACTIVE_YEAR',
          yearId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengaktifkan tahun ajaran.');
      }

      setSuccessMsg(data.message || 'Tahun ajaran berhasil diaktifkan.');
      setTimeout(() => {
        onSuccess(yearId);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-umla-navy-950 border border-umla-gold/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-umla-navy-900 border border-umla-gold/20 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-umla-gold to-yellow-300 flex items-center justify-center text-umla-navy-950 shadow-lg shadow-umla-gold/20">
            <Calendar className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Kelola Tahun Ajaran</h2>
            <p className="text-xs text-gray-400">Tambah angkatan MASTAMA baru & tentukan tahun aktif</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-umla-navy-900/80 p-1 rounded-2xl border border-umla-gold/20 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('NEW')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'NEW'
                ? 'bg-umla-gold text-umla-navy-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            + Tambah Tahun Baru
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'LIST'
                ? 'bg-umla-gold text-umla-navy-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Daftar Tahun ({existingYears?.length || 0})
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'NEW' ? (
          <form onSubmit={handleCreateYear} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Tahun Angkatan (Kalender)
              </label>
              <input
                type="number"
                min="2020"
                max="2050"
                value={yearInput}
                onChange={(e) => setYearInput(parseInt(e.target.value) || 2027)}
                className="w-full px-4 py-3 rounded-2xl bg-umla-navy-900 border border-umla-gold/30 text-white font-bold text-sm focus:border-umla-gold outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Label / Nama Kegiatan
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Contoh: MASTAMA UMLA 2027"
                className="w-full px-4 py-3 rounded-2xl bg-umla-navy-900 border border-umla-gold/30 text-white font-medium text-sm focus:border-umla-gold outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Mode Penentuan Kelompok Mahasiswa
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setGroupAssignMode('ADMIN_ASSIGN')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    groupAssignMode === 'ADMIN_ASSIGN'
                      ? 'bg-umla-gold/15 border-umla-gold text-white shadow-sm'
                      : 'bg-umla-navy-900 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold block">Ditentukan Admin</span>
                  <span className="text-[10px] text-gray-400">Mahasiswa otomatis/manual dibagi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGroupAssignMode('STUDENT_SELECT')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    groupAssignMode === 'STUDENT_SELECT'
                      ? 'bg-umla-gold/15 border-umla-gold text-white shadow-sm'
                      : 'bg-umla-navy-900 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold block">Pilih Sendiri</span>
                  <span className="text-[10px] text-gray-400">Mahasiswa memilih kelompok saat daftar</span>
                </button>
              </div>
            </div>

            {existingYears && existingYears.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-umla-gold" />
                  Salin Struktur Journey/Aktivitas dari Tahun Sebelumnya (Opsional)
                </label>
                <select
                  value={copyFromYearId}
                  onChange={(e) => setCopyFromYearId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-umla-navy-900 border border-umla-gold/30 text-white text-xs outline-none focus:border-umla-gold transition-colors cursor-pointer"
                >
                  <option value="">-- Buat Kosong / Atur Nanti Sendiri --</option>
                  {existingYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      Salin Jadwal & Aktivitas dari {y.name || `Tahun ${y.year}`}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Jika dipilih, seluruh daftar hari journey & misi dari tahun tersebut akan otomatis diduplikasi ke tahun baru.
                </p>
              </div>
            )}

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-umla-navy-900/60 border border-umla-gold/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={setActive}
                  onChange={(e) => setSetActive(e.target.checked)}
                  className="w-4 h-4 rounded text-umla-gold focus:ring-umla-gold accent-umla-gold cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Jadikan Sebagai Tahun Ajaran Aktif
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Pendaftaran mahasiswa baru akan otomatis masuk ke tahun ini.
                  </span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-umla-gold to-yellow-300 hover:brightness-110 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-umla-gold/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {loading ? 'Menyimpan...' : `Simpan Tahun Ajaran ${yearInput}`}
            </button>
          </form>
        ) : (
          <div className="space-y-2.5">
            {existingYears.map((y) => (
              <div
                key={y.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  y.isActive
                    ? 'bg-umla-gold/10 border-umla-gold shadow-sm'
                    : 'bg-umla-navy-900 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Tahun {y.year}
                    </span>
                    {y.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        AKTIF UTAMA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-[10px] font-medium">
                        Arsip
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{y.name}</p>
                </div>

                {!y.isActive && (
                  <button
                    type="button"
                    onClick={() => handleSetActiveYear(y.id)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-umla-navy-800 hover:bg-umla-gold hover:text-umla-navy-950 border border-umla-gold/30 text-white text-xs font-bold transition-all"
                  >
                    Aktifkan
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
