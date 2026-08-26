'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Upload,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import ActivityDetailModal from '@/components/ui/ActivityDetailModal';
import { ActivityCardData } from '@/types';

export default function JourneyPage() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityCardData | null>(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/journeys');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setJourneys(data.journeys || []);
        }
      }
    } catch (err) {
      console.error('Error loading journeys:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Compass className="w-8 h-8 text-umla-gold animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Memuat Rangkaian Journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-umla-gold/15 text-umla-gold text-xs font-bold mb-3 border border-umla-gold/30">
          <Compass className="w-3.5 h-3.5" />
          MASTAMA TIMELINE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">RANGKAIAN JOURNEY MASTAMA UMLA</h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-2">
          Ikuti seluruh rangkaian kegiatan resmi dari 28 Agustus hingga 3 September 2026. Selesaikan misi & kumpulkan stamp resmi.
        </p>
      </div>

      {/* Journey Sections */}
      <div className="space-y-12 relative before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-gradient-to-b before:from-umla-gold before:via-emerald-400 before:to-purple-500 before:-translate-x-1/2 before:pointer-events-none">
        {journeys.map((journey, jIdx) => {
          const journeyDateFormatted = new Date(journey.targetDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          return (
            <div key={journey.id} className="relative z-10 space-y-4">
              {/* Journey Node Badge */}
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-2xl ring-4 ring-umla-navy-950 transition-all ${
                  journey.isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                    : 'bg-umla-gold text-umla-navy-950 shadow-umla-gold/40'
                }`}>
                  {journey.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : `0${journey.orderNum}`}
                </div>

                <div className="mt-2 bg-umla-navy-900/90 border border-umla-gold/30 px-4 py-1.5 rounded-full shadow-lg">
                  <span className="text-[11px] font-black text-umla-gold tracking-widest uppercase">
                    ● {journeyDateFormatted}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">{journey.title}</h2>
                {journey.subtitle && (
                  <p className="text-xs text-gray-300 font-medium">{journey.subtitle}</p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    journey.mode === 'ONLINE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {journey.mode}
                  </span>
                  {journey.location && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-umla-gold" />
                      {journey.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Missions & Dynamic Activities Cards */}
              {journey.missions?.map((mission: any) => (
                <div key={mission.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mission.activities?.map((activity: any) => {
                      const isCompleted = activity.status === 'COMPLETED';
                      const isUnderReview = activity.status === 'UNDER_REVIEW';
                      const isRejected = activity.status === 'REJECTED';

                      return (
                        <div
                          key={activity.id}
                          className={`rounded-3xl overflow-hidden glass-panel bg-umla-navy-950 border transition-all duration-300 flex flex-col justify-between group hover:scale-[1.02] ${
                            isCompleted
                              ? 'border-emerald-500/40 shadow-emerald-500/10'
                              : isUnderReview
                              ? 'border-amber-500/40 shadow-amber-500/10'
                              : isRejected
                              ? 'border-rose-500/40 shadow-rose-500/10'
                              : 'border-umla-gold/30 hover:border-umla-gold shadow-xl'
                          }`}
                        >
                          {/* Card Banner */}
                          <div className="relative h-40 w-full overflow-hidden bg-umla-navy-900">
                            <img
                              src={activity.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                              alt={activity.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-umla-navy-950 via-umla-navy-950/40 to-transparent pointer-events-none" />

                            {/* Status Overlay Badge */}
                            <div className="absolute top-3 right-3">
                              {isCompleted && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                                  <CheckCircle2 className="w-3 h-3" />
                                  COMPLETED
                                </span>
                              )}
                              {isUnderReview && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                                  <Clock className="w-3 h-3 animate-spin" />
                                  UNDER REVIEW
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                                  <AlertCircle className="w-3 h-3" />
                                  REJECTED
                                </span>
                              )}
                              {!isCompleted && !isUnderReview && !isRejected && (
                                <span className="px-2.5 py-1 rounded-full bg-umla-navy-900/90 border border-umla-gold/40 text-umla-gold text-[10px] font-black uppercase tracking-wider shadow-lg">
                                  UPCOMING
                                </span>
                              )}
                            </div>

                            {/* XP Pill */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-umla-gold text-umla-navy-950 text-[10px] font-black shadow-lg">
                              <Sparkles className="w-3 h-3" />
                              +{activity.xpReward} XP
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <span className="text-[10px] text-gray-400 font-mono">{activity.code}</span>
                              <h3 className="text-sm font-bold text-white leading-tight group-hover:text-umla-gold transition-colors">
                                {activity.title}
                              </h3>
                              {activity.subtitle && (
                                <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-1">{activity.subtitle}</p>
                              )}
                            </div>

                            <div className="space-y-1 text-[11px] text-gray-400 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-umla-gold shrink-0" />
                                <span>{activity.startTime} – {activity.endTime} WIB</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-umla-gold shrink-0" />
                                <span className="truncate">{activity.location}</span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() =>
                                setSelectedActivity({
                                  ...activity,
                                  journeyTitle: journey.title,
                                  submissionStatus: activity.status,
                                  rejectionReason: activity.rejectionReason,
                                })
                              }
                              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : isUnderReview
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                  : isRejected
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                  : 'bg-umla-gold hover:bg-yellow-400 text-umla-navy-950 font-black shadow-md shadow-umla-gold/20'
                              }`}
                            >
                              {isCompleted
                                ? 'Lihat Detail Selesai'
                                : isUnderReview
                                ? 'Status Submission'
                                : isRejected
                                ? 'Perbaiki Submission'
                                : 'Buka Detail & Submit'}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onSuccessSubmission={fetchJourneys}
        />
      )}
    </div>
  );
}
