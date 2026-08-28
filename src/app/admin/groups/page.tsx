'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Settings,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Plus,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Search,
  X,
  Check,
  Award,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupAssignMode, setGroupAssignMode] = useState<string>('ADMIN_ASSIGN');
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'MENTORS' | 'ASSIGN'>('GROUPS');

  // Edit group modal
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [capacity, setCapacity] = useState('30');
  const [groupName, setGroupName] = useState('');
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);

  // Add mentor modal
  const [isAddMentorOpen, setIsAddMentorOpen] = useState(false);
  const [mentorFullName, setMentorFullName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPassword, setMentorPassword] = useState('Admin123!');
  const [mentorPhone, setMentorPhone] = useState('');

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bulk mentor assignment
  const [bulkAssignments, setBulkAssignments] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Edit/Delete mentor modal
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [editMentorName, setEditMentorName] = useState('');
  const [editMentorEmail, setEditMentorEmail] = useState('');
  const [editMentorPassword, setEditMentorPassword] = useState('');
  const [editMentorPhone, setEditMentorPhone] = useState('');
  const [deletingMentor, setDeletingMentor] = useState<any | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/groups');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setGroups(data.groups || []);
        setGroupAssignMode(data.groupAssignMode || 'ADMIN_ASSIGN');
        setMentors(data.mentors || []);
      }
    } catch (err) {
      console.error('Error fetching admin groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const initBulkAssignments = () => {
    const initial: Record<string, string> = {};
    groups.forEach((g) => {
      initial[g.id] = g.mentors?.[0]?.id || '';
    });
    setBulkAssignments(initial);
    setHasUnsavedChanges(false);
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const assignments = Object.entries(bulkAssignments).map(([groupId, mentorId]) => ({
        groupId,
        mentorId: mentorId || null,
      }));

      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_ASSIGN_MENTORS',
          assignments,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        setHasUnsavedChanges(false);
        await fetchGroups();
      } else {
        showToast('error', data.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMsg({ type, message });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenEditMentor = (m: any) => {
    setEditingMentor(m);
    setEditMentorName(m.fullName);
    setEditMentorEmail(m.email);
    setEditMentorPassword('');
    setEditMentorPhone(m.phoneNumber || '');
  };

  const handleUpdateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MENTOR',
          mentorId: editingMentor.id,
          newFullName: editMentorName,
          newEmail: editMentorEmail,
          newPassword: editMentorPassword || undefined,
          newPhoneNumber: editMentorPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingMentor(null);
        showToast('success', data.message);
        await fetchGroups();
      } else {
        showToast('error', data.error || 'Gagal memperbarui data.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMentor = async () => {
    if (!deletingMentor) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MENTOR',
          mentorId: deletingMentor.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeletingMentor(null);
        showToast('success', data.message);
        await fetchGroups();
      } else {
        showToast('error', data.error || 'Gagal menghapus mentor.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMode = async (newMode: string) => {
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_MODE',
          groupAssignMode: newMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGroupAssignMode(newMode);
        showToast('success', data.message);
      } else {
        showToast('error', data.error || 'Gagal mengubah mode.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleOpenEditGroup = (g: any) => {
    setEditingGroup(g);
    setGroupName(g.name);
    setCapacity(String(g.capacity));
    setSelectedMentorIds(g.mentors?.map((m: any) => m.id) || []);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_GROUP',
          groupId: editingGroup.id,
          name: groupName,
          capacity: parseInt(capacity),
          mentorIds: selectedMentorIds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingGroup(null);
        showToast('success', data.message);
        fetchGroups();
      } else {
        showToast('error', data.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_MENTOR',
          fullName: mentorFullName,
          email: mentorEmail,
          password: mentorPassword,
          phoneNumber: mentorPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddMentorOpen(false);
        setMentorFullName('');
        setMentorEmail('');
        setMentorPassword('Admin123!');
        setMentorPhone('');
        showToast('success', data.message);
        await fetchGroups();
        if (editingGroup && data.mentor) {
          setSelectedMentorIds(prev => [...prev, data.mentor.id]);
        }
      } else {
        showToast('error', data.error || 'Gagal menambahkan pendamping.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMentorSelection = (mId: string) => {
    setSelectedMentorIds((prev) =>
      prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
    );
  };

  const filteredGroups = groups.filter((g) => {
    const query = searchQuery.toLowerCase();
    const matchName = g.name.toLowerCase().includes(query);
    const matchMentor = g.mentors?.some((m: any) => m.fullName.toLowerCase().includes(query));
    return matchName || matchMentor;
  });

  const filteredMentors = mentors.filter((m) => {
    const query = searchQuery.toLowerCase();
    return m.fullName.toLowerCase().includes(query) || m.email.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2 border border-blue-500/30">
            <Users className="w-3.5 h-3.5" />
            ADMIN GROUP & MENTOR MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            MANAJEMEN KELOMPOK & KAKAK PENDAMPING
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Kelola 40 kelompok MASTAMA, tetapkan kapasitas, dan daftarkan Kakak Pendamping (Role: GROUP_MENTOR).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddMentorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 hover:from-yellow-400 hover:to-umla-gold text-umla-navy-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-umla-gold/20 transition-transform hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            + Tambah Pendamping Baru
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-bold">{toastMsg.message}</span>
        </div>
      )}

      {/* Global Config Card: Student Selection Mode */}
      <div className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Settings className="w-4 h-4 text-umla-gold" />
            Metode Penentuan Kelompok Mahasiswa Baru
          </div>
          <p className="text-xs text-gray-400">
            Pilih apakah mahasiswa memilih kelompok sendiri saat registrasi atau ditentukan otomatis oleh admin.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
          <button
            onClick={() => handleToggleMode('STUDENT_SELECT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              groupAssignMode === 'STUDENT_SELECT'
                ? 'bg-umla-gold text-umla-navy-950 shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pilih Mandiri (Registrasi)
          </button>
          <button
            onClick={() => handleToggleMode('ADMIN_ASSIGN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              groupAssignMode === 'ADMIN_ASSIGN'
                ? 'bg-umla-gold text-umla-navy-950 shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ditentukan Admin
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'GROUPS'
                ? 'bg-umla-gold text-umla-navy-950 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Daftar 40 Kelompok ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('MENTORS')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'MENTORS'
                ? 'bg-umla-gold text-umla-navy-950 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Daftar Kakak Pendamping ({mentors.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('ASSIGN');
              initBulkAssignments();
            }}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ASSIGN'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Atur Pendamping Kelompok
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'GROUPS' ? 'Cari kelompok atau pendamping...' : 'Cari nama / email pendamping...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
          />
        </div>
      </div>

      {/* TAB 1: GROUPS GRID */}
      {activeTab === 'GROUPS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGroups.map((g) => (
            <div
              key={g.id}
              className="p-5 rounded-2xl glass-panel bg-umla-navy-900/60 border border-white/10 hover:border-umla-gold/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black text-umla-gold">
                    NO. {g.number < 10 ? '0' + g.number : g.number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.memberCount >= g.capacity
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {g.memberCount} / {g.capacity} Mhs
                  </span>
                </div>

                <h3 className="text-base font-black text-white">{g.name}</h3>

                {/* Mentors Badge */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Kakak Pendamping:
                  </span>
                  {g.mentors && g.mentors.length > 0 ? (
                    <div className="space-y-1">
                      {g.mentors.map((m: any) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1.5 text-xs text-umla-gold font-bold bg-umla-navy-950 px-2.5 py-1 rounded-lg border border-umla-gold/20"
                        >
                          <Shield className="w-3 h-3 shrink-0" />
                          <span className="truncate">{m.fullName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Belum ada pendamping</p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Status: {g.status}</span>
                <button
                  onClick={() => handleOpenEditGroup(g)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-umla-gold hover:text-umla-navy-950 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Kelompok
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: MENTORS LIST */}
      {activeTab === 'MENTORS' && (
        <div className="p-6 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-white">Daftar Akun Kakak Pendamping (Role: GROUP_MENTOR)</h3>
              <p className="text-xs text-gray-400">
                Kakak pendamping memiliki akses ke portal persetujuan absensi Sholat Dzuhur & kegiatan kelompok.
              </p>
            </div>
            <button
              onClick={() => setIsAddMentorOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-umla-gold text-umla-navy-950 font-black text-xs inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Tambah Pendamping
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">Email Akun</th>
                  <th className="pb-3">No. WhatsApp / HP</th>
                  <th className="pb-3">Kelompok Didampingi</th>
                  <th className="pb-3 text-right">Role</th>
                  <th className="pb-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMentors.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-umla-gold/20 border border-umla-gold/40 flex items-center justify-center text-umla-gold font-bold text-xs">
                        {m.fullName.charAt(0)}
                      </div>
                      <span>{m.fullName}</span>
                    </td>
                    <td className="py-3.5 text-gray-300 font-mono">{m.email}</td>
                    <td className="py-3.5 text-gray-300">{m.phoneNumber || '-'}</td>
                    <td className="py-3.5">
                      {m.assignedGroups && m.assignedGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.assignedGroups.map((grpName: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold"
                            >
                              {grpName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-[11px]">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-black text-[10px] border border-purple-500/30">
                        GROUP_MENTOR
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditMentor(m)}
                          className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 transition-colors"
                          title="Edit Data & Reset Password"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingMentor(m)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BULK ASSIGN MENTORS */}
      {activeTab === 'ASSIGN' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Pilih pendamping untuk setiap kelompok menggunakan dropdown, lalu klik <strong>"Simpan Semua Perubahan"</strong> di bagian bawah. Data tidak akan hilang karena tersimpan sekaligus.</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel bg-umla-navy-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-umla-navy-900/80 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3 w-16">No.</th>
                  <th className="px-4 py-3">Nama Kelompok</th>
                  <th className="px-4 py-3 w-24">Anggota</th>
                  <th className="px-4 py-3 min-w-[280px]">Kakak Pendamping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {groups.map((g) => {
                  const currentMentorId = bulkAssignments[g.id] || '';
                  const originalMentorId = g.mentors?.[0]?.id || '';
                  const isChanged = currentMentorId !== originalMentorId;

                  return (
                    <tr key={g.id} className={`transition-colors ${isChanged ? 'bg-umla-gold/5' : 'hover:bg-white/5'}`}>
                      <td className="px-4 py-3 font-mono font-black text-umla-gold">
                        {g.number < 10 ? '0' + g.number : g.number}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{g.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${g.memberCount >= g.capacity ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {g.memberCount}/{g.capacity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={currentMentorId}
                            onChange={(e) => {
                              setBulkAssignments(prev => ({ ...prev, [g.id]: e.target.value }));
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-umla-navy-900 border border-white/10 text-white focus:border-umla-gold focus:outline-none appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                          >
                            <option value="" style={{ backgroundColor: '#0a1628', color: '#9ca3af' }}>— Belum ada pendamping —</option>
                            {mentors.map((m) => (
                              <option key={m.id} value={m.id} style={{ backgroundColor: '#0a1628', color: '#fff' }}>
                                {m.fullName} ({m.email})
                              </option>
                            ))}
                          </select>
                          {isChanged && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-umla-gold animate-pulse" title="Berubah" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sticky Save All Button */}
          <div className="sticky bottom-20 md:bottom-4 z-10 pt-4">
            <button
              onClick={handleBulkSave}
              disabled={saving || !hasUnsavedChanges}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center gap-3 transition-all ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/30 hover:scale-[1.01]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'MENYIMPAN...' : hasUnsavedChanges ? `SIMPAN SEMUA PERUBAHAN PENDAMPING (${Object.values(bulkAssignments).filter(v => v).length} kelompok terisi)` : 'SEMUA PERUBAHAN SUDAH TERSIMPAN ✓'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT GROUP & ASSIGN MENTORS */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg glass-panel bg-umla-navy-950 rounded-3xl p-6 sm:p-8 border-2 border-umla-gold/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold text-umla-gold uppercase">
                  KELOMPOK {editingGroup.number}
                </span>
                <h3 className="text-lg font-black text-white">Edit Kelompok & Tetapkan Pendamping</h3>
              </div>
              <button
                onClick={() => setEditingGroup(null)}
                className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Nama Kelompok</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Kapasitas Maksimal Mahasiswa</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  min={1}
                  max={100}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              {/* Mentor Selection Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-gray-300">
                    Pilih Kakak Pendamping (Bisa lebih dari 1)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMentorOpen(true);
                    }}
                    className="text-[10px] text-umla-gold hover:underline font-bold"
                  >
                    + Tambah Pendamping Baru
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 rounded-xl bg-umla-navy-900 border border-white/10">
                  {mentors.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada akun pendamping terdaftar.</p>
                  ) : (
                    mentors.map((m) => {
                      const isSelected = selectedMentorIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMentorSelection(m.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-umla-gold/15 border-umla-gold text-white font-bold'
                              : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                                isSelected ? 'bg-umla-gold text-umla-navy-950 font-black' : 'border border-gray-500'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold">{m.fullName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{m.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            PENDAMPING
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW MENTOR (ROLE: GROUP_MENTOR) */}
      {isAddMentorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 sm:p-8 border-2 border-umla-gold/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full mb-1 border border-purple-500/30">
                  <Shield className="w-3 h-3" />
                  ROLE: GROUP_MENTOR
                </div>
                <h3 className="text-lg font-black text-white">Tambah Kakak Pendamping Baru</h3>
              </div>
              <button
                onClick={() => setIsAddMentorOpen(false)}
                className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Nama Lengkap Kakak Pendamping <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={mentorFullName}
                  onChange={(e) => setMentorFullName(e.target.value)}
                  placeholder="Contoh: Siti Aminah, S.Kom."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Email Akun (Login) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    placeholder="mentor2@umla.ac.id"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Password Akun <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mentorPassword}
                    onChange={(e) => setMentorPassword(e.target.value)}
                    placeholder="Admin123!"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
                <span className="text-[10px] text-gray-400">Password default: Admin123!</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">No. WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mentorPhone}
                    onChange={(e) => setMentorPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddMentorOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Daftarkan Pendamping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT MENTOR (Edit Email, Password, Name, Phone) */}
      {editingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 sm:p-8 border-2 border-blue-500/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full mb-1 border border-blue-500/30">
                  <Edit2 className="w-3 h-3" />
                  EDIT DATA PENDAMPING
                </div>
                <h3 className="text-lg font-black text-white">Edit {editingMentor.fullName}</h3>
              </div>
              <button onClick={() => setEditingMentor(null)} className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMentor} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editMentorName}
                  onChange={(e) => setEditMentorName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Email Akun (Login) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={editMentorEmail}
                    onChange={(e) => setEditMentorEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Password Baru <span className="text-gray-500">(kosongkan jika tidak ingin mengubah)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editMentorPassword}
                    onChange={(e) => setEditMentorPassword(e.target.value)}
                    placeholder="Isi untuk reset password..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input font-mono"
                  />
                </div>
                <span className="text-[10px] text-yellow-400 mt-1 block">⚠️ Jika mentor tidak bisa login, isi password baru di sini (misal: Admin123!)</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">No. WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={editMentorPhone}
                    onChange={(e) => setEditMentorPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMentor(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE MENTOR CONFIRMATION */}
      {deletingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-rose-500/40 shadow-2xl space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-base font-black text-white">Hapus Akun Pendamping?</h3>
              <p className="text-xs text-gray-300 mt-2">
                Akun <span className="font-bold text-white">{deletingMentor.fullName}</span> ({deletingMentor.email}) akan dihapus permanen beserta semua assignment kelompoknya.
              </p>
              <p className="text-[10px] text-rose-400 mt-1 font-bold">⚠️ Tindakan ini tidak bisa dibatalkan!</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingMentor(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMentor}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Ya, Hapus!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
