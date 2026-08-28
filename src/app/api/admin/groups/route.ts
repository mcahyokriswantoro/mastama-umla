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

      // Only update mentor assignments if mentorIds is explicitly provided in the request
      if (mentorIds !== undefined && Array.isArray(mentorIds)) {
        // Get current assignments to compare
        const currentAssignments = await prisma.groupMentorAssignment.findMany({
          where: { groupId },
          select: { mentorId: true },
        });
        const currentMentorIds = currentAssignments.map(a => a.mentorId);

        // Find mentors to add and remove
        const toAdd = mentorIds.filter((id: string) => !currentMentorIds.includes(id));
        const toRemove = currentMentorIds.filter(id => !mentorIds.includes(id));

        // Remove unselected mentors
        if (toRemove.length > 0) {
          await prisma.groupMentorAssignment.deleteMany({
            where: { groupId, mentorId: { in: toRemove } },
          });
        }

        // Add newly selected mentors
        for (const mId of toAdd) {
          await prisma.groupMentorAssignment.upsert({
            where: { groupId_mentorId: { groupId, mentorId: mId } },
            create: { groupId, mentorId: mId },
            update: {},
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

    // 4. BULK ASSIGN MENTORS TO ALL GROUPS AT ONCE
    if (action === 'BULK_ASSIGN_MENTORS') {
      const { assignments } = body;
      if (!assignments || !Array.isArray(assignments)) {
        return NextResponse.json({ error: 'Data bulk assignment tidak valid.' }, { status: 400 });
      }

      // Use a transaction to ensure all-or-nothing
      await prisma.$transaction(async (tx) => {
        for (const assignment of assignments) {
          const { groupId: gId, mentorId: mId } = assignment;
          if (!gId) continue;

          // Remove existing assignments for this group
          await tx.groupMentorAssignment.deleteMany({
            where: { groupId: gId },
          });

          // Add new mentor if specified
          if (mId) {
            await tx.groupMentorAssignment.create({
              data: {
                groupId: gId,
                mentorId: mId,
              },
            });
          }
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'BULK_ASSIGN_MENTORS',
          entityType: 'GROUP',
          details: `Admin melakukan bulk assignment pendamping untuk ${assignments.length} kelompok.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menyimpan penetapan pendamping untuk ${assignments.length} kelompok sekaligus!`,
      });
    }
    // 5. UPDATE MENTOR (edit email, password, name, phone)
    if (action === 'UPDATE_MENTOR') {
      const { mentorId, newFullName, newEmail, newPassword, newPhoneNumber } = body;
      if (!mentorId) {
        return NextResponse.json({ error: 'ID mentor tidak valid.' }, { status: 400 });
      }

      const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
      if (!mentor || mentor.role !== 'GROUP_MENTOR') {
        return NextResponse.json({ error: 'Akun mentor tidak ditemukan.' }, { status: 404 });
      }

      const updateData: any = {};
      if (newFullName) updateData.fullName = newFullName;
      if (newEmail && newEmail !== mentor.email) {
        const existing = await prisma.user.findUnique({ where: { email: newEmail } });
        if (existing && existing.id !== mentorId) {
          return NextResponse.json({ error: `Email "${newEmail}" sudah digunakan oleh akun lain.` }, { status: 400 });
        }
        updateData.email = newEmail;
      }
      if (newPassword) {
        updateData.passwordHash = await bcrypt.hash(newPassword, 10);
      }
      if (newPhoneNumber !== undefined) {
        updateData.phoneNumber = newPhoneNumber || null;
      }

      const updated = await prisma.user.update({
        where: { id: mentorId },
        data: updateData,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE_MENTOR',
          entityType: 'USER',
          entityId: mentorId,
          details: `Admin mengupdate data pendamping: ${updated.fullName} (${updated.email})${newPassword ? ' [password direset]' : ''}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Data pendamping ${updated.fullName} berhasil diperbarui!${newPassword ? ' Password telah direset.' : ''}`,
      });
    }

    // 6. DELETE MENTOR
    if (action === 'DELETE_MENTOR') {
      const { mentorId } = body;
      if (!mentorId) {
        return NextResponse.json({ error: 'ID mentor tidak valid.' }, { status: 400 });
      }

      const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
      if (!mentor || mentor.role !== 'GROUP_MENTOR') {
        return NextResponse.json({ error: 'Akun mentor tidak ditemukan.' }, { status: 404 });
      }

      // Remove all group assignments first
      await prisma.groupMentorAssignment.deleteMany({
        where: { mentorId },
      });

      // Delete the user
      await prisma.user.delete({
        where: { id: mentorId },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE_MENTOR',
          entityType: 'USER',
          entityId: mentorId,
          details: `Admin menghapus akun pendamping: ${mentor.fullName} (${mentor.email})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Akun pendamping ${mentor.fullName} (${mentor.email}) berhasil dihapus!`,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating admin groups:', error);
    return NextResponse.json({ error: 'Gagal memproses data kelompok/pendamping.' }, { status: 500 });
  }
}
