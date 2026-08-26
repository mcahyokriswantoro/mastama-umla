'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import ActivityDetailModal from '@/components/ui/ActivityDetailModal';
import { ActivityCardData } from '@/types';

export default function HistoryPage() {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'REJECTED'>('ALL');
  const [activities, setActivities] = useState<ActivityCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityCardData | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/journeys');
      const data = await res.json();

      const items: ActivityCardData[] = [];
      data.journeys?.forEach((j: any) => {
        j.missions?.forEach((m: any) => {
          m.activities?.forEach((a: any) => {
            items.push({
              ...a,
              journeyTitle: j.title,
              submissionStatus: a.status,
            });
          });
        });
      });

      setActivities(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return a.submissionStatus === 'COMPLETED';
    if (filter === 'PENDING') return a.submissionStatus === 'UNDER_REVIEW';
    if (filter === 'REJECTED') return a.submissionStatus === 'REJECTED';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/15 text-umla-gold text-xs font-bold mb-2 border border-umla-gold/30">
            <BookOpen className="w-3.5 h-3.5" />
            ACTIVITY LOG
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">MY ACTIVITY HISTORY</h1>
          <p className="text-xs text-gray-400">Pantau seluruh status pengajuan kegiatan dan verifikasi pendamping.</p>
        </div>

        {/* Filter Tabs (Requirement 38) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel bg-umla-navy-950 border border-white/10">
          {(['ALL', 'COMPLETED', 'PENDING', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-umla-gold text-umla-navy-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'Semua' : tab === 'COMPLETED' ? 'Disetujui' : tab === 'PENDING' ? 'Menunggu' : 'Ditolak'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel bg-umla-navy-950 text-center border border-white/10">
            <p className="text-xs text-gray-400">Tidak ada aktivitas dengan status ini.</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isCompleted = act.submissionStatus === 'COMPLETED';
            const isPending = act.submissionStatus === 'UNDER_REVIEW';
            const isRejected = act.submissionStatus === 'REJECTED';

            return (
              <div
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className={`p-4 sm:p-5 rounded-2xl glass-panel bg-umla-navy-950/80 border transition-all cursor-pointer hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-emerald-500/40 hover:border-emerald-500'
                    : isPending
                    ? 'border-amber-500/40 hover:border-amber-500'
                    : isRejected
                    ? 'border-rose-500/40 hover:border-rose-500'
                    : 'border-white/10 hover:border-umla-gold/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isPending
                      ? 'bg-amber-500/20 text-amber-400'
                      : isRejected
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-white/5 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isPending ? (
                      <Clock className="w-5 h-5 animate-spin" />
                    ) : isRejected ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-umla-gold font-mono font-bold">{act.code}</span>
                      <span className="text-[10px] text-gray-500">•</span>
                      <span className="text-[10px] text-gray-400">{act.journeyTitle}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">{act.title}</h4>
                    {act.rejectionReason && (
                      <p className="text-xs text-rose-300 mt-1 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        Catatan Pendamping: "{act.rejectionReason}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-xs font-bold text-umla-gold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{act.xpReward} XP
                  </span>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isPending
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : isRejected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {act.submissionStatus || 'UPCOMING'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onSuccessSubmission={fetchActivities}
        />
      )}
    </div>
  );
}
