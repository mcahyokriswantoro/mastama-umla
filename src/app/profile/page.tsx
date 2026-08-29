'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Users,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Upload,
  X,
  Palette,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [studyProgramId, setStudyProgramId] = useState('');
  const [faculties, setFaculties] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState('');

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Fauzan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Nabila',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra',
    'https://api.dicebear.com/7.x/bottts/svg?seed=UMLA2026',
    'https://api.dicebear.com/7.x/identicon/svg?seed=UMLA',
  ];

  useEffect(() => {
    fetchUserData();
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      const res = await fetch('/api/academic/faculties');
      const data = await res.json();
      setFaculties(data.faculties || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        setCurrentUser(data.user);
        setFullName(data.user.fullName || '');
        setPhone(data.user.phoneNumber || '');
        setAvatarUrl(data.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`);
        setPreviewAvatar(data.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`);
        
        if (data.user.studentProfile) {
          setBio(data.user.studentProfile.bio || 'Calon Inovator & Pemimpin Masa Depan UMLA 2026! Siap menjelajah!');
          setFacultyId(data.user.studentProfile.facultyId || '');
          setStudyProgramId(data.user.studentProfile.studyProgramId || '');
        } else {
          setBio('Calon Inovator & Pemimpin Masa Depan UMLA 2026! Siap menjelajah!');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Ukuran file foto melebihi batas maksimal 2MB.');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAvatar = () => {
    setAvatarUrl(previewAvatar);
    setShowAvatarModal(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          avatarUrl,
          phoneNumber: phone,
          bio,
          facultyId,
          studyProgramId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan profil.');
      }

      setSuccessMsg('Profil dan Foto Berhasil Diperbarui!');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchUserData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;
  const profile = currentUser.studentProfile;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/15 text-umla-gold text-xs font-bold mb-3 border border-umla-gold/30">
          <User className="w-3.5 h-3.5" />
          STUDENT PROFILE
        </div>
        <h1 className="text-3xl font-black text-white">PROFIL MAHASISWA</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Informasi identitas akademik terdaftar pada sistem Digital Student Passport UMLA.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Avatar & Identity Card */}
        <div className="md:col-span-4 p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 text-center flex flex-col items-center justify-center">
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
            <img
              src={avatarUrl || currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
              alt={currentUser.fullName}
              className="w-32 h-32 rounded-3xl object-cover border-4 border-umla-gold/40 shadow-2xl p-1 bg-umla-navy-900 group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
              <Camera className="w-6 h-6 text-umla-gold mb-1" />
              <span className="text-[10px] font-bold">Ubah Foto</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-umla-gold text-umla-navy-950 flex items-center justify-center font-black shadow-lg text-xs">
              ✓
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="mt-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-umla-gold" />
            Ganti Foto Profil
          </button>

          <h3 className="text-lg font-black text-white mt-4">{currentUser.fullName}</h3>
          <p className="font-mono text-xs font-bold text-umla-gold">NIM: {profile?.nim || '240101001'}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            MAHASISWA AKTIF 2026
          </span>
        </div>

        {/* Right: Academic Info & Form */}
        <div className="md:col-span-8 p-6 sm:p-8 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-umla-gold mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              Data Akademik & Kelompok
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Nama Lengkap Mahasiswa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fakultas</label>
                <select
                  value={facultyId}
                  onChange={(e) => {
                    setFacultyId(e.target.value);
                    setStudyProgramId('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-semibold text-white bg-umla-navy-950"
                >
                  <option value="" disabled>Pilih Fakultas</option>
                  {faculties.map((f: any) => (
                    <option key={f.id} value={f.id} className="bg-umla-navy-900">{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Program Studi</label>
                <select
                  value={studyProgramId}
                  onChange={(e) => setStudyProgramId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-semibold text-white bg-umla-navy-950"
                  disabled={!facultyId}
                >
                  <option value="" disabled>Pilih Program Studi</option>
                  {faculties
                    .find((f: any) => f.id === facultyId)
                    ?.studyPrograms.map((sp: any) => (
                      <option key={sp.id} value={sp.id} className="bg-umla-navy-900">
                        {sp.name} ({sp.degree})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kelompok MASTAMA</label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-emerald-400">
                  {profile?.group?.name || 'Kelompok 07'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pendamping Kelompok</label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
                  {profile?.group?.mentor || 'Budi Santoso, S.Kom.'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Terdaftar</label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 truncate">
                  {currentUser.email}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bio / Moto Perjalanan</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-umla-gold/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>

      {/* Avatar Customization Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-umla-gold/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-umla-gold" />
                  Ubah Foto Profil / Avatar Passport
                </h3>
                <p className="text-xs text-gray-400">Unggah foto pribadi atau pilih salah satu karakter avatar UMLA.</p>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <img
                src={previewAvatar}
                alt="Preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-umla-gold/60 bg-umla-navy-900"
              />
              <div>
                <p className="text-xs font-bold text-white">Preview Foto Terpilih</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Foto ini akan tampil di Digital Passport & Dashboard Anda.</p>
              </div>
            </div>

            {/* Option 1: Upload File */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-2">1. Unggah Foto Pribadi (Maks 2MB)</label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-umla-gold/30 hover:border-umla-gold/70 bg-umla-navy-900 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-umla-gold" />
                <span className="text-xs font-bold text-white">Pilih File Foto (JPG / PNG)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Option 2: Choose Presets */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-2">2. Atau Pilih Karakter Avatar UMLA:</label>
              <div className="grid grid-cols-5 gap-2">
                {presetAvatars.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewAvatar(preset)}
                    className={`p-1 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 ${
                      previewAvatar === preset
                        ? 'border-umla-gold bg-umla-gold/20 shadow-lg'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${idx}`} className="w-full h-14 rounded-xl object-cover bg-umla-navy-900" />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyAvatar}
                className="flex-1 py-2.5 rounded-xl bg-umla-gold hover:bg-yellow-400 text-umla-navy-950 text-xs font-black uppercase tracking-wider shadow-lg"
              >
                Gunakan Foto Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
