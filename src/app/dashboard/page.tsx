'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Compass,
  Award,
  Flame,
  Target,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sun,
  Cpu,
  QrCode,
  Megaphone,
  FileText,
  Download,
  Pin,
  ExternalLink,
} from 'lucide-react';
import PassportCard from '@/components/ui/PassportCard';
import ActivityDetailModal from '@/components/ui/ActivityDetailModal';
import { UserSession, ActivityCardData } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityCardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [userRes, journeyRes, announcementRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/journeys'),
        fetch('/api/announcements'),
      ]);

      let userData = null;
      let journeyData = null;
      let announcementData = null;

      if (userRes.ok && userRes.headers.get('content-type')?.includes('application/json')) {
        userData = await userRes.json();
      }

      if (journeyRes.ok && journeyRes.headers.get('content-type')?.includes('application/json')) {
        journeyData = await journeyRes.json();
      }

      if (announcementRes.ok && announcementRes.headers.get('content-type')?.includes('application/json')) {
        announcementData = await announcementRes.json();
      }

      if (!userData?.user) {
        router.push('/login');
        return;
      }

      if (userData.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }
      if (userData.user.role === 'GROUP_MENTOR') {
        router.push('/mentor/approvals');
        return;
      }

      setCurrentUser(userData.user);
      setJourneys(journeyData?.journeys || []);
      setAnnouncements(announcementData?.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten all activities to find Next Mission and Calculate Real Stats
  const allActivities: ActivityCardData[] = [];
  journeys.forEach((j) => {
    j.missions?.forEach((m: any) => {
      m.activities?.forEach((a: any) => {
        allActivities.push({
          ...a,
          journeyTitle: j.title,
          journeyCode: j.code,
          submissionStatus: a.status,
        });
      });
    });
  });

  const totalActivitiesCount = allActivities.length;
  const completedActivitiesCount = allActivities.filter(
    (a) => a.submissionStatus === 'COMPLETED'
  ).length;
  const progressPercent =
    totalActivitiesCount > 0
      ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100)
      : 0;

  // Next Upcoming Mission (First activity not yet completed)
  const nextMission = allActivities.find((a) => a.submissionStatus !== 'COMPLETED') || allActivities[0];

  if (loading || !currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-umla-gold animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Memuat Digital Passport...</p>
        </div>
      </div>
    );
  }

  const profile = currentUser.studentProfile;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-umla-gold/20 text-umla-gold text-[11px] font-black tracking-wider border border-umla-gold/30">
              MASTAMA UMLA 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Halo, {currentUser.fullName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Your journey has started. Jelajahi setiap misi & raih lencana emas. Sertifikat MASTAMA akan diperoleh setelah misi sudah mencapai 100%. Kegiatan dilaksanakan maksimal 6 Bulan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/passport"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-umla-gold/20 hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Buka Passport Lengkap
          </Link>
        </div>
      </div>

      {/* QUICK STATISTICS (Requirement 20) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">ACHIEVEMENTS</span>
            <Award className="w-4 h-4 text-umla-gold" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{profile?.badges?.length ?? 0}</p>
          <span className="text-[10px] text-emerald-400">Lencana Terbuka</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">XP DIGITAL</span>
            <Sparkles className="w-4 h-4 text-umla-gold" />
          </div>
          <p className="text-2xl font-black text-umla-gold mt-1">
            {profile?.totalXp || 0} <span className="text-xs text-gray-400 font-normal">/ 2.850 XP</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-bold">
            {Math.min(100, Math.round(((profile?.totalXp || 0) / 2850) * 100))}% Progres Total (100%)
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">COMPLETED</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {completedActivitiesCount} <span className="text-xs text-gray-400 font-normal">/ {totalActivitiesCount}</span>
          </p>
          <span className="text-[10px] text-emerald-400">{progressPercent}% Tuntas</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">STREAK</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <p className="text-2xl font-black text-orange-400 mt-1">{profile?.streakCount ?? 0} Hari</p>
          <span className="text-[10px] text-gray-400">Keaktifan Kampus</span>
        </div>
      </div>

      {/* OVERALL PROGRESS BAR (Requirement 18) */}
      <div className="p-6 rounded-3xl glass-panel bg-umla-navy-900/80 border border-umla-gold/30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-umla-gold">YOUR JOURNEY PROGRESS</span>
            <h3 className="text-lg font-black text-white">MASTAMA 2026 Completion</h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-gold-gradient">{progressPercent}%</span>
            <p className="text-[10px] text-gray-400 font-medium">{completedActivitiesCount} Completed Activities</p>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-umla-gold via-yellow-400 to-emerald-400 transition-all duration-700 shadow-lg shadow-umla-gold/40"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Grid: NEXT MISSION (Requirement 19) + Post-MASTAMA Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Mission Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-panel-gold bg-umla-navy-950 border-2 border-umla-gold/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-umla-gold flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                NEXT MISSION
              </span>
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-white/10">
                {nextMission ? new Date(nextMission.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }) : '31 AUGUST 2026'}
              </span>
            </div>

            {nextMission ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    nextMission.mode === 'ONLINE' ? 'bg-blue-500/30 text-blue-300' : 'bg-rose-500/30 text-rose-300'
                  }`}>
                    🔴 {nextMission.mode}
                  </span>
                  <span className="text-[10px] text-umla-gold font-mono">{nextMission.code}</span>
                </div>

                <h3 className="text-xl font-black text-white">{nextMission.title}</h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{nextMission.description}</p>

                <div className="flex items-center gap-3 mt-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-umla-gold" />
                    {nextMission.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-umla-gold" />
                    {nextMission.startTime} WIB
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400">Seluruh misi telah diselesaikan!</p>
            )}
          </div>

          <button
            onClick={() => nextMission && setSelectedActivity(nextMission)}
            className="w-full mt-6 py-3 rounded-2xl bg-umla-gold hover:bg-yellow-400 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-umla-gold/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            VIEW DETAIL MISSION
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Post-MASTAMA Quick Hubs (15x ORMAWA, 24x Dzuhur, AI Challenge) */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* ORMAWA Card */}
          <Link
            href="/missions"
            className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20 hover:border-umla-gold/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-umla-gold transition-colors">
                  ORMAWA Explorer Track
                </h4>
                <p className="text-[10px] text-gray-400">Target: 15× Mengikuti Kegiatan ORMAWA UMLA</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all"
                      style={{ width: `${Math.round(((profile?.ormawaCount || 0) / 15) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-cyan-300">
                    {profile?.ormawaCount || 0} / 15 Selesai
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Spiritual Card */}
          <Link
            href="/missions"
            className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20 hover:border-umla-gold/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-umla-gold transition-colors">
                  Spiritual Journey Track
                </h4>
                <p className="text-[10px] text-gray-400">Target: 24× Sholat Dzuhur Berjamaah di Masjid Ki Bagus Hadikusumo UMLA</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-all"
                      style={{ width: `${Math.round(((profile?.spiritualCount || 0) / 24) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-teal-300">
                    {profile?.spiritualCount || 0} / 24 Selesai
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* AI Challenge Card */}
          <Link
            href="/missions"
            className="p-4 rounded-2xl glass-panel bg-umla-navy-900/70 border border-umla-gold/20 hover:border-umla-gold/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-umla-gold transition-colors">
                  AI Challenge: Think – Create – Impact
                </h4>
                <p className="text-[10px] text-gray-400">Proyek Inovasi Solusi Kampus Cerdas</p>
                <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Status: DEVELOPMENT
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Digital Passport Preview */}
      <div className="pt-4">
        <PassportCard user={currentUser} />
      </div>

      {/* PENGUMUMAN & DOKUMEN DARI ADMIN */}
      {announcements.length > 0 && (
        <div className="pt-4">
          <div className="p-6 rounded-3xl glass-panel bg-umla-navy-900/80 border border-umla-gold/30">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-umla-gold flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4" />
                  PENGUMUMAN & DOKUMEN
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">Informasi dari Panitia MASTAMA</h3>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.map((item: any) => {
                const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
                  'PENGUMUMAN': { icon: <Megaphone className="w-4 h-4" />, color: 'text-umla-gold', bg: 'bg-umla-gold/15 border-umla-gold/30' },
                  'JUKNIS': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
                  'TATA_TERTIB': { icon: <ShieldCheck className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' },
                  'DOKUMEN': { icon: <FileText className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
                  'INFO': { icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
                };
                const cat = categoryConfig[item.category] || categoryConfig['PENGUMUMAN'];

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${cat.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cat.color} bg-white/5`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.isPinned && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-umla-gold/20 text-umla-gold text-[9px] font-black">
                              <Pin className="w-2.5 h-2.5" /> PINNED
                            </span>
                          )}
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${cat.color} bg-white/10`}>
                            {item.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed line-clamp-3">{item.content}</p>

                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-bold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {item.fileName || 'Unduh Dokumen'}
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        )}

                        <p className="text-[10px] text-gray-500 mt-2">
                          Diposting oleh {item.author?.fullName || 'Admin MASTAMA'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onSuccessSubmission={loadDashboardData}
        />
      )}
    </div>
  );
}
