# Digital Student Passport - MASTAMA UMLA 2026 🎓

Sistem manajemen orientasi mahasiswa baru dan pembinaan lanjutan (Post-MASTAMA) Universitas Muhammadiyah Lamongan (UMLA). Aplikasi ini dibangun dengan arsitektur modern untuk mendukung pengalaman *gamification* interaktif dan pemantauan aktivitas mahasiswa secara komprehensif.

## ✨ Fitur Utama

### 📱 Untuk Mahasiswa (Peserta)
- **Digital Passport & Gamifikasi:** Sistem XP, *leveling*, dan koleksi lencana (badges) untuk setiap penyelesaian tugas.
- **QR Check-in:** Presensi real-time berbasis QR code untuk setiap sesi acara (Pembukaan, JASMOP, Baksos, dll).
- **Interactive Journey:** Garis waktu (timeline) kegiatan selama 6 hari masa orientasi.
- **AI Challenge (Think - Create - Impact):** Modul pengumpulan ide inovasi kampus cerdas dengan 3 tahapan (Ide, Eksekusi, Laporan).
- **Tracking 6 Bulan:** Pemantauan masa Post-MASTAMA untuk kehadiran spiritual (ibadah) dan partisipasi Ormawa/Magang.

### 🧑‍🏫 Untuk Mentor (Kakak Pendamping)
- **Dashboard Pemantauan:** Pantau langsung progres seluruh anggota kelompok (XP, presensi, tugas).
- **Approval System:** Fitur verifikasi dan penyetujuan laporan mahasiswa (termasuk AI Challenge) untuk mencairkan XP.
- **QR Scanner:** Kamera internal untuk me-scan QR code mahasiswa secara langsung di lapangan.

### 👑 Untuk Administrator
- **Executive Analytics:** Grafik persebaran fakultas, tingkat kehadiran, dan *bottleneck* persetujuan.
- **Manajemen Pengumuman:** Sistem pembuatan pengumuman, Juknis, dan tata tertib yang langsung muncul di dashboard mahasiswa.
- **Export Data:** Unduh rekapitulasi data lengkap ke dalam format Excel (.xlsx).
- **Audit Logs:** Pencatatan *real-time* untuk keamanan sistem.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) dengan Turbopack
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Database ORM:** Prisma
- **Database Engine:** SQLite (Dev)
- **Data Visualization:** Recharts

## 🚀 Cara Menjalankan (Development)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client & Database Push**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Jalankan Seeder (Data Awal)**
   ```bash
   node prisma/seed.js
   node prisma/seed_announcements.js
   ```

4. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

Aplikasi akan berjalan di `http://localhost:3000`.

## 🔑 Akun Demo (Seeder)

Gunakan akun berikut untuk mencoba alur sistem:
- **Admin:** `admin@umla.ac.id` / `Admin123!`
- **Mentor:** `mentor1@umla.ac.id` / `Admin123!` (Kelompok 01, 02, 03, 07)
- **Mahasiswa:** `student@umla.ac.id` / `Student123!` (Kelompok 07)

---
*© 2026 Universitas Muhammadiyah Lamongan. All rights reserved.*
