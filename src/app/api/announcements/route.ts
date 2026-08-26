import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Fetch active announcements (public for all authenticated users)
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: { fullName: true, role: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20,
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ announcements: [] });
  }
}

// POST: Create announcement (admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Admin yang dapat membuat pengumuman.' },
        { status: 403 }
      );
    }

    const { title, content, category, fileUrl, fileName, isPinned } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Judul dan isi pengumuman wajib diisi.' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category: category || 'PENGUMUMAN',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        isPinned: isPinned || false,
        authorId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dipublikasikan!',
      announcement,
    });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pengumuman.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove announcement (admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Admin yang dapat menghapus pengumuman.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID pengumuman tidak ditemukan.' }, { status: 400 });
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengumuman.' },
      { status: 500 }
    );
  }
}

// PUT: Update announcement (admin only)
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Admin yang dapat mengubah pengumuman.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, title, content, category, fileUrl, fileName, isPinned } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID pengumuman tidak ditemukan.' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Judul dan isi pengumuman wajib diisi.' },
        { status: 400 }
      );
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        category: category || 'PENGUMUMAN',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        isPinned: isPinned ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil diperbarui!',
      announcement: updatedAnnouncement,
    });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengumuman.' },
      { status: 500 }
    );
  }
}
