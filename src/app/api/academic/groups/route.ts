import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        mentorAssignments: {
          include: {
            mentor: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { number: 'asc' },
    });

    const activeYear = await prisma.mastamaYear.findFirst({
      where: { isActive: true },
    });

    const formattedGroups = groups.map((g) => ({
      id: g.id,
      number: g.number,
      name: g.name,
      capacity: g.capacity,
      memberCount: g._count.students,
      availableSlots: Math.max(0, g.capacity - g._count.students),
      status: g._count.students >= g.capacity ? 'FULL' : g.status,
      mentors: g.mentorAssignments.map((ma) => ma.mentor.fullName),
    }));

    return NextResponse.json({
      groups: formattedGroups,
      groupAssignMode: activeYear?.groupAssignMode || 'ADMIN_ASSIGN',
    });
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Gagal memuat data kelompok.' }, { status: 500 });
  }
}
