const { DatabaseSync } = require('node:sqlite');
const { randomBytes } = require('crypto');
const path = require('path');

function cuid() {
  return 'c' + randomBytes(12).toString('hex').slice(0, 24);
}

const dbPath = path.join(__dirname, 'dev.db');
const db = new DatabaseSync(dbPath);

// Find admin user
const admin = db.prepare("SELECT id FROM User WHERE role = 'ADMIN' LIMIT 1").get();
if (!admin) {
  console.error('No admin user found!');
  process.exit(1);
}

console.log('Found admin:', admin.id);

// Clean existing
db.prepare("DELETE FROM Announcement").run();

const now = new Date().toISOString();

const insert = db.prepare(`
  INSERT INTO Announcement (id, title, content, category, fileUrl, fileName, isPinned, isActive, authorId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const announcements = [
  [cuid(), 'Petunjuk Teknis (Juknis) MASTAMA UMLA 2026',
   "Berikut adalah Petunjuk Teknis pelaksanaan Masa Ta'aruf Mahasiswa (MASTAMA) UMLA 2026. Dokumen ini berisi panduan lengkap jadwal, aturan berpakaian, perlengkapan yang harus dibawa, dan mekanisme kegiatan. WAJIB dibaca oleh seluruh mahasiswa baru.",
   'JUKNIS', 'https://drive.google.com/file/d/example-juknis/view', 'Juknis_MASTAMA_UMLA_2026.pdf', 1, 1, admin.id, now, now],

  [cuid(), 'Tata Tertib Peserta MASTAMA UMLA 2026',
   'Seluruh peserta MASTAMA UMLA 2026 WAJIB mematuhi tata tertib yang berlaku selama rangkaian kegiatan berlangsung. Pelanggaran akan ditindak sesuai ketentuan panitia. Poin penting: (1) Hadir tepat waktu, (2) Berpakaian sopan dan rapi sesuai ketentuan, (3) Tidak membawa barang terlarang, (4) Menjaga kebersihan dan ketertiban.',
   'TATA_TERTIB', 'https://drive.google.com/file/d/example-tatib/view', 'Tata_Tertib_MASTAMA_2026.pdf', 1, 1, admin.id, now, now],

  [cuid(), 'Selamat Datang Mahasiswa Baru UMLA 2026!',
   "Assalamu'alaikum Wr. Wb. Selamat bergabung di keluarga besar Universitas Muhammadiyah Lamongan! Persiapkan diri Anda untuk mengikuti seluruh rangkaian MASTAMA 2026 mulai 28 Agustus hingga 3 September 2026. Pastikan Anda telah mengunduh aplikasi Digital Student Passport dan melengkapi profil.",
   'PENGUMUMAN', null, null, 0, 1, admin.id, now, now],

  [cuid(), 'Panduan Penggunaan Aplikasi Digital Student Passport',
   'Aplikasi Digital Student Passport adalah platform resmi MASTAMA UMLA 2026 untuk presensi kehadiran, pengumpulan tugas, tracking journey, dan pengumpulan stamp digital. Pastikan Anda login menggunakan akun yang telah didaftarkan oleh panitia.',
   'DOKUMEN', 'https://drive.google.com/file/d/example-panduan-app/view', 'Panduan_App_Digital_Passport.pdf', 0, 1, admin.id, now, now],

  [cuid(), 'Informasi Baksos & Donasi Korban NTT',
   'Seluruh peserta MASTAMA UMLA 2026 diharapkan membawa donasi sebesar Rp 100.000 untuk korban bencana NTT. Donasi dikumpulkan pada hari pertama kegiatan offline (31 Agustus 2026) saat sesi Registrasi & Check-in di DOME UMLA.',
   'INFO', null, null, 0, 1, admin.id, now, now],
];

for (const a of announcements) {
  insert.run(...a);
}

console.log(`✅ Seeded ${announcements.length} announcements successfully!`);
db.close();
