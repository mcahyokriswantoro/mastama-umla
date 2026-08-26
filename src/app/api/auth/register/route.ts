import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { awardXpAndCheckBadges } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      nim,
      email,
      phoneNumber,
      password,
      mastamaYear,
      facultyId,
      studyProgramId,
      groupId,
    } = body;

    // Validation
    if (!fullName || !nim || !email || !password || !facultyId || !studyProgramId) {
      return NextResponse.json(
        { error: 'Mohon lengkapi semua data wajib.' },
        { status: 400 }
      );
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' },
        { status: 400 }
      );
    }

    // Check existing NIM
    const existingNim = await prisma.studentProfile.findUnique({
      where: { nim: nim.trim() },
    });
    if (existingNim) {
      return NextResponse.json(
        { error: 'NIM sudah terdaftar dalam sistem.' },
        { status: 400 }
      );
    }

    // Get active Mastama Year
    const yearObj = await prisma.mastamaYear.findFirst({
      where: {
        year: mastamaYear ? parseInt(mastamaYear) : 2026,
        isActive: true,
      },
    });
    if (!yearObj) {
      return NextResponse.json(
        { error: 'Tahun MASTAMA tidak valid atau belum aktif.' },
        { status: 400 }
      );
    }

    // Group Assignment Logic
    let assignedGroupId: string | null = null;

    if (groupId) {
      const selectedGroup = await prisma.group.findUnique({
        where: { id: groupId },
        include: { students: true },
      });

      if (!selectedGroup) {
        return NextResponse.json({ error: 'Kelompok tidak ditemukan.' }, { status: 400 });
      }

      if (selectedGroup.status === 'FULL' || selectedGroup.students.length >= selectedGroup.capacity) {
        return NextResponse.json(
          { error: `Kelompok ${selectedGroup.name} sudah penuh. Silakan pilih kelompok lain.` },
          { status: 400 }
        );
      }
      assignedGroupId = selectedGroup.id;
    } else {
      const openGroup = await prisma.group.findFirst({
        where: {
          mastamaYearId: yearObj.id,
          status: 'OPEN',
        },
        include: { students: true },
        orderBy: { students: { _count: 'asc' } },
      });
      if (openGroup) {
        assignedGroupId = openGroup.id;
      }
    }

    const passwordHash = await hashPassword(password);

    // Create User & StudentProfile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber?.trim() || null,
          role: 'STUDENT',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          nim: nim.trim(),
          facultyId,
          studyProgramId,
          mastamaYearId: yearObj.id,
          groupId: assignedGroupId,
          totalXp: 50, // Welcome XP
          streakCount: 1,
        },
      });

      // Welcome Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: '🎉 Selamat Datang di UMLA!',
          message: 'Digital Student Passport Anda berhasil dibuat. Selamat memulai petualangan MASTAMA 2026!',
          type: 'SUCCESS',
          linkUrl: '/passport',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'STUDENT_REGISTRATION',
          entityType: 'USER',
          entityId: user.id,
          details: `Student registered: ${fullName} (NIM: ${nim}) assigned to group ${assignedGroupId || 'None'}`,
        },
      });

      return { user, profile };
    });

    // Initial Registration XP ledger
    await prisma.xpTransaction.create({
      data: {
        studentId: newUser.profile.id,
        amount: 50,
        sourceType: 'REGISTRATION',
        description: 'Welcome Bonus: Registrasi Digital Student Passport',
      },
    });

    const token = signToken({ userId: newUser.user.id, role: 'STUDENT' });

    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Digital Student Passport Anda telah aktif.',
      user: {
        id: newUser.user.id,
        fullName: newUser.user.fullName,
        email: newUser.user.email,
        role: newUser.user.role,
      },
    });

    response.cookies.set('umla_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada server saat pendaftaran.' },
      { status: 500 }
    );
  }
}
