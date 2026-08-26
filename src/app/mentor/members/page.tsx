'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Award,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export default function MentorMembersPage() {
  const [groupData, setGroupData] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m: any) => (
          <div
            key={m.id}
            className="p-5 rounded-3xl glass-panel bg-umla-navy-950 border border-umla-gold/30 flex flex-col justify-between space-y-4 hover:border-umla-gold/60 transition-all shadow-xl"
          >
            <div className="flex items-start gap-3">
              <img
                src={m.avatarUrl}
                alt={m.fullName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-umla-gold/40 shrink-0"
              />
              <div className="overflow-hidden">
                <h3 className="text-sm font-black text-white truncate">{m.fullName}</h3>
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
              <Link
                href="/mentor/approvals"
                className="flex-1 py-2 rounded-xl bg-umla-gold text-umla-navy-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md hover:bg-yellow-400 transition-all"
              >
                Approval
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
