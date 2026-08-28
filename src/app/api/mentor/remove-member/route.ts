import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'GROUP_MENTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'ID mahasiswa wajib diisi.' }, { status: 400 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Mahasiswa tidak ditemukan.' }, { status: 404 });
    }

    // Verify mentor has access to the student's group
    if (user.role === 'GROUP_MENTOR' && student.groupId) {
      const assignment = await prisma.groupMentorAssignment.findFirst({
        where: { mentorId: user.id, groupId: student.groupId },
      });
      if (!assignment) {
         return NextResponse.json({ error: 'Akses ditolak. Mahasiswa tidak berada di kelompok Anda.' }, { status: 403 });
      }
    }

    // Delete the entire user account so they can register again
    await prisma.user.delete({
      where: { id: student.userId },
    });

    return NextResponse.json({ success: true, message: 'Mahasiswa berhasil dikeluarkan dari kelompok.' });

  } catch (error: any) {
    console.error('Error removing student from group:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
