'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Mail,
  Lock,
  Phone,
  RefreshCw,
  Save,
  X,
  User,
  Hash,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Edit State
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNim, setEditNim] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editGroupId, setEditGroupId] = useState('');

  // Delete State
  const [deletingStudent, setDeletingStudent] = useState<any | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Delay slightly to prevent excessive requests on typing
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(currentPage);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedGroupFilter, currentPage]);

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const url = new URL(window.location.origin + '/api/admin/students');
      if (searchQuery) url.searchParams.append('search', searchQuery);
      if (selectedGroupFilter) url.searchParams.append('groupId', selectedGroupFilter);
      url.searchParams.append('page', page.toString());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setGroups(data.groups);
        setTotalPages(data.totalPages);
        setTotalStudents(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMsg({ type, message });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setEditName(student.fullName);
    setEditEmail(student.email);
    setEditNim(student.nim);
    setEditPhone(student.phoneNumber || '');
    setEditPassword('');
    setEditGroupId(student.group?.id || '');
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STUDENT',
          studentUserId: editingStudent.id,
          newFullName: editName,
          newEmail: editEmail,
          newNim: editNim,
          newPhoneNumber: editPhone,
          newPassword: editPassword || undefined,
          newGroupId: editGroupId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingStudent(null);
        showToast('success', data.message);
        fetchStudents(currentPage);
      } else {
        showToast('error', data.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_STUDENT',
          studentUserId: deletingStudent.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeletingStudent(null);
        showToast('success', data.message);
        fetchStudents(currentPage);
      } else {
        showToast('error', data.error || 'Gagal menghapus mahasiswa.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-2 shadow-2xl animate-in slide-in-from-top-4 ${
          toastMsg.type === 'success' ? 'bg-emerald-500/90 border border-emerald-400' : 'bg-rose-500/90 border border-rose-400'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
          <span className="text-white font-bold text-sm">{toastMsg.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-white">Manajemen Mahasiswa</h1>
        <p className="text-sm text-gray-400 mt-1">Cari, edit data, ganti kelompok, atau reset password mahasiswa.</p>
      </div>

      <div className="glass-panel bg-umla-navy-950 rounded-3xl p-6 border border-white/10 space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Nama / NIM / Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-umla-gold focus:ring-1 focus:ring-umla-gold transition-all"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-umla-gold transition-all appearance-none"
            >
              <option value="">Semua Kelompok</option>
              {groups.map(g => (
                <option key={g.id} value={g.id} className="bg-umla-navy-900">{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 font-medium">Menampilkan {students.length} dari total {totalStudents} mahasiswa.</p>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-white/5">
                <th className="py-3 px-4">Nama & NIM</th>
                <th className="py-3 px-4">Email / HP</th>
                <th className="py-3 px-4">Kelompok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-umla-gold" />
                    Memuat data mahasiswa...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">Tidak ada mahasiswa yang ditemukan.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{s.fullName}</div>
                      <div className="text-gray-400 font-mono mt-0.5">{s.nim}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-300">{s.email}</div>
                      <div className="text-gray-500 mt-0.5">{s.phoneNumber || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {s.group ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                          {s.group.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Belum ada kelompok</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 transition-colors"
                          title="Edit & Reset Password"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(s)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                          title="Hapus Mahasiswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-gray-400">Halaman {currentPage} dari {totalPages}</span>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-blue-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white">Edit Mahasiswa</h3>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">NIM (Nomor Induk)</label>
                  <input
                    type="text"
                    required
                    value={editNim}
                    onChange={(e) => setEditNim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Email (Login)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">No HP / WA</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">Pindah Kelompok</label>
                <select
                  value={editGroupId}
                  onChange={(e) => setEditGroupId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                >
                  <option value="">-- Pilih Kelompok --</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-umla-navy-900">{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1 text-yellow-400">Reset Password (Opsional)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex justify-center items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-rose-500/40 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Hapus Mahasiswa?</h3>
              <p className="text-xs text-gray-300 mt-2">
                Anda yakin ingin menghapus <span className="font-bold text-white">{deletingStudent.fullName}</span>?
              </p>
              <p className="text-[10px] text-rose-400 font-bold mt-2">Tindakan ini permanen dan akan menghapus semua riwayat MASTAMA mahasiswa ini.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex justify-center items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
