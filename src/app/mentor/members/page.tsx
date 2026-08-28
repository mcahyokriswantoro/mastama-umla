'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  UserMinus,
  Loader2,
  Lock,
  X,
} from 'lucide-react';

export default function MentorMembersPage() {
  const [groupData, setGroupData] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  // Reset Password State
  const [resettingStudent, setResettingStudent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mentor/group-matrix');
      const data = await res.json();
      setGroupData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengeluarkan ${studentName} dari kelompok ini?\n\nCATATAN: Akun mahasiswa ini akan dihapus agar mereka bisa mendaftar ulang dan memilih kelompok yang benar.`)) {
      return;
    }

    try {
      setRemovingId(studentId);
      const res = await fetch('/api/mentor/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();

      if (res.ok) {
        alert('Mahasiswa berhasil dikeluarkan. Akun telah dihapus sehingga mahasiswa dapat mendaftar ulang.');
        fetchMembers(); // refresh
      } else {
        alert(data.error || 'Gagal mengeluarkan mahasiswa.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingStudent || !newPassword) return;

    if (newPassword.length < 6) {
      alert('Password baru minimal 6 karakter.');
      return;
    }

    try {
      setResetLoading(true);
      const res = await fetch('/api/mentor/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: resettingStudent.id, 
          newPassword 
        }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Password berhasil direset!');
        setResettingStudent(null);
        setNewPassword('');
      } else {
        alert(data.error || 'Gagal mereset password.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan.');
    } finally {
      setResetLoading(false);
    }
  };

  const members = groupData?.members || [];
  const filtered = members.filter(
    (m: any) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.nim.toLowerCase().includes(search.toLowerCase()) ||
      m.studyProgram.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold mb-2 border border-blue-500/30">
            <Users className="w-3.5 h-3.5" />
            ANGGOTA KELOMPOK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            MATRIKS ANGGOTA {groupData?.group?.name || 'KELOMPOK'}
          </h1>
          <p className="text-xs text-gray-400">
            Total {members.length} mahasiswa terdaftar di kelompok binaan Anda.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama, NIM, prodi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Members Cards Grid */}
      {loading && members.length === 0 ? (
        <div className="flex justify-center py-12">
           <Loader2 className="w-8 h-8 animate-spin text-umla-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m: any) => (
            <div
              key={m.id}
              className="p-5 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 flex flex-col justify-between space-y-4 hover:border-umla-gold/60 transition-all shadow-xl relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <img
                  src={m.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=random`}
                  alt={m.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-umla-gold/40 shrink-0 bg-white"
                />
                <div className="overflow-hidden flex-1">
                  <h3 className="text-sm font-black text-white truncate pr-6">{m.fullName}</h3>
                  <p className="font-mono text-xs font-bold text-umla-gold">{m.nim}</p>
                  <p className="text-[11px] text-gray-300 truncate mt-0.5">{m.studyProgram}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">XP</span>
                  <span className="text-xs font-black text-emerald-400">{m.totalXp}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Progress</span>
                  <span className="text-xs font-black text-umla-gold">{m.progressPercent}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Badges</span>
                  <span className="text-xs font-black text-blue-400">{m.badgesCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {m.phone && (
                  <a
                    href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                )}
                
                <button
                  onClick={() => setResettingStudent(m)}
                  className="flex-1 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  title="Reset Password Mahasiswa"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Reset PSS
                </button>
                
                <button
                  onClick={() => handleRemoveMember(m.id, m.fullName)}
                  disabled={removingId === m.id}
                  className="flex-1 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  title="Tolak/Keluarkan dari kelompok"
                >
                  {removingId === m.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserMinus className="w-3.5 h-3.5" />
                  )}
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-blue-500/40 shadow-2xl space-y-4 text-center">
            <button onClick={() => setResettingStudent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Reset Password</h3>
              <p className="text-xs text-gray-300 mt-2">
                Masukkan password baru untuk mahasiswa <br/><span className="font-bold text-white text-sm">{resettingStudent.fullName}</span>
              </p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Password Baru</label>
                <input
                  type="text"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-mono text-center"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex justify-center items-center gap-2"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Simpan PSS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
