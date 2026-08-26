'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Compass,
  Award,
  BookOpen,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  Users,
  ChevronDown,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { UserSession } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        setCurrentUser(data.user);
        setNotifications(data.notifications || []);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/login');
    router.refresh();
  };

  const isStudent = currentUser?.role === 'STUDENT';
  const isMentor = currentUser?.role === 'GROUP_MENTOR';
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-umla-gold/20 bg-umla-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center gap-2">
            <img
              src="/logo-mastama.png"
              alt="Logo MASTAMA UMLA"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-md group-hover:scale-110 transition-transform"
            />
            <img
              src="/logo-umla.png"
              alt="Logo UMLA"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">MASTAMA</span>
            </div>
            <p className="text-[9px] text-gray-400 tracking-widest uppercase font-bold">UMLA Digital Passport</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {isStudent && (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/dashboard' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/journey"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/journey') ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                MASTAMA Journey
              </Link>
              <Link
                href="/missions"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/missions' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Misi & Tracker
              </Link>
              <Link
                href="/passport"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  pathname === '/passport' ? 'bg-umla-gold text-umla-navy-950 font-bold shadow-lg shadow-umla-gold/20' : 'text-umla-gold hover:bg-umla-gold/10'
                }`}
              >
                <Award className="w-4 h-4" />
                Passport Saya
              </Link>
            </>
          )}

          {isMentor && (
            <>
              <Link
                href="/mentor/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/mentor/dashboard' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard Pendamping
              </Link>
              <Link
                href="/mentor/approvals"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  pathname === '/mentor/approvals' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Approval Center
              </Link>
              <Link
                href="/mentor/members"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/mentor/members' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Kelompok Saya
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/admin/dashboard' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Admin Panel
              </Link>
              <Link
                href="/admin/groups"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/admin/groups' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                40 Kelompok
              </Link>
              <Link
                href="/admin/activities"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/admin/activities' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Kegiatan & Journey
              </Link>
              <Link
                href="/admin/reports"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/admin/reports' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Laporan & Export
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Stats, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Student Quick XP badge */}
              {isStudent && currentUser.studentProfile && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-umla-gold/10 border border-umla-gold/30">
                  <Sparkles className="w-4 h-4 text-umla-gold" />
                  <span className="text-xs font-bold text-umla-gold">{currentUser.studentProfile.totalXp} XP</span>
                  <div className="w-px h-3 bg-umla-gold/30" />
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span className="text-xs font-bold">{currentUser.studentProfile.streakCount}d</span>
                  </div>
                </div>
              )}

              {/* Notification Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-umla-gold animate-ping" />
                  )}
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-umla-gold" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel bg-umla-navy-900 border border-umla-gold/30 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-umla-gold" />
                        Notifikasi
                      </span>
                      <span className="text-xs text-umla-gold font-semibold">{notifications.length} Terkini</span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">Belum ada notifikasi baru.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-umla-gold/30 transition-colors"
                          >
                            <p className="text-xs font-bold text-white">{notif.title}</p>
                            <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                >
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-lg object-cover border border-umla-gold/30"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-white leading-tight">{currentUser.fullName}</p>
                    <p className="text-[10px] text-umla-gold capitalize">{currentUser.role.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-umla-navy-900 border border-umla-gold/30 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                    </div>

                    <Link
                      href={isStudent ? '/profile' : isMentor ? '/mentor/dashboard' : '/admin/dashboard'}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-200 hover:bg-white/10 transition-colors"
                    >
                      <User className="w-4 h-4 text-umla-gold" />
                      Profil Saya
                    </Link>

                    {isStudent && (
                      <Link
                        href="/history"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-200 hover:bg-white/10 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Riwayat Aktivitas
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-white hover:bg-white/5 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-umla-gold to-umla-gold-500 text-umla-navy-950 shadow-lg shadow-umla-gold/20 hover:scale-[1.02] transition-transform"
              >
                Buat Passport
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && currentUser && (
        <div className="md:hidden border-t border-white/10 bg-umla-navy-950 px-4 py-3 shadow-xl animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1.5">
            {isStudent && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/dashboard' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/journey"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname.startsWith('/journey') ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  MASTAMA Journey
                </Link>
                <Link
                  href="/missions"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/missions' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Misi & Tracker
                </Link>
                <Link
                  href="/passport"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    pathname === '/passport' ? 'bg-umla-gold text-umla-navy-950 font-bold shadow-lg shadow-umla-gold/20' : 'text-umla-gold hover:bg-umla-gold/10'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Passport Saya
                </Link>
              </>
            )}

            {isMentor && (
              <>
                <Link
                  href="/mentor/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/mentor/dashboard' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard Pendamping
                </Link>
                <Link
                  href="/mentor/approvals"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    pathname === '/mentor/approvals' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Approval Center
                </Link>
                <Link
                  href="/mentor/members"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/mentor/members' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Kelompok Saya
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/admin/dashboard' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Admin Panel
                </Link>
                <Link
                  href="/admin/groups"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/admin/groups' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  40 Kelompok
                </Link>
                <Link
                  href="/admin/activities"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/admin/activities' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Kegiatan & Journey
                </Link>
                <Link
                  href="/admin/reports"
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/admin/reports' ? 'bg-umla-gold/20 text-umla-gold border border-umla-gold/40' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Laporan & Export
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
