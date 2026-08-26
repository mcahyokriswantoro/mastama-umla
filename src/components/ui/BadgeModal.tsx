'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, X, Check } from 'lucide-react';

interface BadgeModalProps {
  badge: {
    name: string;
    description: string;
    icon?: string;
    xpRequirement?: number;
  } | null;
  onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  useEffect(() => {
    if (badge) {
      // Fire celebratory confetti!
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4AF37', '#F7E298', '#10B981', '#3B82F6'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4AF37', '#F7E298', '#10B981', '#3B82F6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm glass-panel-gold bg-umla-navy-950 rounded-3xl p-6 text-center border-2 border-umla-gold/60 shadow-[0_0_50px_rgba(212,175,55,0.3)] animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Icon Glowing Frame */}
        <div className="mx-auto my-4 w-24 h-24 rounded-3xl bg-gradient-to-tr from-umla-gold-600 via-umla-gold to-yellow-200 p-1 shadow-2xl shadow-umla-gold/50 animate-bounce">
          <div className="w-full h-full bg-umla-navy-900 rounded-[22px] flex items-center justify-center border border-umla-gold/40">
            <Award className="w-12 h-12 text-umla-gold animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-umla-gold mb-1">
          <Sparkles className="w-4 h-4 text-umla-gold" />
          Achievement Unlocked!
        </div>

        <h3 className="text-xl font-black text-white">{badge.name}</h3>
        <p className="text-xs text-gray-300 mt-2 leading-relaxed px-2">{badge.description}</p>

        {/* XP Bonus */}
        <div className="my-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-umla-gold/20 border border-umla-gold/40 text-umla-gold font-black text-sm">
          <Sparkles className="w-4 h-4" />
          +100 XP Digital Passport
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-umla-gold via-umla-gold-500 to-yellow-500 text-umla-navy-950 font-black text-sm shadow-xl shadow-umla-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Lanjutkan Perjalanan
        </button>
      </div>
    </div>
  );
}
