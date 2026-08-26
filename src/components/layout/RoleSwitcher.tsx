'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Shield, GraduationCap, Users, RefreshCw, X } from 'lucide-react';

export default function RoleSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const switchRole = async (role: string, email: string, redirectUrl: string) => {
    setLoadingRole(role);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel-gold bg-umla-navy-900/90 text-umla-gold font-bold text-xs shadow-2xl hover:scale-105 transition-all border border-umla-gold/50 cursor-pointer group"
          title="Demo Role Switcher"
        >
          <UserCheck className="w-4 h-4 text-umla-gold group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Role Switcher</span>
          <span className="px-1.5 py-0.5 rounded bg-umla-gold/20 text-[10px] text-white">DEMO</span>
        </button>
      ) : (
        <div className="w-72 rounded-2xl glass-panel bg-umla-navy-950 border-2 border-umla-gold/50 shadow-2xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-umla-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Demo Switcher</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-2 mb-3">
            Beralih peran secara instan untuk menguji fitur & alur approval:
          </p>

          <div className="space-y-2">
            {/* Student */}
            <button
              onClick={() => switchRole('STUDENT', 'student@umla.ac.id', '/dashboard')}
              disabled={!!loadingRole}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-umla-gold/15 border border-white/10 hover:border-umla-gold/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-umla-gold">Ahmad Fauzan</p>
                  <p className="text-[10px] text-gray-400">Mahasiswa (Klp 07 - IF)</p>
                </div>
              </div>
              {loadingRole === 'STUDENT' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-umla-gold" />}
            </button>

            {/* Mentor */}
            <button
              onClick={() => switchRole('GROUP_MENTOR', 'mentor1@umla.ac.id', '/mentor/approvals')}
              disabled={!!loadingRole}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-umla-gold/15 border border-white/10 hover:border-umla-gold/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-umla-gold">Budi Santoso</p>
                  <p className="text-[10px] text-gray-400">Pendamping (Klp 01, 07)</p>
                </div>
              </div>
              {loadingRole === 'GROUP_MENTOR' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-umla-gold" />}
            </button>

            {/* Admin */}
            <button
              onClick={() => switchRole('ADMIN', 'admin@umla.ac.id', '/admin/dashboard')}
              disabled={!!loadingRole}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-umla-gold/15 border border-white/10 hover:border-umla-gold/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-umla-gold">Administrator</p>
                  <p className="text-[10px] text-gray-400">Full Access Control</p>
                </div>
              </div>
              {loadingRole === 'ADMIN' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-umla-gold" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
