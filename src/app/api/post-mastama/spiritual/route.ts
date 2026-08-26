import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.studentProfile) {
      return NextResponse.json({ error: 'Data mahasiswa tidak ditemukan.' }, { status: 401 });
    }

    const participations = await prisma.spiritualParticipation.findMany({
      where: { studentId: user.studentProfile.id },
      orderBy: { slotIndex: 'asc' },
    });

    const completedCount = participations.filter((p) => p.status === 'COMPLETED').length;

    // Generate 24 default Dzuhur slots
    const slots = [];
    for (let i = 1; i <= 24; i++) {
      const existing = participations.find((p) => p.slotIndex === i);
      slots.push({
        id: existing?.id || null,
        slotIndex: i,
        name: `Dzuhur #${i < 10 ? '0' + i : i}`,
        date: existing?.date?.toISOString() || null,
        location: existing?.location || 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan',
        status: existing?.status || 'EMPTY',
        evidencePhoto: existing?.evidencePhoto || null,
        rejectionNote: existing?.rejectionNote || null,
      });
    }

    return NextResponse.json({
      targetCount: 24,
      completedCount,
      progressPercent: Math.round((completedCount / 24) * 100),
      slots,
    });
  } catch (error: any) {
    console.error('Error fetching spiritual data:', error);
    return NextResponse.json({ error: 'Gagal memuat data Spiritual Journey.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
      return NextResponse.json({ error: 'Hanya mahasiswa yang dapat check-in Dzuhur.' }, { status: 403 });
    }

    const { slotIndex, date, evidencePhoto, location } = await request.json();

    if (!slotIndex) {
      return NextResponse.json({ error: 'Nomor slot Dzuhur wajib dipilih.' }, { status: 400 });
    }

    const studentProfileId = user.studentProfile.id;

    // Submission will be UNDER_REVIEW until approved by Group Mentor (Kakak Pendamping)
    const participation = await prisma.spiritualParticipation.upsert({
      where: {
        studentId_slotIndex: {
          studentId: studentProfileId,
          slotIndex: parseInt(slotIndex),
        },
      },
      update: {
        date: date ? new Date(date) : new Date(),
        location: location || 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan',
        evidencePhoto: evidencePhoto || null,
        status: 'UNDER_REVIEW',
        rejectionNote: null,
        updatedAt: new Date(),
      },
      create: {
        studentId: studentProfileId,
        slotIndex: parseInt(slotIndex),
        date: date ? new Date(date) : new Date(),
        location: location || 'Masjid Ki Bagus Hadikusumo Universitas Muhammadiyah Lamongan',
        evidencePhoto: evidencePhoto || null,
        status: 'UNDER_REVIEW',
      },
    });

    // Notify mentors of this student's group
    const studentGroupId = user.studentProfile.group?.id;
    if (studentGroupId) {
      const mentorAssignments = await prisma.groupMentorAssignment.findMany({
        where: { groupId: studentGroupId },
        include: { mentor: true },
      });

      for (const assignment of mentorAssignments) {
        await prisma.notification.create({
          data: {
            userId: assignment.mentorId,
            title: `🕌 Presensi Dzuhur #${slotIndex} Baru Perlu Approval`,
            message: `${user.fullName} (${user.studentProfile.group?.name || 'Kelompok'}) telah mengunggah bukti Sholat Dzuhur Berjamaah #${slotIndex}.`,
            type: 'ACTION_REQUIRED',
            linkUrl: '/mentor/approvals',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bukti Presensi Sholat Dzuhur #${slotIndex} berhasil dikirim! Menunggu validasi Kakak Pendamping.`,
      participation,
    });
  } catch (error: any) {
    console.error('Error submitting spiritual journey:', error);
    return NextResponse.json({ error: 'Gagal mencatat presensi Dzuhur.' }, { status: 500 });
  }
}
