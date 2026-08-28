import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Fetch unread notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let studentData = null;
    if (user.studentProfile) {
      // Get student badges
      const userBadges = await prisma.userBadge.findMany({
        where: { studentId: user.studentProfile.id },
        include: { badge: true },
      });

      // Get count of completed activities
      const completedSubmissions = await prisma.activitySubmission.count({
        where: {
          studentId: user.studentProfile.id,
          status: 'COMPLETED',
        },
      });

      const ormawaCount = await prisma.ormawaParticipation.count({
        where: {
          studentId: user.studentProfile.id,
          status: 'COMPLETED',
        },
      });

      const spiritualCount = await prisma.spiritualParticipation.count({
        where: {
          studentId: user.studentProfile.id,
          status: 'COMPLETED',
        },
      });

      studentData = {
        ...user.studentProfile,
        badges: userBadges.map((ub) => ub.badge),
        completedCount: completedSubmissions,
        ormawaCount,
        spiritualCount,
      };
    }

    return NextResponse.json({
      user: {
        ...user,
        studentProfile: studentData,
      },
      notifications,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const { avatarUrl, phoneNumber, bio, fullName, facultyId, studyProgramId } = await request.json();

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
        fullName: fullName || user.fullName,
      },
    });

    // Update studentProfile bio, faculty, and studyProgram if student
    if (user.studentProfile && (bio !== undefined || facultyId || studyProgramId)) {
      const dataToUpdate: any = {};
      if (bio !== undefined) dataToUpdate.bio = bio;
      if (facultyId) dataToUpdate.facultyId = facultyId;
      if (studyProgramId) dataToUpdate.studyProgramId = studyProgramId;

      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: dataToUpdate,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
