import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Untuk keamanan, kita tetap memberikan respons sukses meskipun email tidak ditemukan.
      return NextResponse.json({ message: 'Jika email terdaftar, tautan reset telah dikirim.' });
    }

    // Generate token acak
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token untuk disimpan di database (menghindari token bocor jika DB bocor)
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiry 1 jam dari sekarang
    const resetTokenExpires = new Date(Date.now() + 3600000);

    // Update user dengan token dan expiry
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: resetTokenExpires,
      },
    });

    // Buat Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Buat URL reset password. Dalam environment production gunakan URL asli
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    // Kirim email
    const mailOptions = {
      from: `"MASTAMA UMLA" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Pemulihan Akun / Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">Pemulihan Kata Sandi</h2>
          <p>Halo, ${user.fullName}</p>
          <p>Anda menerima email ini karena ada permintaan untuk mereset kata sandi pada akun MASTAMA UMLA Anda.</p>
          <p>Silakan klik tombol di bawah ini untuk mengatur ulang kata sandi Anda:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #f59e0b; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
          <p>Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Digital Student Passport - Universitas Muhammadiyah Lamongan</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Tautan reset telah dikirim ke email Anda.' });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memproses permintaan.' }, { status: 500 });
  }
}
