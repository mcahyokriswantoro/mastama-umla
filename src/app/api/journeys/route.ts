import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const studentProfileId = user?.studentProfile?.id;

    const journeys = await prisma.journey.findMany({
      include: {
        missions: {
          include: {
            activities: {
              where: { isActive: true },
              orderBy: { orderNum: 'asc' },
              include: {
                submissions: {
                  where: studentProfileId ? { studentId: studentProfileId } : undefined,
                  include: {
                    approvals: {
                      include: {
                        reviewer: {
                          select: { fullName: true },
                        },
                      },
                      orderBy: { reviewedAt: 'desc' },
                      take: 1,
                    },
                  },
                },
                attendances: {
                  where: studentProfileId ? { studentId: studentProfileId } : undefined,
                },
              },
            },
          },
        },
      },
      orderBy: { orderNum: 'asc' },
    });

    const formattedJourneys = journeys.map((j) => {
      let totalActivities = 0;
      let completedActivities = 0;

      const missions = j.missions.map((m) => {
        const activities = m.activities.map((a: any) => {
          totalActivities++;
          const submission = studentProfileId ? a.submissions?.[0] : null;
          const attendance = studentProfileId ? a.attendances?.[0] : null;

          let status = 'UPCOMING';
          let rejectionReason: string | null = null;
          let latestApproval = submission?.approvals?.[0];

          if (submission?.status === 'COMPLETED' || attendance?.status === 'PRESENT') {
            status = 'COMPLETED';
            completedActivities++;
          } else if (submission?.status === 'APPROVED') {
            status = 'COMPLETED';
            completedActivities++;
          } else if (submission?.status === 'UNDER_REVIEW' || submission?.status === 'SUBMITTED') {
            status = 'UNDER_REVIEW';
          } else if (submission?.status === 'REJECTED') {
            status = 'REJECTED';
            rejectionReason = latestApproval?.feedback || null;
          }

          return {
            id: a.id,
            code: a.code,
            title: a.title,
            subtitle: a.subtitle,
            description: a.description,
            bannerImage: a.bannerImage,
            date: a.date.toISOString(),
            startTime: a.startTime,
            endTime: a.endTime,
            location: a.location,
            mode: a.mode,
            picName: a.picName,
            picContact: a.picContact,
            onlineUrl: a.onlineUrl,
            verificationType: a.verificationType,
            xpReward: a.xpReward,
            qrSecret: a.qrSecret,
            status,
            submissionId: submission?.id || null,
            submissionPhoto: submission?.evidencePhoto || null,
            submissionDesc: submission?.description || null,
            rejectionReason,
            checkedInAt: attendance?.checkInTime?.toISOString() || null,
          };
        });

        return {
          id: m.id,
          code: m.code,
          title: m.title,
          description: m.description,
          category: m.category,
          targetCount: m.targetCount,
          xpReward: m.xpReward,
          activities,
        };
      });

      const isCompleted = totalActivities > 0 && completedActivities === totalActivities;

      return {
        id: j.id,
        code: j.code,
        title: j.title,
        subtitle: j.subtitle,
        targetDate: j.targetDate.toISOString(),
        mode: j.mode,
        location: j.location,
        orderNum: j.orderNum,
        icon: j.icon,
        totalActivities,
        completedActivities,
        isCompleted,
        missions,
      };
    });

    return NextResponse.json({ journeys: formattedJourneys });
  } catch (error: any) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json({ error: 'Gagal memuat rangkaian perjalanan.' }, { status: 500 });
  }
}
