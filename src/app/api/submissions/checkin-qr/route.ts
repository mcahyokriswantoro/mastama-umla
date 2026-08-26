import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { awardXpAndCheckBadges } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
      return NextResponse.json(
        { error: 'Hanya mahasiswa yang dapat melakukan QR Check-in.' },
        { status: 403 }
      );
    }

    const { qrCode, activityId } = await request.json();

    if (!qrCode && !activityId) {
      return NextResponse.json({ error: 'Data QR tidak valid.' }, { status: 400 });
    }

    // Find activity either by ID or QR secret
    let activity = null;
    if (activityId) {
      activity = await prisma.activity.findUnique({
        where: { id: activityId },
      });
    } else if (qrCode) {
      activity = await prisma.activity.findFirst({
        where: { qrSecret: qrCode.trim() },
      });
    }

    if (!activity) {
      return NextResponse.json(
        { error: 'QR Code tidak valid atau aktivitas tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Check QR expiry if set
    if (activity.qrExpiresAt && new Date() > new Date(activity.qrExpiresAt)) {
      return NextResponse.json(
        { error: 'QR Code ini sudah kadaluarsa (expired).' },
        { status: 400 }
      );
    }

    const studentProfileId = user.studentProfile.id;

    // Check duplicate check-in
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_activityId: {
          studentId: studentProfileId,
          activityId: activity.id,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan check-in pada aktivitas ini sebelumnya.' },
        { status: 400 }
      );
    }

    // Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        studentId: studentProfileId,
        activityId: activity.id,
        checkInTime: new Date(),
        checkInMethod: 'QR_SCAN',
        status: 'PRESENT',
      },
    });

    // If verification type is QR, auto-complete and award XP
    let gamificationResult = null;
    const isAutoApprove = activity.verificationType === 'QR' || activity.verificationType === 'ONLINE';

    if (isAutoApprove) {
      await prisma.activitySubmission.upsert({
        where: {
          studentId_activityId: {
            studentId: studentProfileId,
            activityId: activity.id,
          },
        },
        update: {
          status: 'COMPLETED',
          description: 'Presensi terverifikasi melalui QR Check-in.',
          submissionDate: new Date(),
          submissionTime: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} WIB`,
        },
        create: {
          studentId: studentProfileId,
          activityId: activity.id,
          status: 'COMPLETED',
          activityTitle: activity.title,
          description: 'Presensi terverifikasi melalui QR Check-in.',
          submissionDate: new Date(),
          submissionTime: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} WIB`,
        },
      });

      // Award XP & trigger badges
      gamificationResult = await awardXpAndCheckBadges(
        studentProfileId,
        activity.xpReward,
        'ACTIVITY',
        activity.id,
        `QR Check-in: ${activity.title}`
      );
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'QR_CHECKIN',
        entityType: 'ATTENDANCE',
        entityId: attendance.id,
        details: `QR Check-in successful for ${activity.title} (+${activity.xpReward} XP)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: isAutoApprove
        ? `Presensi Berhasil! +${activity.xpReward} XP ditambahkan ke Digital Passport.`
        : 'Presensi QR tercatat! Silakan lengkapi upload bukti foto jika diwajibkan.',
      activityTitle: activity.title,
      xpEarned: isAutoApprove ? activity.xpReward : 0,
      newBadges: gamificationResult?.newlyUnlockedBadges || [],
      autoApproved: isAutoApprove,
    });
  } catch (error: any) {
    console.error('Error during QR check-in:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses QR Check-in.' },
      { status: 500 }
    );
  }
}
