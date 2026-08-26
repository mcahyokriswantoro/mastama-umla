'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: params.token,
          password: password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mereset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel bg-umla-navy-950/95 rounded-3xl p-8 border-2 border-umla-gold/40 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white">Reset Password</h2>
          <p className="text-xs text-gray-300 mt-2">
            Silakan masukkan kata sandi baru Anda.
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p>Password berhasil diubah!<br/>Mengarahkan ke halaman login...</p>
            <Link href="/login" className="mt-2 text-umla-gold hover:underline text-xs font-bold">
              Klik di sini jika tidak diarahkan otomatis
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Password Baru</label>
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

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs glass-input"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-umla-gold via-umla-gold-500 to-yellow-500 text-umla-navy-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-umla-gold/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
