import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        studyPrograms: true,
      },
      orderBy: { name: 'asc' },
    });

    const mastamaYears = await prisma.mastamaYear.findMany({
      where: { isActive: true },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({
      faculties,
      mastamaYears,
    });
  } catch (error: any) {
    console.error('Error fetching academic data:', error);
    return NextResponse.json({ error: 'Gagal memuat data akademik.' }, { status: 500 });
  }
}
