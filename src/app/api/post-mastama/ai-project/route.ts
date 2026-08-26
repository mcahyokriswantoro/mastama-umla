import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.studentProfile) {
      return NextResponse.json({ error: 'Data mahasiswa tidak ditemukan.' }, { status: 401 });
    }

    const project = await prisma.aiProject.findFirst({
      where: { studentId: user.studentProfile.id },
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Error fetching AI project:', error);
    return NextResponse.json({ error: 'Gagal memuat proyek AI.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
      return NextResponse.json({ error: 'Hanya mahasiswa yang dapat mengelola AI Project.' }, { status: 403 });
    }

    const { teamName, title, description, stage, proposalUrl, repoUrl, demoUrl, videoUrl } = await request.json();

    if (!teamName || !title || !description) {
      return NextResponse.json({ error: 'Nama tim/kelompok, judul inovasi, dan deskripsi laporan wajib diisi.' }, { status: 400 });
    }

    const studentProfileId = user.studentProfile.id;
    const currentStage = stage || 'IDE';

    const existing = await prisma.aiProject.findFirst({
      where: { studentId: studentProfileId },
    });

    let project;
    if (existing) {
      // If already completed, cannot re-submit unless rejected
      if (existing.stage === 'COMPLETED') {
        return NextResponse.json({ error: 'Laporan AI Challenge ini sudah disetujui sebelumnya.' }, { status: 400 });
      }

      project = await prisma.aiProject.update({
        where: { id: existing.id },
        data: {
          teamName,
          title,
          description,
          stage: currentStage,
          proposalUrl: proposalUrl || existing.proposalUrl,
          repoUrl: repoUrl || existing.repoUrl,
          demoUrl: demoUrl || existing.demoUrl,
          videoUrl: videoUrl || existing.videoUrl,
          mentorFeedback: currentStage === 'LAPORAN' ? null : existing.mentorFeedback,
          updatedAt: new Date(),
        },
      });
    } else {
      project = await prisma.aiProject.create({
        data: {
          studentId: studentProfileId,
          teamName,
          title,
          description,
          stage: currentStage,
          proposalUrl,
          repoUrl,
          demoUrl,
          videoUrl,
        },
      });
    }

    // If stage is LAPORAN, notify student's group mentor for approval
    if (currentStage === 'LAPORAN' && user.studentProfile.group?.id) {
      const mentorAssignments = await prisma.groupMentorAssignment.findMany({
        where: { groupId: user.studentProfile.group.id },
        include: { mentor: true },
      });

      for (const assignment of mentorAssignments) {
        await prisma.notification.create({
          data: {
            userId: assignment.mentorId,
            title: `🤖 Laporan AI Challenge Masuk: ${user.fullName}`,
            message: `${user.fullName} (${user.studentProfile.group.name} / Tim ${teamName}) telah mengumpulkan Laporan AI Challenge "${title}" untuk diverifikasi.`,
            type: 'ACTION_REQUIRED',
            linkUrl: '/mentor/approvals',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: currentStage === 'LAPORAN'
        ? 'Laporan AI Challenge berhasil dikirimkan ke Kakak Pendamping untuk diverifikasi!'
        : 'Progres proyek AI Challenge berhasil diperbarui.',
      project,
    });
  } catch (error: any) {
    console.error('Error saving AI project:', error);
    return NextResponse.json({ error: 'Gagal menyimpan proyek AI.' }, { status: 500 });
  }
}

