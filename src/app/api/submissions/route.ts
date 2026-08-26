import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { awardXpAndCheckBadges } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
      return NextResponse.json(
        { error: 'Hanya mahasiswa yang dapat mengirimkan bukti aktivitas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      activityId,
      description,
      evidencePhoto,
      submissionTime,
      locationNote,
      extraNotes,
    } = body;

    if (!activityId) {
      return NextResponse.json({ error: 'ID Aktivitas wajib disertakan.' }, { status: 400 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        journey: true,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Aktivitas tidak ditemukan.' }, { status: 404 });
    }

    const studentProfileId = user.studentProfile.id;

    // Check if existing submission
    const existingSubmission = await prisma.activitySubmission.findUnique({
      where: {
        studentId_activityId: {
          studentId: studentProfileId,
          activityId,
        },
      },
    });

    if (existingSubmission && existingSubmission.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Aktivitas ini sudah selesai dan disetujui sebelumnya.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const formattedTime = submissionTime || `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

    const submission = await prisma.activitySubmission.upsert({
      where: {
        studentId_activityId: {
          studentId: studentProfileId,
          activityId,
        },
      },
      update: {
        status: 'UNDER_REVIEW',
        description: description || 'Menyerahkan bukti kehadiran/aktivitas.',
        evidencePhoto: evidencePhoto || null,
        submissionDate: now,
        submissionTime: formattedTime,
        locationNote: locationNote || activity.location,
        extraNotes: extraNotes || null,
        updatedAt: now,
      },
      create: {
        studentId: studentProfileId,
        activityId,
        status: 'UNDER_REVIEW',
        activityTitle: activity.title,
        description: description || 'Menyerahkan bukti kehadiran/aktivitas.',
        evidencePhoto: evidencePhoto || null,
        submissionDate: now,
        submissionTime: formattedTime,
        locationNote: locationNote || activity.location,
        extraNotes: extraNotes || null,
      },
    });

    // Notify Group Mentor if student has a group
    if (user.studentProfile.group?.id) {
      const mentorAssignments = await prisma.groupMentorAssignment.findMany({
        where: { groupId: user.studentProfile.group.id },
      });

      for (const assignment of mentorAssignments) {
        await prisma.notification.create({
          data: {
            userId: assignment.mentorId,
            title: `📥 Submission Masuk: ${user.fullName}`,
            message: `${user.fullName} (${user.studentProfile.group.name}) mengirimkan bukti kegiatan "${activity.title}".`,
            type: 'ACTION_REQUIRED',
            linkUrl: '/mentor/approvals',
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: existingSubmission ? 'ACTIVITY_RESUBMISSION' : 'ACTIVITY_SUBMISSION',
        entityType: 'ACTIVITY_SUBMISSION',
        entityId: submission.id,
        details: `Submission submitted for ${activity.title} by ${user.fullName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission berhasil dikirim dan sedang menunggu verifikasi pendamping.',
      submission,
    });
  } catch (error: any) {
    console.error('Error submitting activity:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mengirimkan submission aktivitas.' },
      { status: 500 }
    );
  }
}
