const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed for MASTAMA UMLA with exact official schedule...');

  // 1. Clean existing data
  await prisma.activitySubmission.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.ormawaParticipation.deleteMany();
  await prisma.spiritualParticipation.deleteMany();
  await prisma.aiProject.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.xpTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.groupMentorAssignment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  await prisma.studyProgram.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.mastamaYear.deleteMany();

  // 2. Create Active Mastama Year
  const year2026 = await prisma.mastamaYear.create({
    data: {
      year: 2026,
      name: 'MASTAMA UMLA 2026',
      isActive: true,
      groupAssignMode: 'STUDENT_SELECT',
    },
  });

  // 3. Exact 3 Official UMLA Faculties
  const fikes = await prisma.faculty.create({
    data: {
      code: 'FIKES',
      name: 'Fakultas Ilmu Kesehatan',
      icon: 'HeartPulse',
    },
  });

  const feb = await prisma.faculty.create({
    data: {
      code: 'FEB',
      name: 'Fakultas Ekonomi dan Bisnis',
      icon: 'TrendingUp',
    },
  });

  const fstp = await prisma.faculty.create({
    data: {
      code: 'FSTP',
      name: 'Fakultas Sains, Teknologi dan Pendidikan',
      icon: 'Cpu',
    },
  });

  // 4. Create Official UMLA Study Programs
  const prodis = [
    // FIKES
    { code: 'D3_FIS', name: 'Fisioterapi (D3)', degree: 'D3', facultyId: fikes.id },
    { code: 'D3_FAR', name: 'Farmasi (D3)', degree: 'D3', facultyId: fikes.id },
    { code: 'D3_KEB', name: 'Kebidanan (D3)', degree: 'D3', facultyId: fikes.id },
    { code: 'S1_KEP', name: 'Keperawatan (S1)', degree: 'S1', facultyId: fikes.id },
    { code: 'S1_FAR', name: 'Farmasi (S1)', degree: 'S1', facultyId: fikes.id },
    { code: 'S1_ARS', name: 'Administrasi Rumah Sakit (S1)', degree: 'S1', facultyId: fikes.id },
    { code: 'S1_KEB', name: 'Kebidanan (S1)', degree: 'S1', facultyId: fikes.id },
    { code: 'S1_K3', name: 'Keselamatan dan Kesehatan Kerja (K3) (S1)', degree: 'S1', facultyId: fikes.id },
    { code: 'S1_IFM', name: 'Informatika Medis (S1)', degree: 'S1', facultyId: fikes.id },

    // FEB
    { code: 'S1_AKT', name: 'Akuntansi (S1)', degree: 'S1', facultyId: feb.id },
    { code: 'S1_MNJ', name: 'Manajemen (S1)', degree: 'S1', facultyId: feb.id },
    { code: 'S1_EKS', name: 'Ekonomi Syariah (S1)', degree: 'S1', facultyId: feb.id },
    { code: 'S1_KWU', name: 'Kewirausahaan (S1)', degree: 'S1', facultyId: feb.id },
    { code: 'S1_BDG', name: 'Bisnis Digital (S1)', degree: 'S1', facultyId: feb.id },

    // FSTP
    { code: 'S1_TKM', name: 'Teknik Komputer (S1)', degree: 'S1', facultyId: fstp.id },
    { code: 'S1_TIN', name: 'Teknik Industri (S1)', degree: 'S1', facultyId: fstp.id },
    { code: 'S1_TSP', name: 'Teknik Sipil (S1)', degree: 'S1', facultyId: fstp.id },
    { code: 'S1_BIO', name: 'Biologi (S1)', degree: 'S1', facultyId: fstp.id },
    { code: 'S1_FIS', name: 'Fisika (S1)', degree: 'S1', facultyId: fstp.id },
    { code: 'S1_PGSD', name: 'Pendidikan Guru Sekolah Dasar (PGSD) (S1)', degree: 'S1', facultyId: fstp.id },
  ];

  const createdProdis = [];
  for (const p of prodis) {
    const cp = await prisma.studyProgram.create({ data: p });
    createdProdis.push(cp);
  }

  // 5. Create 40 Groups (Kelompok 01 - Kelompok 40)
  const groups = [];
  for (let i = 1; i <= 40; i++) {
    const name = `Kelompok ${i < 10 ? '0' + i : i}`;
    const g = await prisma.group.create({
      data: {
        mastamaYearId: year2026.id,
        number: i,
        name,
        capacity: 30,
        status: 'OPEN',
      },
    });
    groups.push(g);
  }

  // 6. Base Users & Passwords
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@umla.ac.id',
      passwordHash,
      fullName: 'Super Admin UMLA',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Mentors
  const mentor1 = await prisma.user.create({
    data: {
      email: 'mentor1@umla.ac.id',
      passwordHash,
      fullName: 'Budi Santoso, S.Kom.',
      role: 'GROUP_MENTOR',
      phoneNumber: '081234567890',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Assign mentor1 to Groups 01, 02, 03, 07
  for (let i = 0; i < 3; i++) {
    await prisma.groupMentorAssignment.create({
      data: {
        mentorId: mentor1.id,
        groupId: groups[i].id,
      },
    });
  }
  await prisma.groupMentorAssignment.create({
    data: {
      mentorId: mentor1.id,
      groupId: groups[6].id, // Kelompok 07
    },
  });

  // Demo Student: Ahmad Fauzan
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@umla.ac.id',
      passwordHash: studentPasswordHash,
      fullName: 'Ahmad Fauzan',
      role: 'STUDENT',
      phoneNumber: '085712345678',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    },
  });

  const demoProdi = createdProdis.find(p => p.code === 'S1_TKM') || createdProdis[0];
  const demoStudentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      nim: '240101001',
      facultyId: fstp.id,
      studyProgramId: demoProdi.id,
      mastamaYearId: year2026.id,
      groupId: groups[6].id, // Kelompok 07
      totalXp: 0,
      streakCount: 0,
    },
  });

  // 7. EXACT OFFICIAL SCHEDULE DEFINITION ACCORDING TO OFFICIAL RUNDOWN
  const journeysData = [
    {
      code: 'JOURNEY_01',
      title: '28 AGUSTUS 2026',
      subtitle: 'Pra Mastama dan Pembekalan Teknis',
      targetDate: new Date('2026-08-28T08:00:00Z'),
      mode: 'ONLINE',
      location: 'Ruangan Rapat Lantai 1 (Online Zoom)',
      orderNum: 1,
      icon: 'Compass',
      missions: [
        {
          code: 'MIS_PRA_01',
          title: 'Pra Mastama & Pembekalan',
          description: 'Sosialisasi teknis, pengenalan platform Digital Passport dan pengarahan Masta Fakultas/Prodi.',
          category: 'MASTAMA',
          targetCount: 1,
          xpReward: 50,
          activities: [
            {
              code: 'ACT_01',
              title: 'Pra Mastama dan Pembekalan (Online Zoom)',
              subtitle: 'Pembukaan, Sambutan Warek 3, Juknis & Breakout Room Fakultas/Prodi',
              description: 'Sesi pembekalan online via Zoom: sambutan Ketua Panitia (Bapak Suyitno, S.E., M.M), Warek 3 (Dr. H. Alifin, SKM., M.Kes), pemaparan Juknis oleh Dinda & Julia, serta Breakout Room Fakultas (FIKES, FEB, FSTP) & Prodi.',
              date: new Date('2026-08-28T08:00:00Z'),
              startTime: '08:00',
              endTime: '12:00',
              location: 'Online Zoom (Ruang Rapat Lantai 1)',
              mode: 'ONLINE',
              onlineUrl: 'https://zoom.us/j/umla-mastama-2026',
              picName: 'Dinda & Julia, Panitia Masta Fakultas',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
            },
          ]
        }
      ]
    },
    {
      code: 'JOURNEY_02',
      title: '29 AGUSTUS 2026',
      subtitle: 'Penugasan Mandiri Mahasiswa Baru',
      targetDate: new Date('2026-08-29T08:00:00Z'),
      mode: 'ONLINE',
      location: 'Rumah Masing-Masing & Media Sosial',
      orderNum: 2,
      icon: 'FileText',
      missions: [
        {
          code: 'MIS_PRA_02',
          title: 'Penugasan Mandiri 1',
          description: 'Penyelesaian penugasan mandiri pembuatan video perkenalan diri dan twibbon resmi.',
          category: 'MASTAMA',
          targetCount: 1,
          xpReward: 50,
          activities: [
            {
              code: 'ACT_02',
              title: 'Penugasan Mandiri Mahasiswa Baru',
              subtitle: 'Pengerjaan mandiri video perkenalan diri & twibbon resmi',
              description: 'Maba bekerja mandiri di rumah masing-masing: unggah bukti link & tangkapan layar video perkenalan diri dan twibbon resmi #MASTAMAUMLA2026 #BanggaUMLA.',
              date: new Date('2026-08-29T08:00:00Z'),
              startTime: '08:00',
              endTime: '16:00',
              location: 'Rumah Masing-Masing & Media Sosial',
              mode: 'ONLINE',
              picName: 'Panitia Sie Humas',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
            }
          ]
        }
      ]
    },
    {
      code: 'JOURNEY_03',
      title: '31 AGUSTUS 2026',
      subtitle: 'Grand Opening MASTAMA, Bincang Rektor, Know Your UMLA, AI Literacy & AIK',
      targetDate: new Date('2026-08-31T06:00:00Z'),
      mode: 'OFFLINE',
      location: 'DOME UMLA',
      orderNum: 3,
      icon: 'Sparkles',
      missions: [
        {
          code: 'MIS_DAY1_01',
          title: 'Rangkaian Hari ke-1 di DOME UMLA',
          description: 'Mengikuti seluruh sesi stadium general, pembukaan resmi, wawasan kampus, literasi AI dan AIK.',
          category: 'MASTAMA',
          targetCount: 7,
          xpReward: 325,
          activities: [
            {
              code: 'ACT_03',
              title: 'Registrasi, Check-in & Baksos Hari 1',
              subtitle: 'Unggah foto bukti kehadiran di gate masuk DOME UMLA',
              description: 'Peserta check-in melalui aplikasi MASTAMA di Gate Utama DOME UMLA, validasi oleh kakak pendamping, verifikasi penugasan dan pengumpulan dana Baksos Korban NTT Rp 100.000.',
              date: new Date('2026-08-31T06:00:00Z'),
              startTime: '06:00',
              endTime: '06:30',
              location: 'Gate Utama DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Panitia + Kakak Pendamping',
              verificationType: 'PHOTO_DESC',
              xpReward: 25,
              bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_04',
              title: 'Grand Opening Ceremony MASTAMA UMLA 2026',
              subtitle: 'Parade Bendera, Sambutan Rektor, UKM Seni & Pengukuhan Jas Almamater',
              description: 'Prosesi pembukaan resmi di DOME UMLA: Safety Briefing Bu Fatin, Parade Bendera (UKM Menwa Pak Ferdian), Lagu Kebangsaan & Mars (Paduan Suara Bu Sulis), Iftitah BPH, Sambutan PDM, Video Diktisaintek & Video Prestasi, Welcome Message & Amanat Student Journey Rektor (Prof. Dr. Abdul Aziz Alimul Hidayat, S.Kep., Ns., M.Kes), Call & Response, Anthem, UKM Seni Budaya, Pengukuhan Maba & Penyematan Jas Almamater, Janji Mahasiswa, Parade Pimpinan & Orasi Presbem (Hafidh).',
              date: new Date('2026-08-31T07:15:00Z'),
              startTime: '07:15',
              endTime: '09:45',
              location: 'Panggung Utama DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Prof. Dr. Abdul Aziz Alimul Hidayat & Panitia',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_05',
              title: 'Bincang Santai Rektor: Kenal UMLA, Kenal Dirimu',
              subtitle: 'Talkshow interaktif inspirasi transformasi mahasiswa masa depan',
              description: 'Sesi bincang santai dan inspirasi kepemimpinan mahasiswa bersama Bapak Rektor Prof. Dr. Abdul Aziz Alimul Hidayat, S.Kep., Ns., M.Kes. dipandu Bu Masunatul.',
              date: new Date('2026-08-31T09:50:00Z'),
              startTime: '09:50',
              endTime: '10:30',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Prof. Dr. Abdul Aziz Alimul Hidayat & Bu Masunatul',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_06',
              title: 'Know Your UMLA – BAAK & BAK',
              subtitle: 'Pengenalan sistem akademik, administrasi & layanan kemahasiswaan',
              description: 'Eksplorasi layanan akademik BAAK dan pembinaan mahasiswa BAK oleh Dr. Abdul Majid & Dr. Suryani Yuli Astuti, S.E., M.M (MC: Dinda).',
              date: new Date('2026-08-31T10:30:00Z'),
              startTime: '10:30',
              endTime: '11:15',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Dr. Abdul Majid & Dr. Suryani Yuli Astuti, S.E., M.M',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_07',
              title: 'AI & Mahasiswa: Bijak Menggunakan AI',
              subtitle: 'Materi etika, prompt engineering & pemanfaatan AI untuk studi',
              description: 'Pemaparan literasi kecerdasan buatan oleh Pemateri Bapak Dirham Akbar Aksara, S.T., B.Eng., M.Sc. (Wakil Bupati Lamongan) dipandu Moderator Abida. Penekanan: AI sebagai alat bantu berpikir, bukan pengganti berpikir.',
              date: new Date('2026-08-31T13:00:00Z'),
              startTime: '13:00',
              endTime: '14:00',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Bapak Dirham Akbar Aksara, S.T., B.Eng., M.Sc. & Abida',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_08',
              title: 'AI Challenge: Think – Create – Impact',
              subtitle: 'Sosialisasi proyek inovasi AI mahasiswa & kickoff tantangan 6 bulan',
              description: 'Mahasiswa diberikan permasalahan kampus/masyarakat, menggunakan AI untuk mencari solusi nyata, dan mempresentasikan hasil ide awal bersama Dinda & Panitia.',
              date: new Date('2026-08-31T14:00:00Z'),
              startTime: '14:00',
              endTime: '14:45',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Dinda & Panitia AI Challenge',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_09',
              title: 'My Values, My Campus, My Responsibility (AIK)',
              subtitle: 'Penanaman nilai Al-Islam & Kemuhammadiyahan serta sosialisasi JASMOP',
              description: 'Pedoman mahasiswa PTMA melalui kasus & refleksi oleh Ust. Teguh, dilanjutkan pengumuman dan latihan JASMOP Unity Challenge bersama Panitia & Hafidh Presbem.',
              date: new Date('2026-08-31T15:20:00Z'),
              startTime: '15:20',
              endTime: '17:00',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Ust. Teguh & Hafidh Presbem',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
            }
          ]
        }
      ]
    },
    {
      code: 'JOURNEY_04',
      title: '01 SEPTEMBER 2026',
      subtitle: 'MASTAMA Fakultas, MASTAMA Prodi, Pengenalan ORMAWA & Literasi Keuangan',
      targetDate: new Date('2026-09-01T06:00:00Z'),
      mode: 'OFFLINE',
      location: 'Gedung Fakultas & DOME UMLA',
      orderNum: 4,
      icon: 'Building2',
      missions: [
        {
          code: 'MIS_DAY2_01',
          title: 'Eksplorasi Fakultas, Prodi & ORMAWA',
          description: 'Mengenal civitas akademika fakultas, kurikulum prodi, organisasi mahasiswa kampus dan literasi keuangan.',
          category: 'MASTAMA',
          targetCount: 5,
          xpReward: 225,
          activities: [
            {
              code: 'ACT_10',
              title: 'Registrasi & Check-in Peserta di Fakultas',
              subtitle: 'Unggah foto bukti kehadiran di fakultas masing-masing',
              description: 'Presensi kehadiran pagi hari ke-2 di lokasi fakultas masing-masing (FIK di DOME, FSTP di Aula Budi Utomo, FEB di Lantai 10) divalidasi oleh panitia.',
              date: new Date('2026-09-01T06:00:00Z'),
              startTime: '06:00',
              endTime: '06:15',
              location: 'Fakultas Masing-Masing (FIK: DOME, FSTP: Aula Budi Utomo, FEB: Lt. 10)',
              mode: 'OFFLINE',
              picName: 'Panitia Masta Fakultas',
              verificationType: 'PHOTO_DESC',
              xpReward: 25,
              bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_13',
              title: 'MASTAMA Fakultas & BEM Fakultas',
              subtitle: 'Pengenalan Dekanat, Dosen, Budaya & Organisasi Fakultas',
              description: 'Temu civitas akademika fakultas bersama Dekanat, BEM Fakultas, dan jajaran dosen pembimbing (FSTP: Pak Ferdian, Bu Fatin, Pak Sandi; FEB: P. Amrizal, Ust Teguh, Bu Sulis; FIK: Bu Dias, Bu Masunatul, Pak Cahyo).',
              date: new Date('2026-09-01T07:00:00Z'),
              startTime: '07:00',
              endTime: '09:00',
              location: 'Ruangan Fakultas (FIK di DOME, FSTP di Aula Budi Utomo, FEB di Lt. 10)',
              mode: 'OFFLINE',
              picName: 'Gubernur BEM & Tim Dosen Fakultas',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_14',
              title: 'MASTAMA Program Studi & HIMA',
              subtitle: 'Kunjungan lab, temu Kaprodi, dosen wali & himpunan mahasiswa',
              description: 'Pengenalan mendalam kurikulum program studi, laboratorium khusus, dosen pembimbing akademik, dan program kerja HIMA di ruang kelas masing-masing prodi.',
              date: new Date('2026-09-01T09:15:00Z'),
              startTime: '09:15',
              endTime: '11:30',
              location: 'Ruang Kuliah & Laboratorium Prodi Masing-Masing',
              mode: 'OFFLINE',
              picName: 'Kaprodi & Ketua HIMA',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_11',
              title: 'Pengenalan ORMAWA UMLA, BEM U, DPM & IMM',
              subtitle: 'Parade kepemimpinan mahasiswa & wahana eksplorasi organisasi',
              description: 'Presentasi program kerja unggulan lembaga legislatif, eksekutif kampus, dan ikatan mahasiswa oleh Hafidz (Presbem UMLA) dan P. Amrizal di DOME UMLA.',
              date: new Date('2026-09-01T13:30:00Z'),
              startTime: '13:30',
              endTime: '14:45',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Hafidz (Presbem UMLA) & P. Amrizal',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_24',
              title: 'Literasi Keuangan di Era Digital',
              subtitle: 'Edukasi pengelolaan finansial mahasiswa cerdas & bijak',
              description: 'Sesi wawasan manajemen keuangan mahasiswa, investasi aman, dan perlindungan finansial digital oleh Bu Dias dan Bu Fatin di DOME UMLA.',
              date: new Date('2026-09-01T15:30:00Z'),
              startTime: '15:30',
              endTime: '16:30',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Bu Dias & Bu Fatin',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            }
          ]
        }
      ]
    },
    {
      code: 'JOURNEY_05',
      title: '02 SEPTEMBER 2026',
      subtitle: 'JASMOP, Display UKM & Pensi, Fathul Qulub, UMLA BAND & Guest Star Adurusa',
      targetDate: new Date('2026-09-02T06:00:00Z'),
      mode: 'OFFLINE',
      location: 'Halaman DOME, DOME UMLA, Masjid Ki Bagus Hadikusumo & Menginap',
      orderNum: 5,
      icon: 'Flame',
      missions: [
        {
          code: 'MIS_DAY3_01',
          title: 'JASMOP, Pensi, Fathul Qulub & Guest Star',
          description: 'Outbound kepemimpinan, atraksi UKM, pentas kreasi seni, malam bina iman dan konser Guest Star Adurusa.',
          category: 'MASTAMA',
          targetCount: 7,
          xpReward: 350,
          activities: [
            {
              code: 'ACT_12',
              title: 'Registrasi & Check-in Peserta Hari 3',
              subtitle: 'Unggah foto bukti kehadiran pagi di Halaman DOME',
              description: 'Presensi kehadiran pagi hari ke-3 di Halaman DOME dan verifikasi kelengkapan penugasan outbound.',
              date: new Date('2026-09-02T06:00:00Z'),
              startTime: '06:00',
              endTime: '06:10',
              location: 'Halaman DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Panitia + Kakak Pendamping',
              verificationType: 'PHOTO_DESC',
              xpReward: 25,
              bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_15',
              title: 'JASMOP',
              subtitle: 'Outbound kebersamaan, teamwork dinamika kelompok & take video',
              description: 'Aktivitas ketangkasan kepemimpinan, kekompakan kelompok dan perekaman video formasi bersama Pubdekdok & Bu Sulis di Halaman DOME.',
              date: new Date('2026-09-02T06:45:00Z'),
              startTime: '06:45',
              endTime: '09:00',
              location: 'Halaman DOME & Area Terbuka Kampus UMLA',
              mode: 'OFFLINE',
              picName: 'Pubdekdok & Bu Sulis',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_16',
              title: 'Display & Expo UKM UMLA (Pilih 1 UKM)',
              subtitle: 'Parade atraksi UKM, pameran minat bakat & pendaftaran anggota',
              description: 'Mahasiswa baru menyaksikan pertunjukan unit kegiatan mahasiswa dan memilih 1 UKM peminatan bersama Panitia, Bu Dias & Bu Fatin.',
              date: new Date('2026-09-02T09:00:00Z'),
              startTime: '09:00',
              endTime: '11:00',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Panitia / Bu Dias dan Bu Fatin',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_25',
              title: 'Pentas Seni & Unjuk Bakat Setiap Kelompok',
              subtitle: 'Panggung ekspresi kreativitas musik, tari & drama maba',
              description: 'Penampilan kreasi seni setiap kelompok mahasiswa baru dipandu MC Tegar & Shaluna di panggung DOME UMLA.',
              date: new Date('2026-09-02T13:30:00Z'),
              startTime: '13:30',
              endTime: '17:00',
              location: 'Panggung DOME UMLA',
              mode: 'OFFLINE',
              picName: 'MC: Tegar & Shaluna',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_17',
              title: 'Sholat Maghrib & Isya Berjamaah Malam Bina Iman',
              subtitle: 'Ibadah berjamaah, kultum mahasiswa & santap malam',
              description: 'Sholat Maghrib berjamaah, kultum 1 mahasiswa, santap malam bersama, dan Sholat Isya berjamaah di Masjid Ki Bagus Hadikusumo UMLA.',
              date: new Date('2026-09-02T17:30:00Z'),
              startTime: '17:30',
              endTime: '19:00',
              location: 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan',
              mode: 'OFFLINE',
              picName: 'Ust Teguh, P. Amrizal, P. Ferdian, Nabil & Fatwa',
              verificationType: 'PHOTO_DESC',
              xpReward: 25,
              bannerImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_19',
              title: 'Tadabbur Al-Qur\'an & Kajian Buku Fathul Qulub',
              subtitle: 'Tilawah bersama 1 juz per kelompok & resume nilai Fathul Qulub',
              description: 'Tadabbur Al-Qur\'an bersama dan pengkajian intisari buku panduan karakter Fathul Qulub bersama Ust. Teguh & Instruktur IMM.',
              date: new Date('2026-09-02T19:00:00Z'),
              startTime: '19:00',
              endTime: '19:30',
              location: 'Masjid Ki Bagus Hadikusumo & DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Ust Teguh, P. Amrizal, P. Ferdian, Nabil & Fatwa',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: '/images/quran_fathul_qulub.jpg',
            },
            {
              code: 'ACT_26',
              title: 'UMLA BAND & Guest Star (Adurusa)',
              subtitle: 'Konser malam inaugurasi keakraban & Special Performance Guest Star Adurusa',
              description: 'Panggung spektakuler konser malam keakraban bersama penampilan UMLA Band dan bintang tamu spesial (Guest Star) Adurusa yang meriah di DOME UMLA.',
              date: new Date('2026-09-02T19:30:00Z'),
              startTime: '19:30',
              endTime: '22:00',
              location: 'Panggung Utama DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Abida & Dinda',
              verificationType: 'PHOTO_DESC',
              xpReward: 75,
              bannerImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
            }
          ]
        }
      ]
    },
    {
      code: 'JOURNEY_06',
      title: '03 SEPTEMBER 2026',
      subtitle: 'Qiyamul Lail, Sholat Subuh, Senam Pagi & Upacara Penutupan MASTAMA',
      targetDate: new Date('2026-09-03T03:00:00Z'),
      mode: 'OFFLINE',
      location: 'Masjid Ki Bagus Hadikusumo & DOME UMLA',
      orderNum: 6,
      icon: 'Award',
      missions: [
        {
          code: 'MIS_DAY4_01',
          title: 'Qiyamul Lail & Penutupan MASTAMA',
          description: 'Sholat malam, senam kebugaran, pembagian sarapan dan upacara penutupan resmi MASTAMA 2026.',
          category: 'MASTAMA',
          targetCount: 4,
          xpReward: 175,
          activities: [
            {
              code: 'ACT_20',
              title: 'Sholat Tahajud / Qiyamul Lail Bersama',
              subtitle: 'Munajat sepertiga malam terakhir di Masjid Ki Bagus Hadikusumo',
              description: 'Sholat tahajud dan doa bersama untuk keberkahan menempuh studi sarjana dan diploma di UMLA bersama Ustadz Teguh.',
              date: new Date('2026-09-03T03:00:00Z'),
              startTime: '03:00',
              endTime: '04:00',
              location: 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan',
              mode: 'OFFLINE',
              picName: 'Ustadz Teguh',
              verificationType: 'PHOTO_DESC',
              xpReward: 50,
              bannerImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_21',
              title: 'Sholat Subuh Berjamaah & Kultum Fajar',
              subtitle: 'Sholat Subuh berjamaah & siraman rohani fajar berkemajuan',
              description: 'Ibadah Subuh berjamaah dan mendengarkan tausiyah fajar pencerah jiwa di Masjid Ki Bagus Hadikusumo bersama Ustadz Teguh.',
              date: new Date('2026-09-03T04:00:00Z'),
              startTime: '04:00',
              endTime: '05:00',
              location: 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan',
              mode: 'OFFLINE',
              picName: 'Ustadz Teguh',
              verificationType: 'PHOTO_DESC',
              xpReward: 25,
              bannerImage: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_22',
              title: 'Senam Bersama Civitas UMLA & Sarapan Pagi',
              subtitle: 'Senam kebugaran jasmani depan Gedung A & sarapan pagi',
              description: 'Senam kebugaran jasmani bersama instruktur Miss Kiki di depan Gedung A / Halaman DOME, dilanjutkan pembagian sarapan pagi oleh panitia.',
              date: new Date('2026-09-03T06:00:00Z'),
              startTime: '06:00',
              endTime: '07:30',
              location: 'Depan Gedung A & Halaman DOME UMLA',
              mode: 'OFFLINE',
              picName: 'Miss Kiki & Panitia',
              verificationType: 'PHOTO_DESC',
              xpReward: 25,
              bannerImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
            },
            {
              code: 'ACT_23',
              title: 'Penutupan MASTAMA UMLA 2026',
              subtitle: 'Penganugerahan Mahasiswa Terbaik, Ikrar Maba & Penutupan',
              description: 'Upacara penutupan resmi MASTAMA UMLA 2026: pembukaan (MC: Tegar & Shaluna), Indonesia Raya, sambutan Presiden Mahasiswa, sambutan Rektor, penganugerahan mahasiswa & kelompok terbaik oleh Sahara, pesan kesan maba, doa penutup oleh Ust. Teguh, dan pengumuman.',
              date: new Date('2026-09-03T07:30:00Z'),
              startTime: '07:30',
              endTime: '11:30',
              location: 'DOME UMLA',
              mode: 'OFFLINE',
              picName: 'MC: Tegar & Shaluna, Sahara (Penghargaan), Ust. Teguh',
              verificationType: 'PHOTO_DESC',
              xpReward: 75,
              bannerImage: '/images/penutupan_mastama.jpg',
            }
          ]
        }
      ]
    }
  ];

  // Insert Journeys, Missions, and Activities
  for (const jData of journeysData) {
    const journey = await prisma.journey.create({
      data: {
        mastamaYearId: year2026.id,
        code: jData.code,
        title: jData.title,
        subtitle: jData.subtitle,
        targetDate: jData.targetDate,
        mode: jData.mode,
        location: jData.location,
        orderNum: jData.orderNum,
        icon: jData.icon,
      }
    });

    for (const mData of jData.missions) {
      const mission = await prisma.mission.create({
        data: {
          journeyId: journey.id,
          code: mData.code,
          title: mData.title,
          description: mData.description,
          category: mData.category,
          targetCount: mData.targetCount,
          xpReward: mData.xpReward,
        }
      });

      for (const aData of mData.activities) {
        await prisma.activity.create({
          data: {
            journeyId: journey.id,
            missionId: mission.id,
            code: aData.code,
            title: aData.title,
            subtitle: aData.subtitle,
            description: aData.description,
            date: aData.date,
            startTime: aData.startTime,
            endTime: aData.endTime,
            location: aData.location,
            mode: aData.mode,
            onlineUrl: aData.onlineUrl || null,
            picName: aData.picName,
            verificationType: aData.verificationType,
            xpReward: aData.xpReward,
            bannerImage: aData.bannerImage,
          }
        });
      }
    }
  }

  // 8. 8 Achievement Badges
  const badgesData = [
    {
      code: 'FIRST_STEP',
      name: 'First Step',
      description: 'Menyelesaikan aktivitas pertama pada rangkaian MASTAMA 2026.',
      icon: 'Award',
      category: 'JOURNEY',
      xpRequirement: 50,
      activityRequirement: 1,
      stampName: 'STAMP_FIRST_STEP',
    },
    {
      code: 'PRE_MASTAMA',
      name: 'Pioneer 2026',
      description: 'Lulus seluruh sesi Pra MASTAMA dan penugasan mandiri.',
      icon: 'Sparkles',
      category: 'JOURNEY',
      xpRequirement: 100,
      activityRequirement: 2,
      stampName: 'STAMP_PRE_MASTAMA',
    },
    {
      code: 'OPENING_HONOR',
      name: 'Opening Champion',
      description: 'Hadir dan menyelesaikan seluruh agenda Pembukaan di DOME UMLA.',
      icon: 'CheckCircle2',
      category: 'JOURNEY',
      xpRequirement: 425,
      activityRequirement: 9,
      stampName: 'STAMP_OPENING',
    },
    {
      code: 'MASTAMA_COMPLETED',
      name: 'MASTAMA Graduate',
      description: 'Menyelesaikan seluruh 23 agenda kegiatan resmi MASTAMA UMLA 2026.',
      icon: 'Award',
      category: 'JOURNEY',
      xpRequirement: 1000,
      activityRequirement: 23,
      stampName: 'STAMP_MASTAMA_COMPLETED',
    },
    {
      code: 'ORMAWA_EXPLORER',
      name: 'ORMAWA Explorer',
      description: 'Menyelesaikan 15x eksplorasi dan keikutsertaan kegiatan ORMAWA UMLA.',
      icon: 'Users',
      category: 'ORMAWA',
      xpRequirement: 750,
      activityRequirement: 15,
      stampName: 'STAMP_ORMAWA_15',
    },
    {
      code: 'SPIRITUAL_WARRIOR',
      name: 'Spiritual Champion',
      description: 'Menyelesaikan 24x Sholat Dzuhur Berjamaah di Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan.',
      icon: 'Sun',
      category: 'SPIRITUAL',
      xpRequirement: 600,
      activityRequirement: 24,
      stampName: 'STAMP_SPIRITUAL_24',
    },
    {
      code: 'AI_INNOVATOR',
      name: 'AI Challenge Innovator',
      description: 'Menuntaskan proyek inovasi AI Think-Create-Impact hingga tahap akhir.',
      icon: 'Cpu',
      category: 'AI_CHALLENGE',
      xpRequirement: 500,
      activityRequirement: 1,
      stampName: 'STAMP_AI_CHALLENGE',
    },
    {
      code: 'UMLA_EXPLORER',
      name: 'True UMLA Legend',
      description: 'Mencapai 100% tuntas seluruh MASTAMA, ORMAWA, Spiritual, dan AI Challenge.',
      icon: 'ShieldCheck',
      category: 'SPECIAL',
      xpRequirement: 2850,
      activityRequirement: 63,
      stampName: 'STAMP_UMLA_LEGEND',
    },
  ];

  for (const b of badgesData) {
    await prisma.badge.create({ data: b });
  }

  console.log('✅ Official Schedule Seed completed successfully with 23 activities!');
  console.log('--- DEMO CREDENTIALS ---');
  console.log('Admin:   admin@umla.ac.id   / Admin123!');
  console.log('Mentor:  mentor1@umla.ac.id / Admin123! (Budi Santoso - Kelompok 01, 02, 03, 07)');
  console.log('Student: student@umla.ac.id / Student123! (Ahmad Fauzan - NIM 240101001 - Kelompok 07)');
  console.log('------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
