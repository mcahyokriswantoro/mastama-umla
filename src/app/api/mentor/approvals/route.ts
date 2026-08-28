import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { awardXpAndCheckBadges } from '@/lib/gamification';

// GET: List all pending submissions for mentor's assigned groups (MASTAMA, Dzuhur, ORMAWA)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'GROUP_MENTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Akses ditolak. Khusus Pendamping dan Admin.' },
        { status: 403 }
      );
    }

    let assignedGroupIds: string[] = [];

    if (user.role === 'GROUP_MENTOR') {
      const assignments = await prisma.groupMentorAssignment.findMany({
        where: { mentorId: user.id },
      });
      assignedGroupIds = assignments.map((a) => a.groupId);
    }

    const studentFilter: any = {};
    if (user.role === 'GROUP_MENTOR') {
      studentFilter.groupId = { in: assignedGroupIds };
    }

    // 1. Regular Activity Submissions
    const submissions = await prisma.activitySubmission.findMany({
      where: { student: studentFilter, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: {
        activity: {
          include: {
            journey: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                avatarUrl: true,
                phoneNumber: true,
              },
            },
            group: true,
            faculty: true,
            studyProgram: true,
          },
        },
        approvals: {
          include: {
            reviewer: {
              select: { fullName: true, role: true },
            },
          },
          orderBy: { reviewedAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const historySubmissionsRaw = await prisma.activitySubmission.findMany({
      where: { student: studentFilter, status: { in: ['COMPLETED', 'REJECTED', 'APPROVED'] } },
      include: {
        activity: {
          include: {
            journey: true,
          },
        },
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true,
            faculty: true,
            studyProgram: true,
          },
        },
        approvals: {
          include: { reviewer: { select: { fullName: true, role: true } } },
          orderBy: { reviewedAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    });

    // 2. Spiritual Dzuhur Submissions
    const spiritualSubmissions = await prisma.spiritualParticipation.findMany({
      where: {
        student: studentFilter,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true, faculty: true, studyProgram: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const historySpiritualRaw = await prisma.spiritualParticipation.findMany({
      where: {
        student: studentFilter,
        status: { in: ['COMPLETED', 'REJECTED', 'APPROVED'] }
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true, faculty: true, studyProgram: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });



    // 3. ORMAWA Submissions
    const ormawaSubmissions = await prisma.ormawaParticipation.findMany({
      where: {
        student: studentFilter,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true, faculty: true, studyProgram: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const historyOrmawaRaw = await prisma.ormawaParticipation.findMany({
      where: {
        student: studentFilter,
        status: { in: ['COMPLETED', 'REJECTED', 'APPROVED'] }
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true, faculty: true, studyProgram: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });



    // 4. AI Challenge Submissions
    const aiSubmissions = await prisma.aiProject.findMany({
      where: {
        student: studentFilter,
        stage: 'LAPORAN',
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true, faculty: true, studyProgram: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const historyAiRaw = await prisma.aiProject.findMany({
      where: {
        student: studentFilter,
        stage: 'COMPLETED',
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true, phoneNumber: true } },
            group: true, faculty: true, studyProgram: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    const formattedAi = [...aiSubmissions, ...historyAiRaw].map((ai) => ({
      id: ai.id,
      type: 'AI_PROJECT',
      title: `AI Challenge: ${ai.title}`,
      category: 'AI Think-Create-Impact',
      student: ai.student,
      submittedAt: ai.updatedAt || ai.createdAt,
      status: ai.stage === 'COMPLETED' ? 'COMPLETED' : (ai.mentorFeedback ? 'REJECTED' : 'UNDER_REVIEW'),
      evidencePhoto: null,
      proposalUrl: ai.proposalUrl,
      demoUrl: ai.demoUrl,
      repoUrl: ai.repoUrl,
      videoUrl: ai.videoUrl,
      description: `[Tim ${ai.teamName}] ${ai.description}`,
      xpReward: 150,
      feedback: ai.mentorFeedback,
    }));

    const formattedMastama = [...submissions, ...historySubmissionsRaw].map((s) => ({
      id: s.id,
      type: 'MASTAMA',
      title: s.activity.title,
      category: s.activity.journey?.title || 'MASTAMA Journey',
      student: s.student,
      submittedAt: s.submittedAt,
      status: s.status,
      evidencePhoto: s.evidencePhoto,
      description: s.description,
      xpReward: s.activity.xpReward,
      locationNote: s.locationNote,
      feedback: s.approvals?.[0]?.feedback || null,
      reviewer: s.approvals?.[0]?.reviewer || null,
    }));

    const formattedSpiritual = [...spiritualSubmissions, ...historySpiritualRaw].map((sp) => ({
      id: sp.id,
      type: 'SPIRITUAL',
      title: `Sholat Dzuhur Berjamaah #${sp.slotIndex < 10 ? '0' + sp.slotIndex : sp.slotIndex}`,
      category: '24× Dzuhur Berjamaah',
      slotIndex: sp.slotIndex,
      student: sp.student,
      submittedAt: sp.updatedAt || sp.createdAt,
      status: sp.status,
      evidencePhoto: sp.evidencePhoto,
      description: `Presensi sholat dzuhur di ${sp.location}`,
      xpReward: 25,
      locationNote: sp.location,
      feedback: sp.rejectionNote,
    }));

    const formattedOrmawa = [...ormawaSubmissions, ...historyOrmawaRaw].map((op) => ({
      id: op.id,
      type: 'ORMAWA',
      title: `ORMAWA #${op.activityIndex}: ${op.title}`,
      category: '15× ORMAWA Explorer',
      activityIndex: op.activityIndex,
      student: op.student,
      submittedAt: op.updatedAt || op.createdAt,
      status: op.status,
      evidencePhoto: op.evidencePhoto,
      description: `${op.ormawaName} — ${op.description}`,
      xpReward: 50,
      feedback: op.rejectionNote,
    }));

    const allSubmissions = [...formattedMastama, ...formattedSpiritual, ...formattedOrmawa, ...formattedAi].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    const pending = allSubmissions.filter((s) => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED');
    const history = allSubmissions.filter(
      (s) => s.status === 'COMPLETED' || s.status === 'REJECTED' || s.status === 'APPROVED'
    );

    return NextResponse.json({
      pendingSubmissions: pending,
      historySubmissions: history,
      totalPending: pending.length,
      totalReviewed: history.length,
    });
  } catch (error: any) {
    console.error('Error fetching mentor approvals:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar submission approval.' },
      { status: 500 }
    );
  }
}

// POST: Mentor approve / reject submission (supports MASTAMA, SPIRITUAL, ORMAWA)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'GROUP_MENTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Pendamping dan Admin yang dapat memberikan approval.' },
        { status: 403 }
      );
    }

    const { submissionId, submissionType, action, feedback } = await request.json();

    if (!submissionId || !action) {
      return NextResponse.json({ error: 'Data approval tidak lengkap.' }, { status: 400 });
    }

    if (action === 'REJECT' && (!feedback || feedback.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Alasan penolakan wajib diisi agar mahasiswa dapat memperbaiki presensi/submission.' },
        { status: 400 }
      );
    }

    const newStatus = action === 'APPROVE' ? 'COMPLETED' : 'REJECTED';

    // === CASE 1: SPIRITUAL DZUHUR APPROVAL ===
    if (submissionType === 'SPIRITUAL') {
      const sp = await prisma.spiritualParticipation.findUnique({
        where: { id: submissionId },
        include: {
          student: {
            include: { user: true, group: true },
          },
        },
      });

      if (!sp) {
        return NextResponse.json({ error: 'Data presensi Dzuhur tidak ditemukan.' }, { status: 404 });
      }

      await prisma.spiritualParticipation.update({
        where: { id: sp.id },
        data: {
          status: newStatus,
          rejectionNote: action === 'REJECT' ? feedback : null,
          updatedAt: new Date(),
        },
      });

      let gamification = null;
      if (action === 'APPROVE') {
        gamification = await awardXpAndCheckBadges(
          sp.studentId,
          25,
          'SPIRITUAL',
          sp.id,
          `Presensi Sholat Dzuhur Berjamaah #${sp.slotIndex}`
        );

        await prisma.notification.create({
          data: {
            userId: sp.student.userId,
            title: `🕌 Presensi Dzuhur #${sp.slotIndex} Disetujui (+25 XP)!`,
            message: `Presensi Sholat Dzuhur Berjamaah #${sp.slotIndex} telah diverifikasi oleh ${user.fullName}.`,
            type: 'SUCCESS',
            linkUrl: '/missions',
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            userId: sp.student.userId,
            title: `⚠️ Presensi Dzuhur #${sp.slotIndex} Perlu Perbaikan`,
            message: `Presensi Dzuhur #${sp.slotIndex} ditolak oleh ${user.fullName}. Catatan: "${feedback}". Silakan foto ulang & kirim kembali.`,
            type: 'WARNING',
            linkUrl: '/missions',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: action === 'APPROVE' ? 'Presensi Dzuhur berhasil disetujui!' : 'Presensi Dzuhur ditolak dengan catatan.',
        gamification,
      });
    }

    // === CASE 2: ORMAWA PARTICIPATION APPROVAL ===
    if (submissionType === 'ORMAWA') {
      const op = await prisma.ormawaParticipation.findUnique({
        where: { id: submissionId },
        include: {
          student: {
            include: { user: true, group: true },
          },
        },
      });

      if (!op) {
        return NextResponse.json({ error: 'Data kegiatan ORMAWA tidak ditemukan.' }, { status: 404 });
      }

      await prisma.ormawaParticipation.update({
        where: { id: op.id },
        data: {
          status: newStatus,
          rejectionNote: action === 'REJECT' ? feedback : null,
          updatedAt: new Date(),
        },
      });

      let gamification = null;
      if (action === 'APPROVE') {
        gamification = await awardXpAndCheckBadges(
          op.studentId,
          50,
          'ORMAWA',
          op.id,
          `Kegiatan ORMAWA #${op.activityIndex}: ${op.title}`
        );

        await prisma.notification.create({
          data: {
            userId: op.student.userId,
            title: `👥 Kegiatan ORMAWA #${op.activityIndex} Disetujui (+50 XP)!`,
            message: `Kegiatan ${op.title} telah diverifikasi oleh ${user.fullName}.`,
            type: 'SUCCESS',
            linkUrl: '/missions',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: action === 'APPROVE' ? 'Kegiatan ORMAWA berhasil disetujui!' : 'Kegiatan ORMAWA ditolak dengan catatan.',
        gamification,
      });
    }

    // === CASE 4: AI CHALLENGE PROJECT APPROVAL ===
    if (submissionType === 'AI_PROJECT') {
      const ai = await prisma.aiProject.findUnique({
        where: { id: submissionId },
        include: {
          student: {
            include: { user: true, group: true },
          },
        },
      });

      if (!ai) {
        return NextResponse.json({ error: 'Data laporan AI Challenge tidak ditemukan.' }, { status: 404 });
      }

      let gamification = null;

      if (action === 'APPROVE') {
        const updatedAi = await prisma.aiProject.update({
          where: { id: submissionId },
          data: {
            stage: 'COMPLETED',
            mentorFeedback: feedback || 'Laporan AI Challenge disetujui.',
            score: 100,
            updatedAt: new Date(),
          },
        });

        // Award 150 XP and check AI Innovator Badge
        gamification = await awardXpAndCheckBadges(
          ai.studentId,
          150,
          'AI_PROJECT',
          ai.id,
          `Laporan AI Challenge Disetujui: ${ai.title}`
        );

        // Notify student
        await prisma.notification.create({
          data: {
            userId: ai.student.userId,
            title: '🎉 Laporan AI Challenge Disetujui (+150 XP)!',
            message: `Selamat! Laporan AI Challenge "${ai.title}" telah diverifikasi & disetujui oleh ${user.fullName}.`,
            type: 'SUCCESS',
            linkUrl: '/missions',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Laporan AI Challenge berhasil disetujui!',
          project: updatedAi,
          gamification,
        });
      } else {
        const updatedAi = await prisma.aiProject.update({
          where: { id: submissionId },
          data: {
            stage: 'EKSEKUSI',
            mentorFeedback: feedback,
            updatedAt: new Date(),
          },
        });

        // Notify student
        await prisma.notification.create({
          data: {
            userId: ai.student.userId,
            title: '⚠️ Laporan AI Challenge Perlu Perbaikan',
            message: `Laporan AI Challenge "${ai.title}" memerlukan perbaikan: "${feedback}". Silakan perbaiki dan kirimkan kembali.`,
            type: 'WARNING',
            linkUrl: '/missions',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Laporan AI Challenge dikembalikan untuk perbaikan.',
          project: updatedAi,
        });
      }
    }

    // === CASE 3: REGULAR MASTAMA ACTIVITY SUBMISSION ===
    const submission = await prisma.activitySubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          include: {
            user: true,
            group: true,
          },
        },
        activity: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan.' }, { status: 404 });
    }

    // Record approval
    const approval = await prisma.approval.create({
      data: {
        submissionId: submission.id,
        reviewerId: user.id,
        status: newStatus,
        feedback: feedback || (action === 'APPROVE' ? 'Disetujui oleh Pendamping.' : 'Ditolak.'),
      },
    });

    // Update submission
    await prisma.activitySubmission.update({
      where: { id: submission.id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    let gamification = null;

    if (action === 'APPROVE') {
      gamification = await awardXpAndCheckBadges(
        submission.studentId,
        submission.activity.xpReward,
        'ACTIVITY_APPROVAL',
        submission.activityId,
        `Penyelesaian Kegiatan: ${submission.activity.title}`
      );

      await prisma.notification.create({
        data: {
          userId: submission.student.userId,
          title: `✓ Kegiatan Disetujui (+${submission.activity.xpReward} XP)!`,
          message: `Submission untuk "${submission.activity.title}" telah disetujui oleh ${user.fullName}. Stamp baru terbuka di passport!`,
          type: 'SUCCESS',
          linkUrl: '/passport',
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: submission.student.userId,
          title: `⚠️ Submission Perlu Perbaikan`,
          message: `Submission "${submission.activity.title}" ditolak oleh ${user.fullName}. Alasan: "${feedback}". Silakan ajukan ulang.`,
          type: 'WARNING',
          linkUrl: '/history',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Submission berhasil disetujui!' : 'Submission berhasil ditolak dengan catatan perbaikan.',
      approval,
      gamification,
    });
  } catch (error: any) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses approval submission.' },
      { status: 500 }
    );
  }
}
