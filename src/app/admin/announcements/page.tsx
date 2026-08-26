'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Trash2,
  Pin,
  FileText,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Send,
  X,
  Loader2,
  Pencil,
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  fileUrl: string | null;
  fileName: string | null;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  author: { fullName: string };
}

const CATEGORIES = [
  { value: 'PENGUMUMAN', label: 'Pengumuman', icon: <Megaphone className="w-4 h-4" />, color: 'text-umla-gold' },
  { value: 'JUKNIS', label: 'Juknis', icon: <FileText className="w-4 h-4" />, color: 'text-blue-400' },
  { value: 'TATA_TERTIB', label: 'Tata Tertib', icon: <ShieldCheck className="w-4 h-4" />, color: 'text-rose-400' },
  { value: 'DOKUMEN', label: 'Dokumen', icon: <FileText className="w-4 h-4" />, color: 'text-emerald-400' },
  { value: 'INFO', label: 'Info', icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-400' },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('PENGUMUMAN');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const isEditing = !!editingId;
      const url = '/api/announcements';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        category,
        fileUrl: fileUrl.trim() || null,
        fileName: fileName.trim() || null,
        isPinned,
      };

      if (isEditing) {
        payload.id = editingId;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchAnnouncements();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal membuat pengumuman.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setFileUrl(item.fileUrl || '');
    setFileName(item.fileName || '');
    setIsPinned(item.isPinned);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('PENGUMUMAN');
    setFileUrl('');
    setFileName('');
    setIsPinned(false);
    setShowForm(false);
    setEditingId(null);
  };

  const getCatConfig = (cat: string) => {
    return CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-umla-navy-950 px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="w-10 h-10 rounded-2xl bg-umla-navy-900 border border-umla-gold/20 flex items-center justify-center text-umla-gold hover:bg-umla-navy-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">Pengumuman & Dokumen</h1>
            <p className="text-xs text-gray-400">Kelola informasi untuk mahasiswa baru</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-umla-gold text-umla-navy-950 text-sm font-bold hover:brightness-110 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Batal' : 'Buat Baru'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-3xl glass-panel bg-umla-navy-900/80 border border-umla-gold/30 space-y-4">
          <h3 className="text-sm font-bold text-umla-gold flex items-center gap-2">
            <Send className="w-4 h-4" />
            {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          </h3>

          {/* Category Selection */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    category === cat.value
                      ? 'bg-umla-gold/20 border-umla-gold text-umla-gold'
                      : 'bg-umla-navy-800 border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Judul *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Petunjuk Teknis MASTAMA 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-umla-navy-800 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-umla-gold focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Isi Pengumuman *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tulis isi pengumuman di sini..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-umla-navy-800 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-umla-gold focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* File URL & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Link Dokumen (Opsional)</label>
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-umla-navy-800 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-umla-gold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nama File (Opsional)</label>
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="Contoh: Juknis_MASTAMA_2026.pdf"
                className="w-full px-4 py-2.5 rounded-xl bg-umla-navy-800 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-umla-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isPinned
                  ? 'bg-umla-gold/20 border-umla-gold text-umla-gold'
                  : 'bg-umla-navy-800 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              {isPinned ? 'Pinned' : 'Pin ke Atas'}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="w-full py-3 rounded-2xl bg-umla-gold text-umla-navy-950 font-bold text-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {editingId ? 'Simpan Perubahan' : 'Publikasikan Pengumuman'}
              </>
            )}
          </button>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
          {announcements.length} Pengumuman Aktif
        </span>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-umla-gold animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 rounded-2xl bg-umla-navy-900/50 border border-white/10 text-center">
            <Megaphone className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada pengumuman.</p>
            <p className="text-xs text-gray-500">Klik "Buat Baru" untuk membuat pengumuman pertama.</p>
          </div>
        ) : (
          announcements.map((item) => {
            const catConf = getCatConfig(item.category);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl glass-panel bg-umla-navy-900/80 border border-white/10 hover:border-umla-gold/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catConf.color} bg-white/5`}>
                      {catConf.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.isPinned && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-umla-gold/20 text-umla-gold text-[9px] font-black">
                            <Pin className="w-2.5 h-2.5" /> PINNED
                          </span>
                        )}
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/10 ${catConf.color}`}>
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 truncate">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.content}</p>
                      {item.fileUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 mt-1">
                          <FileText className="w-3 h-3" />
                          {item.fileName || 'File terlampir'}
                        </span>
                      )}
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
