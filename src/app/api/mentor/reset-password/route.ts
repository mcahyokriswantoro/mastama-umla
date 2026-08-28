import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'GROUP_MENTOR') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Mentor.' }, { status: 403 });
    }

    const { studentId, newPassword } = await request.json();
    if (!studentId || !newPassword) {
      return NextResponse.json({ error: 'ID Mahasiswa dan Password Baru wajib diisi.' }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
    }

    // Verify the mentor owns the group the student is in
    const mentorAssignment = await prisma.groupMentorAssignment.findFirst({
      where: { mentorId: user.id },
      include: { group: true },
    });

    if (!mentorAssignment) {
      return NextResponse.json({ error: 'Anda belum ditugaskan ke kelompok mana pun.' }, { status: 403 });
    }

    // Notice that studentId passed from the frontend group-matrix is the student profile ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!studentProfile || studentProfile.groupId !== mentorAssignment.groupId) {
      return NextResponse.json({ error: 'Mahasiswa tidak ditemukan atau bukan anggota kelompok Anda.' }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: studentProfile.userId },
      data: { passwordHash },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RESET_PASSWORD_BY_MENTOR',
        entityType: 'USER',
        entityId: studentProfile.userId,
        details: `Mentor mereset password mahasiswa: ${studentProfile.user.fullName} (${studentProfile.user.email})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Password mahasiswa berhasil direset.' });
  } catch (error: any) {
    console.error('Error reset password by mentor:', error);
    return NextResponse.json({ error: 'Gagal mereset password.' }, { status: 500 });
  }
}
