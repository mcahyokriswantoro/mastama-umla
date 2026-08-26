import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { awardXpAndCheckBadges } from '@/lib/gamification';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.studentProfile) {
      return NextResponse.json({ error: 'Data mahasiswa tidak ditemukan.' }, { status: 401 });
    }

    const participations = await prisma.ormawaParticipation.findMany({
      where: { studentId: user.studentProfile.id },
      orderBy: { activityIndex: 'asc' },
    });

    const completedCount = participations.filter((p) => p.status === 'COMPLETED').length;

    // Generate 15 default slots
    const slots = [];
    for (let i = 1; i <= 15; i++) {
      const existing = participations.find((p) => p.activityIndex === i);
      slots.push({
        index: i,
        title: existing?.title || `Aktivitas ORMAWA #${i < 10 ? '0' + i : i}`,
        ormawaName: existing?.ormawaName || null,
        date: existing?.date?.toISOString() || null,
        status: existing?.status || 'EMPTY',
        description: existing?.description || null,
        evidencePhoto: existing?.evidencePhoto || null,
        rejectionNote: existing?.rejectionNote || null,
      });
    }

    return NextResponse.json({
      targetCount: 15,
      completedCount,
      progressPercent: Math.round((completedCount / 15) * 100),
      slots,
    });
  } catch (error: any) {
    console.error('Error fetching ORMAWA data:', error);
    return NextResponse.json({ error: 'Gagal memuat data ORMAWA.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
      return NextResponse.json({ error: 'Hanya mahasiswa yang dapat submit ORMAWA.' }, { status: 403 });
    }

    const { activityIndex, title, ormawaName, date, description, evidencePhoto } = await request.json();

    if (!activityIndex || !title || !ormawaName) {
      return NextResponse.json({ error: 'Judul kegiatan dan nama ORMAWA wajib diisi.' }, { status: 400 });
    }

    const studentProfileId = user.studentProfile.id;

    const participation = await prisma.ormawaParticipation.upsert({
      where: {
        studentId_activityIndex: {
          studentId: studentProfileId,
          activityIndex: parseInt(activityIndex),
        },
      },
      update: {
        title,
        ormawaName,
        date: date ? new Date(date) : new Date(),
        description: description || '',
        evidencePhoto: evidencePhoto || null,
        status: 'COMPLETED', // Auto or mentor verified
        updatedAt: new Date(),
      },
      create: {
        studentId: studentProfileId,
        activityIndex: parseInt(activityIndex),
        title,
        ormawaName,
        date: date ? new Date(date) : new Date(),
        description: description || '',
        evidencePhoto: evidencePhoto || null,
        status: 'COMPLETED',
      },
    });

    // Award XP (+50 XP per ORMAWA) and check ORMAWA Explorer badge
    const gamification = await awardXpAndCheckBadges(
      studentProfileId,
      50,
      'ORMAWA',
      participation.id,
      `Mengikuti Kegiatan ORMAWA #${activityIndex}: ${title}`
    );

    return NextResponse.json({
      success: true,
      message: `Aktivitas ORMAWA #${activityIndex} berhasil dicatat! (+50 XP)`,
      participation,
      gamification,
    });
  } catch (error: any) {
    console.error('Error submitting ORMAWA:', error);
    return NextResponse.json({ error: 'Gagal menyimpan kegiatan ORMAWA.' }, { status: 500 });
  }
}
