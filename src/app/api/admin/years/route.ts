import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses khusus Administrator.' }, { status: 403 });
    }

    const years = await prisma.mastamaYear.findMany({
      orderBy: { year: 'desc' },
      include: {
        _count: {
          select: {
            students: true,
            groups: true,
            journeys: true,
          },
        },
      },
    });

    return NextResponse.json({ years });
  } catch (error: any) {
    console.error('Error fetching mastama years:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar tahun MASTAMA.' }, { status: 500 });
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

    // 1. CREATE NEW MASTAMA YEAR
    if (action === 'CREATE_YEAR') {
      const { year, name, groupAssignMode, setActive, copyJourneysFromYearId } = body;
      const parsedYear = parseInt(year);

      if (!parsedYear || isNaN(parsedYear)) {
        return NextResponse.json({ error: 'Tahun tidak valid (harus angka, misal: 2027).' }, { status: 400 });
      }

      const existing = await prisma.mastamaYear.findUnique({
        where: { year: parsedYear },
      });

      if (existing) {
        return NextResponse.json({ error: `Tahun Ajaran ${parsedYear} sudah terdaftar.` }, { status: 400 });
      }

      // If set active, mark all others inactive
      if (setActive) {
        await prisma.mastamaYear.updateMany({
          data: { isActive: false },
        });
      }

      const newYear = await prisma.mastamaYear.create({
        data: {
          year: parsedYear,
          name: name || `MASTAMA UMLA ${parsedYear}`,
          groupAssignMode: groupAssignMode || 'ADMIN_ASSIGN',
          isActive: setActive !== undefined ? Boolean(setActive) : true,
        },
      });

      // Optionally copy journeys & activities structure from an existing year
      if (copyJourneysFromYearId) {
        const sourceJourneys = await prisma.journey.findMany({
          where: { mastamaYearId: copyJourneysFromYearId },
          include: {
            activities: true,
          },
        });

        for (const j of sourceJourneys) {
          const createdJourney = await prisma.journey.create({
            data: {
              mastamaYearId: newYear.id,
              code: `${j.code}_${parsedYear}`,
              title: j.title,
              subtitle: j.subtitle,
              targetDate: new Date(`${parsedYear}-09-01T00:00:00.000Z`),
              mode: j.mode,
              location: j.location,
              orderNum: j.orderNum,
              isUnlocked: j.isUnlocked,
              icon: j.icon,
            },
          });

          for (const a of j.activities) {
            await prisma.activity.create({
              data: {
                journeyId: createdJourney.id,
                code: `${a.code}_${parsedYear}`,
                title: a.title,
                subtitle: a.subtitle,
                description: a.description,
                bannerImage: a.bannerImage,
                date: new Date(`${parsedYear}-09-01T00:00:00.000Z`),
                startTime: a.startTime,
                endTime: a.endTime,
                location: a.location,
                mode: a.mode,
                picName: a.picName,
                picContact: a.picContact,
                onlineUrl: a.onlineUrl,
                verificationType: a.verificationType,
                xpReward: a.xpReward,
                isActive: a.isActive,
                orderNum: a.orderNum,
              },
            });
          }
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_YEAR',
          entityType: 'MASTAMA_YEAR',
          entityId: newYear.id,
          details: `Admin membuat Tahun Ajaran MASTAMA baru: ${newYear.name} (${newYear.year})${setActive ? ' [Aktif]' : ''}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tahun Ajaran ${parsedYear} berhasil dibuat!`,
        year: newYear,
      });
    }

    // 2. TOGGLE ACTIVE YEAR
    if (action === 'SET_ACTIVE_YEAR') {
      const { yearId } = body;
      if (!yearId) {
        return NextResponse.json({ error: 'ID tahun tidak valid.' }, { status: 400 });
      }

      await prisma.mastamaYear.updateMany({
        data: { isActive: false },
      });

      const updated = await prisma.mastamaYear.update({
        where: { id: yearId },
        data: { isActive: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CONFIG_CHANGE',
          entityType: 'MASTAMA_YEAR',
          entityId: yearId,
          details: `Admin mengaktifkan Tahun Ajaran: ${updated.name} (${updated.year}) sebagai tahun utama.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tahun Ajaran ${updated.year} sekarang berstatus AKTIF.`,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing mastama year:', error);
    return NextResponse.json({ error: error?.message || 'Gagal memproses tahun MASTAMA.' }, { status: 500 });
  }
}
