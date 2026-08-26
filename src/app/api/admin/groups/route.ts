import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses khusus Administrator.' }, { status: 403 });
    }

    const groups = await prisma.group.findMany({
      include: {
        mentorAssignments: {
          include: { mentor: { select: { id: true, fullName: true, email: true, phoneNumber: true } } },
        },
        _count: { select: { students: true } },
      },
      orderBy: { number: 'asc' },
    });

    const activeYear = await prisma.mastamaYear.findFirst({
      where: { isActive: true },
    });

    const mentors = await prisma.user.findMany({
      where: { role: 'GROUP_MENTOR' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        mentorAssignments: {
          include: { group: { select: { id: true, name: true, number: true } } },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({
      groups: groups.map((g) => ({
        id: g.id,
        number: g.number,
        name: g.name,
        capacity: g.capacity,
        memberCount: g._count.students,
        status: g.status,
        mentors: g.mentorAssignments.map((m) => m.mentor),
      })),
      groupAssignMode: activeYear?.groupAssignMode || 'ADMIN_ASSIGN',
      mentors: mentors.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        email: m.email,
        phoneNumber: m.phoneNumber,
        assignedGroups: m.mentorAssignments.map((ma) => ma.group.name),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin groups:', error);
    return NextResponse.json({ error: 'Gagal memuat data kelompok & pendamping.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Administrator.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, groupAssignMode, groupId, capacity, name, mentorIds, fullName, email, password, phoneNumber } = body;

    // 1. TOGGLE GROUP ASSIGNMENT MODE
    if (action === 'TOGGLE_MODE' && groupAssignMode) {
      await prisma.mastamaYear.updateMany({
        where: { isActive: true },
        data: { groupAssignMode },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CONFIG_CHANGE',
          entityType: 'MASTAMA_YEAR',
          details: `Group assignment mode changed to ${groupAssignMode}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Mode penentuan kelompok diubah menjadi: ${groupAssignMode}`,
      });
    }

    // 2. CREATE NEW GROUP MENTOR
    if (action === 'CREATE_MENTOR') {
      if (!fullName || !email) {
        return NextResponse.json({ error: 'Nama lengkap dan email pendamping wajib diisi.' }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Promote existing user to GROUP_MENTOR
        const updatedMentor = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'GROUP_MENTOR',
            fullName: fullName || existingUser.fullName,
            phoneNumber: phoneNumber || existingUser.phoneNumber,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'PROMOTE_MENTOR',
            entityType: 'USER',
            entityId: updatedMentor.id,
            details: `User ${updatedMentor.email} dijadikan Kakak Pendamping (GROUP_MENTOR)`,
          },
        });

        return NextResponse.json({
          success: true,
          message: `User ${updatedMentor.fullName} (${updatedMentor.email}) berhasil didaftarkan sebagai Kakak Pendamping!`,
          mentor: updatedMentor,
        });
      }

      // Create brand new mentor account
      const passwordHash = await bcrypt.hash(password || 'Admin123!', 10);
      const newMentor = await prisma.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          role: 'GROUP_MENTOR',
          phoneNumber: phoneNumber || null,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_MENTOR',
          entityType: 'USER',
          entityId: newMentor.id,
          details: `Admin mendaftarkan Kakak Pendamping baru: ${newMentor.fullName} (${newMentor.email})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Kakak Pendamping ${newMentor.fullName} berhasil ditambahkan! Password default: ${password || 'Admin123!'}`,
        mentor: newMentor,
      });
    }

    // 3. UPDATE GROUP DETAILS & MENTOR ASSIGNMENTS
    if (action === 'UPDATE_GROUP' && groupId) {
      const updated = await prisma.group.update({
        where: { id: groupId },
        data: {
          capacity: capacity ? parseInt(capacity) : undefined,
          name: name || undefined,
        },
      });

      if (mentorIds && Array.isArray(mentorIds)) {
        await prisma.groupMentorAssignment.deleteMany({
          where: { groupId },
        });

        for (const mId of mentorIds) {
          await prisma.groupMentorAssignment.create({
            data: {
              groupId,
              mentorId: mId,
            },
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'GROUP_UPDATE',
          entityType: 'GROUP',
          entityId: groupId,
          details: `Group ${updated.name} updated with ${mentorIds?.length || 0} mentors.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Kelompok ${updated.name} dan penetapan pendamping berhasil diperbarui!`,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating admin groups:', error);
    return NextResponse.json({ error: 'Gagal memproses data kelompok/pendamping.' }, { status: 500 });
  }
}
