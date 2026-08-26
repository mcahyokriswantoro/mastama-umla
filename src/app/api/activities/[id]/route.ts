import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const studentProfileId = user?.studentProfile?.id;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        journey: true,
        mission: true,
        submissions: {
          where: studentProfileId ? { studentId: studentProfileId } : undefined,
          include: {
            approvals: {
              include: {
                reviewer: {
                  select: { fullName: true, role: true },
                },
              },
              orderBy: { reviewedAt: 'desc' },
            },
          },
        },
        attendances: {
          where: studentProfileId ? { studentId: studentProfileId } : undefined,
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Aktivitas tidak ditemukan.' }, { status: 404 });
    }

    const submission = studentProfileId ? activity.submissions?.[0] : null;
    const attendance = studentProfileId ? activity.attendances?.[0] : null;

    return NextResponse.json({
      activity: {
        id: activity.id,
        code: activity.code,
        title: activity.title,
        subtitle: activity.subtitle,
        description: activity.description,
        bannerImage: activity.bannerImage,
        date: activity.date.toISOString(),
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location,
        mode: activity.mode,
        picName: activity.picName,
        picContact: activity.picContact,
        onlineUrl: activity.onlineUrl,
        verificationType: activity.verificationType,
        xpReward: activity.xpReward,
        qrSecret: activity.qrSecret,
        journey: activity.journey,
        mission: activity.mission,
        currentSubmission: submission || null,
        currentAttendance: attendance || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Gagal memuat detail aktivitas.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat mengedit kegiatan.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      date,
      startTime,
      endTime,
      location,
      mode,
      onlineUrl,
      picName,
      verificationType,
      xpReward,
      bannerImage,
      qrSecret,
    } = body;

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        description: description !== undefined ? description : undefined,
        date: date ? new Date(date) : undefined,
        startTime: startTime !== undefined ? startTime : undefined,
        endTime: endTime !== undefined ? endTime : undefined,
        location: location !== undefined ? location : undefined,
        mode: mode !== undefined ? mode : undefined,
        onlineUrl: onlineUrl !== undefined ? onlineUrl : undefined,
        picName: picName !== undefined ? picName : undefined,
        verificationType: verificationType !== undefined ? verificationType : undefined,
        xpReward: xpReward !== undefined ? parseInt(xpReward) : undefined,
        bannerImage: bannerImage !== undefined ? bannerImage : undefined,
        qrSecret: qrSecret !== undefined ? qrSecret : undefined,
      },
    });

    // Log Audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_ACTIVITY',
        entityType: 'ACTIVITY',
        entityId: id,
        details: `Admin ${user.fullName} memperbarui kegiatan: ${updatedActivity.title} (${updatedActivity.code})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kegiatan ${updatedActivity.title} berhasil diperbarui!`,
      activity: updatedActivity,
    });
  } catch (error: any) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kegiatan.' }, { status: 500 });
  }
}
