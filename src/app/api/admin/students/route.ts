import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses khusus Administrator.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const groupId = searchParams.get('groupId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 50;

    const where: any = {
      role: 'STUDENT',
      studentProfile: { isNot: null },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { studentProfile: { nim: { contains: search } } },
      ];
    }

    if (groupId) {
      where.studentProfile = {
        ...where.studentProfile,
        groupId: groupId,
      };
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          studentProfile: {
            select: {
              id: true,
              nim: true,
              totalXp: true,
              group: { select: { id: true, name: true, number: true } },
              faculty: { select: { id: true, name: true, code: true } },
              studyProgram: { select: { id: true, name: true, code: true } },
            },
          },
        },
        orderBy: { fullName: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Also fetch groups for the filter dropdown
    const groups = await prisma.group.findMany({
      select: { id: true, name: true, number: true },
      orderBy: { number: 'asc' },
    });

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        phoneNumber: s.phoneNumber,
        createdAt: s.createdAt,
        nim: s.studentProfile?.nim || '-',
        totalXp: s.studentProfile?.totalXp || 0,
        profileId: s.studentProfile?.id || null,
        group: s.studentProfile?.group || null,
        faculty: s.studentProfile?.faculty || null,
        studyProgram: s.studentProfile?.studyProgram || null,
      })),
      groups,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Gagal memuat data mahasiswa.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Administrator.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. UPDATE STUDENT
    if (action === 'UPDATE_STUDENT') {
      const { studentUserId, newFullName, newEmail, newNim, newPassword, newPhoneNumber, newGroupId } = body;
      if (!studentUserId) {
        return NextResponse.json({ error: 'ID mahasiswa tidak valid.' }, { status: 400 });
      }

      const student = await prisma.user.findUnique({
        where: { id: studentUserId },
        include: { studentProfile: true },
      });
      if (!student || student.role !== 'STUDENT') {
        return NextResponse.json({ error: 'Mahasiswa tidak ditemukan.' }, { status: 404 });
      }

      // Update user data
      const userUpdateData: any = {};
      if (newFullName) userUpdateData.fullName = newFullName;
      if (newEmail && newEmail !== student.email) {
        const existing = await prisma.user.findUnique({ where: { email: newEmail } });
        if (existing && existing.id !== studentUserId) {
          return NextResponse.json({ error: `Email "${newEmail}" sudah digunakan oleh akun lain.` }, { status: 400 });
        }
        userUpdateData.email = newEmail;
      }
      if (newPassword) {
        userUpdateData.passwordHash = await bcrypt.hash(newPassword, 10);
      }
      if (newPhoneNumber !== undefined) {
        userUpdateData.phoneNumber = newPhoneNumber || null;
      }

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: studentUserId },
          data: userUpdateData,
        });
      }

      // Update student profile data
      if (student.studentProfile) {
        const profileUpdateData: any = {};
        if (newNim && newNim !== student.studentProfile.nim) {
          const existingNim = await prisma.studentProfile.findUnique({ where: { nim: newNim } });
          if (existingNim && existingNim.id !== student.studentProfile.id) {
            return NextResponse.json({ error: `NIM "${newNim}" sudah digunakan oleh mahasiswa lain.` }, { status: 400 });
          }
          profileUpdateData.nim = newNim;
        }
        if (newGroupId !== undefined) {
          profileUpdateData.groupId = newGroupId || null;
        }

        if (Object.keys(profileUpdateData).length > 0) {
          await prisma.studentProfile.update({
            where: { id: student.studentProfile.id },
            data: profileUpdateData,
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE_STUDENT',
          entityType: 'USER',
          entityId: studentUserId,
          details: `Admin mengupdate data mahasiswa: ${newFullName || student.fullName} (${newEmail || student.email})${newPassword ? ' [password direset]' : ''}${newNim ? ` [NIM: ${newNim}]` : ''}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Data mahasiswa ${newFullName || student.fullName} berhasil diperbarui!${newPassword ? ' Password telah direset.' : ''}`,
      });
    }

    // 2. DELETE STUDENT
    if (action === 'DELETE_STUDENT') {
      const { studentUserId } = body;
      if (!studentUserId) {
        return NextResponse.json({ error: 'ID mahasiswa tidak valid.' }, { status: 400 });
      }

      const student = await prisma.user.findUnique({
        where: { id: studentUserId },
        include: { studentProfile: true },
      });
      if (!student || student.role !== 'STUDENT') {
        return NextResponse.json({ error: 'Mahasiswa tidak ditemukan.' }, { status: 404 });
      }

      await prisma.user.delete({
        where: { id: studentUserId },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE_STUDENT',
          entityType: 'USER',
          entityId: studentUserId,
          details: `Admin menghapus akun mahasiswa: ${student.fullName} (${student.email}) NIM: ${student.studentProfile?.nim || '-'}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Akun mahasiswa ${student.fullName} (NIM: ${student.studentProfile?.nim || '-'}) berhasil dihapus.`,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing student:', error);
    return NextResponse.json({ error: error?.message || 'Gagal memproses data mahasiswa.' }, { status: 500 });
  }
}
