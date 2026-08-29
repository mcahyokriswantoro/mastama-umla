import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'GROUP_MENTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 } );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    let assignedGroupIds: string[] = [];
    if (user.role === 'GROUP_MENTOR') {
      const assignments = await prisma.groupMentorAssignment.findMany({
        where: { mentorId: user.id },
      });
      assignedGroupIds = assignments.map((a) => a.groupId);
    }

    const targetGroupId = groupId || assignedGroupIds[0];

    if (!targetGroupId && user.role === 'GROUP_MENTOR') {
      return NextResponse.json({
        group: null,
        members: [],
        stats: { total: 0, presentToday: 0, pendingReview: 0, avgProgress: 0 },
      });
    }

    const whereGroup = targetGroupId ? { id: targetGroupId } : {};
    const group = await prisma.group.findFirst({
      where: whereGroup,
      include: {
        mentorAssignments: {
          include: {
            mentor: { select: { fullName: true, phoneNumber: true, email: true } },
          },
        },
        students: {
          include: {
            user: { select: { fullName: true, email: true, phoneNumber: true, avatarUrl: true } },
            faculty: { select: { code: true, name: true } },
            studyProgram: { select: { code: true, name: true } },
            submissions: {
              where: { status: 'COMPLETED' },
            },
            attendances: true,
            userBadges: {
              include: { badge: true },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Kelompok tidak ditemukan.' }, { status: 404 });
    }

    const totalActivities = await prisma.activity.count({ where: { isActive: true } });

    const members = group.students.map((st) => {
      const completedCount = st.submissions.length;
      const progressPercent = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

      return {
        id: st.id,
        nim: st.nim,
        fullName: st.user?.fullName || '-',
        email: st.user?.email || '-',
        phone: st.user?.phoneNumber || '-',
        avatarUrl: st.user?.avatarUrl || null,
        faculty: st.faculty?.name || '-',
        studyProgram: st.studyProgram?.name || '-',
        totalXp: st.totalXp,
        completedActivities: completedCount,
        progressPercent,
        badgesCount: st.userBadges.length,
        attendancesCount: st.attendances.length,
      };
    });

    const pendingApprovalsCount = await prisma.activitySubmission.count({
      where: {
        student: { groupId: group.id },
        status: 'UNDER_REVIEW',
      },
    });

    const avgProgress = members.length > 0
      ? Math.round(members.reduce((acc, m) => acc + m.progressPercent, 0) / members.length)
      : 0;

    return NextResponse.json({
      group: {
        id: group.id,
        number: group.number,
        name: group.name,
        capacity: group.capacity,
        memberCount: group.students.length,
        mentors: group.mentorAssignments.map((m) => m.mentor.fullName),
      },
      members,
      stats: {
        totalMembers: group.students.length,
        capacity: group.capacity,
        pendingApprovalsCount,
        avgProgress,
      },
    });
  } catch (error: any) {
    console.error('Error fetching group matrix:', error);
    return NextResponse.json({ error: 'Gagal memuat matriks kelompok.' }, { status: 500 });
  }
}
