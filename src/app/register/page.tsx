'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  Building2,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Academic metadata
  const [faculties, setFaculties] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupAssignMode, setGroupAssignMode] = useState<string>('ADMIN_ASSIGN');
  const [years, setYears] = useState<any[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedProdiId, setSelectedProdiId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // Submit States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [welcomeData, setWelcomeData] = useState<any | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setLoadingMeta(true);
      const [facRes, groupRes] = await Promise.all([
        fetch('/api/academic/faculties'),
        fetch('/api/academic/groups'),
      ]);

      const facData = await facRes.json();
      const groupData = await groupRes.json();

      setFaculties(facData.faculties || []);
      setYears(facData.mastamaYears || []);
      setGroups(groupData.groups || []);
      setGroupAssignMode(groupData.groupAssignMode || 'ADMIN_ASSIGN');

      if (facData.faculties?.length > 0) {
        setSelectedFacultyId(facData.faculties[0].id);
        if (facData.faculties[0].studyPrograms?.length > 0) {
          setSelectedProdiId(facData.faculties[0].studyPrograms[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMeta(false);
    }
  };

  // Derived filtered prodis
  const activeFaculty = faculties.find((f) => f.id === selectedFacultyId);
  const availableProdis = activeFaculty?.studyPrograms || [];

  const handleFacultyChange = (fId: string) => {
    setSelectedFacultyId(fId);
    const fac = faculties.find((f) => f.id === fId);
    if (fac && fac.studyPrograms?.length > 0) {
      setSelectedProdiId(fac.studyPrograms[0].id);
    } else {
      setSelectedProdiId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          nim,
          email,
          phoneNumber,
          password,
          mastamaYear: selectedYear,
          facultyId: selectedFacultyId,
          studyProgramId: selectedProdiId,
          groupId: selectedGroupId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Terjadi kesalahan saat registrasi.');
      } else {
        // Find assigned group & mentor names for Welcome Modal
        const prodiObj = availableProdis.find((p: any) => p.id === selectedProdiId);
        const groupObj = groups.find((g: any) => g.id === selectedGroupId) || groups[0];

        setWelcomeData({
          fullName,
          nim,
          prodiName: prodiObj?.name || 'Informatika',
          groupName: groupObj?.name || 'Kelompok 07',
          mentorName: groupObj?.mentors?.[0] || 'Budi Santoso, S.Kom.',
        });
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl glass-panel bg-umla-navy-950 rounded-3xl p-6 sm:p-10 border-2 border-umla-gold/30 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2.5">
            <img
              src="/logo-umla.png"
              alt="Logo Universitas Muhammadiyah Lamongan"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-md"
            />
          </div>
          <div className="block">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/15 text-umla-gold text-xs font-bold mb-3 border border-umla-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              REGISTRASI MAHASISWA BARU
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">CREATE YOUR STUDENT PASSPORT</h1>
          <p className="text-xs text-gray-400 mt-1">
            Lengkapi data pribadi dan akademik Anda untuk menerbitkan passport digital resmi UMLA.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. DATA PRIBADI */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-umla-gold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              1. Data Pribadi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Fauzan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Nomor Induk Mahasiswa (NIM) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 240101001"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Email Aktif <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Nomor WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Konfirmasi Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>
          </div>

          {/* 2. DATA AKADEMIK (Dropdowns: Tahun, Fakultas, Prodi) */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-umla-gold mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              2. Data Akademik
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Tahun MASTAMA <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input bg-umla-navy-900"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Fakultas <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input bg-umla-navy-900"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Program Studi <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedProdiId}
                  onChange={(e) => setSelectedProdiId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input bg-umla-navy-900"
                >
                  {availableProdis.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.degree} {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. DATA MASTAMA & KELOMPOK (40 Pilihan Kelompok) */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-umla-gold flex items-center gap-2">
                <Users className="w-4 h-4" />
                3. Kelompok MASTAMA
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                40 Kelompok Tersedia
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Pilih Kelompok MASTAMA yang Telah Ditentukan <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input bg-umla-navy-900"
              >
                <option value="">-- Pilih Kelompok MASTAMA (Kelompok 01 - 40) --</option>
                {groups.map((g) => {
                  const isFull = g.status === 'FULL' || g.availableSlots <= 0;
                  return (
                    <option key={g.id} value={g.id} disabled={isFull}>
                      {g.name} {isFull ? '(PENUH)' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Pilih nomor kelompok MASTAMA sesuai dengan pengumuman penugasan kelompok Anda.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-umla-gold via-umla-gold-500 to-yellow-500 text-umla-navy-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-umla-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Terbitkan Digital Student Passport'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Sudah memiliki passport?{' '}
          <Link href="/login" className="text-umla-gold font-bold underline hover:text-yellow-300">
            Masuk di sini
          </Link>
        </p>
      </div>

      {/* Requirement 15: ONBOARDING WELCOME MODAL */}
      {welcomeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel-gold bg-umla-navy-950 rounded-3xl p-8 text-center border-2 border-umla-gold/60 shadow-[0_0_60px_rgba(212,175,55,0.3)] animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-umla-gold-600 via-umla-gold to-yellow-200 text-umla-navy-950 flex items-center justify-center mx-auto mb-4 font-black shadow-2xl shadow-umla-gold/40 animate-bounce">
              <Award className="w-10 h-10 text-umla-navy-950" />
            </div>

            <div className="text-xs font-black uppercase tracking-widest text-umla-gold">
              🎉 WELCOME TO UMLA!
            </div>

            <h2 className="text-2xl font-black text-white mt-1">Hi, {welcomeData.fullName}</h2>

            <p className="text-xs text-gray-300 mt-2 font-medium">
              Your Digital Student Passport has been created.
            </p>

            {/* Passport Brief Card */}
            <div className="my-6 p-4 rounded-2xl bg-white/5 border border-umla-gold/30 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Tahun:</span>
                <span className="font-bold text-white">MASTAMA 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Program Studi:</span>
                <span className="font-bold text-white">{welcomeData.prodiName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kelompok:</span>
                <span className="font-bold text-emerald-400">{welcomeData.groupName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pendamping:</span>
                <span className="font-bold text-gray-200">{welcomeData.mentorName}</span>
              </div>
            </div>

            <p className="text-xs text-gold-gradient font-black tracking-wider uppercase mb-6">
              Your Journey Starts Here.
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-umla-gold via-umla-gold-500 to-yellow-500 text-umla-navy-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-umla-gold/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              OPEN MY PASSPORT
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
