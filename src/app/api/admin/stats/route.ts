import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses khusus Administrator.' }, { status: 403 });
    }

    const [
      totalStudents,
      totalMentors,
      totalGroups,
      totalActivities,
      totalSubmissions,
      totalApprovals,
      faculties,
      groups,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.user.count({ where: { role: 'GROUP_MENTOR' } }),
      prisma.group.count(),
      prisma.activity.count({ where: { isActive: true } }),
      prisma.activitySubmission.count(),
      prisma.approval.count({ where: { status: 'APPROVED' } }),
      prisma.faculty.findMany({
        include: {
          _count: { select: { students: true } },
          studyPrograms: {
            include: { _count: { select: { students: true } } },
          },
        },
      }),
      prisma.group.findMany({
        include: {
          _count: { select: { students: true } },
          mentorAssignments: {
            include: { mentor: { select: { fullName: true } } },
          },
        },
        orderBy: { number: 'asc' },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, role: true, email: true } } },
      }),
    ]);

    const pendingSubmissionsCount = await prisma.activitySubmission.count({
      where: { status: 'UNDER_REVIEW' },
    });

    const completedSubmissionsCount = await prisma.activitySubmission.count({
      where: { status: 'COMPLETED' },
    });

    // Faculty breakdown chart data
    const facultyChartData = faculties.map((f) => ({
      name: f.code,
      fullName: f.name,
      students: f._count.students,
    }));

    // Study Program breakdown
    const studyPrograms = await prisma.studyProgram.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { students: { _count: 'desc' } },
    });
    
    const prodiChartData = studyPrograms.map((p) => ({
      name: p.code,
      fullName: p.name,
      students: p._count.students,
    }));

    // Top 10 Students by XP
    const topStudents = await prisma.studentProfile.findMany({
      take: 10,
      orderBy: { totalXp: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        studyProgram: { select: { name: true, code: true } },
        group: { select: { name: true } },
      },
    });

    // Group capacity distribution
    const groupDistribution = groups.map((g) => ({
      name: `Klp ${g.number < 10 ? '0' + g.number : g.number}`,
      members: g._count.students,
      capacity: g.capacity,
    }));

    return NextResponse.json({
      summary: {
        totalStudents,
        totalMentors,
        totalGroups,
        totalActivities,
        totalSubmissions,
        totalApprovals,
        pendingSubmissionsCount,
        completedSubmissionsCount,
        completionRate: totalStudents > 0 && totalActivities > 0
          ? Math.round((completedSubmissionsCount / (totalStudents * totalActivities)) * 100)
          : 0,
      },
      facultyChartData,
      prodiChartData,
      topStudents,
      groupDistribution,
      allGroups: groups.map((g) => ({
        id: g.id,
        number: g.number,
        name: g.name,
        capacity: g.capacity,
        memberCount: g._count.students,
        mentors: g.mentorAssignments.map((m) => m.mentor.fullName),
        status: g.status,
      })),
      recentAuditLogs,
    });
  } catch (error: any) {
    console.error('Error loading admin stats:', error);
    return NextResponse.json({ error: 'Gagal memuat analitik sistem.' }, { status: 500 });
  }
}
