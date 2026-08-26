import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token dan password diperlukan' }, { status: 400 });
    }

    // Hash token untuk dicocokkan dengan yang ada di DB
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Cari user dengan token yang cocok dan expiry belum lewat
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          gt: new Date(), // Token masih berlaku (expire di masa depan)
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid atau telah kedaluwarsa' }, { status: 400 });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password dan hapus token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ message: 'Password berhasil diubah. Silakan masuk dengan password baru Anda.' });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mereset password.' }, { status: 500 });
  }
}
