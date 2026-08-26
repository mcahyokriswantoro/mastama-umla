import prisma from './prisma';

export async function awardXpAndCheckBadges(
  studentProfileId: string,
  xpAmount: number,
  sourceType: string,
  sourceId: string,
  description: string
) {
  // 1. Create XP transaction
  await prisma.xpTransaction.create({
    data: {
      studentId: studentProfileId,
      amount: xpAmount,
      sourceType,
      sourceId,
      description,
    },
  });

  // 2. Increment total XP on student profile
  const updatedStudent = await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: {
      totalXp: { increment: xpAmount },
    },
    include: {
      user: true,
      submissions: {
        where: { status: 'COMPLETED' },
      },
      userBadges: true,
      ormawaLogs: {
        where: { status: 'COMPLETED' },
      },
      spiritualLogs: {
        where: { status: 'COMPLETED' },
      },
      aiProjects: true,
    },
  });

  const completedActivitiesCount = updatedStudent.submissions.length;
  const ormawaCount = updatedStudent.ormawaLogs.length;
  const spiritualCount = updatedStudent.spiritualLogs.length;
  const hasAiCompleted = updatedStudent.aiProjects.some((p) => p.stage === 'COMPLETED');
  const unlockedBadgeIds = new Set(updatedStudent.userBadges.map((ub) => ub.badgeId));

  // 3. Fetch all badges
  const allBadges = await prisma.badge.findMany();
  const newlyUnlockedBadges = [];

  for (const badge of allBadges) {
    if (unlockedBadgeIds.has(badge.id)) continue;

    let shouldUnlock = false;

    if (badge.code === 'FIRST_STEP' && completedActivitiesCount >= 1) {
      shouldUnlock = true;
    } else if (badge.code === 'PRE_MASTAMA' && completedActivitiesCount >= 2) {
      shouldUnlock = true;
    } else if (badge.code === 'OPENING_HONOR' && completedActivitiesCount >= 4) {
      shouldUnlock = true;
    } else if (badge.code === 'MASTAMA_COMPLETED' && completedActivitiesCount >= 10) {
      shouldUnlock = true;
    } else if (badge.code === 'ORMAWA_EXPLORER' && ormawaCount >= 15) {
      shouldUnlock = true;
    } else if (badge.code === 'SPIRITUAL_WARRIOR' && spiritualCount >= 24) {
      shouldUnlock = true;
    } else if (badge.code === 'AI_INNOVATOR' && hasAiCompleted) {
      shouldUnlock = true;
    } else if (
      badge.code === 'UMLA_EXPLORER' &&
      completedActivitiesCount >= 10 &&
      ormawaCount >= 15 &&
      spiritualCount >= 24 &&
      hasAiCompleted
    ) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      await prisma.userBadge.create({
        data: {
          studentId: studentProfileId,
          badgeId: badge.id,
        },
      });

      // Bonus XP for badge
      if (badge.xpRequirement > 0) {
        await prisma.xpTransaction.create({
          data: {
            studentId: studentProfileId,
            amount: 100,
            sourceType: 'BADGE',
            sourceId: badge.id,
            description: `Bonus Unlock Badge: ${badge.name}`,
          },
        });
        await prisma.studentProfile.update({
          where: { id: studentProfileId },
          data: { totalXp: { increment: 100 } },
        });
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId: updatedStudent.userId,
          title: `🏆 Badge Baru Terbuka: ${badge.name}!`,
          message: `Selamat! Anda berhasil membuka pencapaian "${badge.name}". ${badge.description}`,
          type: 'ACHIEVEMENT',
          linkUrl: '/passport',
        },
      });

      newlyUnlockedBadges.push(badge);
    }
  }

  return {
    totalXp: updatedStudent.totalXp,
    newlyUnlockedBadges,
  };
}
