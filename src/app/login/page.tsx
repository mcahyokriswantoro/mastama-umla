'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Users,
  Shield,
  HelpCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk ke sistem.');
      }

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'GROUP_MENTOR') {
        router.push('/mentor/approvals');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }
      
      setForgotSubmitted(true);
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel bg-umla-navy-950/95 rounded-3xl p-8 border-2 border-umla-gold/40 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img
              src="/logo-umla.png"
              alt="Logo Universitas Muhammadiyah Lamongan"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-md"
            />
          </div>
          <span className="block text-[11px] font-black uppercase tracking-widest text-umla-gold">
            DIGITAL STUDENT PASSPORT
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Masuk ke Passport Anda</h2>
          <p className="text-xs text-gray-300 mt-1">
            Universitas Muhammadiyah Lamongan • MASTAMA
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Email Terdaftar</label>
            <div className="relative">
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-gray-300">Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotSubmitted(false);
                  setForgotEmail(email);
                }}
                className="text-[10px] font-bold text-umla-gold hover:text-yellow-300 hover:underline transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs glass-input"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-umla-gold via-umla-gold-500 to-yellow-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-umla-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Masuk ke Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Belum memiliki passport?{' '}
          <Link href="/register" className="text-umla-gold font-bold underline hover:text-yellow-300">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md glass-panel bg-umla-navy-950 rounded-3xl p-6 border-2 border-umla-gold/40 shadow-2xl">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-umla-gold/20 text-umla-gold flex items-center justify-center mb-4 border border-umla-gold/30">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white mb-1">Pemulihan Akun / Lupa Password</h3>
            <p className="text-xs text-gray-300 mb-4">
              Masukkan email yang terdaftar pada Digital Student Passport MASTAMA UMLA untuk menerima petunjuk reset password.
            </p>

            {forgotSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Permintaan Reset Terkirim!
                </div>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  Tautan pemulihan kata sandi telah dikirim ke <span className="font-bold text-white">{forgotEmail}</span>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl bg-umla-gold text-umla-navy-950 font-black text-xs uppercase tracking-wider mt-2"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Email Akun</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs glass-input"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <p>{forgotError}</p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 space-y-1.5">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-umla-gold" />
                    Bantuan Cepat Pendamping:
                  </p>
                  <p className="text-gray-400">
                    Mahasiswa juga dapat meminta reset kredensial langsung kepada Pendamping Kelompok masing-masing.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold hover:bg-white/20 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-umla-gold hover:bg-yellow-400 text-umla-navy-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center"
                  >
                    {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Kirim Tautan Reset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
