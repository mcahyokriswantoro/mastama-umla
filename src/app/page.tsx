import Link from 'next/link';
import {
  Sparkles,
  Compass,
  Award,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Cpu,
  Flame,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-umla-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Hero Section */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Official UMLA & MASTAMA Logo Hero Banner */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          <img
            src="/logo-umla.png"
            alt="Universitas Muhammadiyah Lamongan"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
          />
          <div className="h-8 w-px bg-white/20" />
          <div className="flex items-center gap-2.5 bg-white/5 border border-umla-gold/30 rounded-2xl px-3 py-1.5 backdrop-blur-sm shadow-lg shadow-umla-gold/5">
            <img
              src="/logo-mastama.png"
              alt="Logo Maskot MASTAMA UMLA"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xl hover:scale-110 transition-transform duration-300"
            />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-umla-gold tracking-widest block leading-tight">Official Mascot</span>
              <span className="text-xs font-black text-white tracking-wide block">MASTAMA 2026</span>
            </div>
          </div>
        </div>

        {/* Event Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-umla-gold/15 border border-umla-gold/40 text-umla-gold text-xs font-black uppercase tracking-widest mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-umla-gold" />
          MASTAMA UMLA 2026
        </div>

        {/* Mascot Spotlight Card & Hero Title Layout */}
        <div className="relative my-4 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-umla-gold/30 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-70" />
            <div className="relative glass-panel bg-umla-navy-900/70 border border-umla-gold/30 rounded-3xl p-4 flex flex-col items-center max-w-[200px] shadow-2xl hover:scale-105 transition-transform duration-300">
              <img
                src="/logo-mastama.png"
                alt="Maskot MASTAMA UMLA"
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_10px_20px_rgba(212,175,55,0.35)]"
              />
              <span className="mt-2 text-[11px] font-black text-umla-gold uppercase tracking-wider text-center">
                Mascot MASTAMA
              </span>
              <span className="text-[9px] text-gray-300 text-center font-medium">
                Siap Temani Perjalananmu!
              </span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              DIGITAL STUDENT <br />
              <span className="text-gold-gradient">PASSPORT</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-2xl font-extrabold text-gray-200 mt-3 tracking-wide">
              Your Journey Starts Here.
            </p>

            {/* Short Concept Explanation (Requirement 8) */}
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mt-3 leading-relaxed font-medium">
              Digital Student Passport adalah passport digital perjalanan mahasiswa selama MASTAMA dan perjalanan selanjutnya sebagai mahasiswa Universitas Muhammadiyah Lamongan (UMLA).
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-umla-gold via-umla-gold-500 to-yellow-500 text-umla-navy-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-umla-gold/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            Daftar Passport Baru
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/20 hover:border-umla-gold/50 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Masuk ke Passport
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-16 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20 hover:border-umla-gold/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-umla-gold/20 text-umla-gold flex items-center justify-center mb-2.5 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">6 Rangkaian Timeline</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Pra MASTAMA hingga Penutupan di DOME UMLA.</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20 hover:border-umla-gold/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Digital Stamps</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Koleksi cap resmi tiap misi & aktivitas.</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20 hover:border-umla-gold/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">15× ORMAWA & 24× Dzuhur</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">15 kegiatan organisasi & 24 presensi sholat berjamaah.</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel bg-umla-navy-900/60 border border-umla-gold/20 hover:border-umla-gold/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">AI Challenge Project</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Think, create, and impact bersama tim AI.</p>
          </div>
        </div>

        {/* Demo Fast Access Link */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Ingin langsung mencoba tanpa mendaftar?{' '}
            <Link href="/login" className="text-umla-gold font-bold underline hover:text-yellow-300">
              Gunakan Akun Demo (Student / Mentor / Admin)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
