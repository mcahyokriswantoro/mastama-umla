import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { role, email } = await request.json();

    let targetEmail = email;
    if (!targetEmail) {
      if (role === 'ADMIN') targetEmail = 'admin@umla.ac.id';
      else if (role === 'GROUP_MENTOR') targetEmail = 'mentor1@umla.ac.id';
      else if (role === 'STUDENT') targetEmail = 'student@umla.ac.id';
      else targetEmail = 'student@umla.ac.id';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User demo tidak ditemukan.' }, { status: 404 });
    }

    const token = signToken({ userId: user.id, role: user.role });

    const response = NextResponse.json({
      success: true,
      message: `Beralih ke role ${user.role} (${user.fullName})`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set('umla_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Role switch error:', error);
    return NextResponse.json(
      { error: 'Gagal beralih role.' },
      { status: 500 }
    );
  }
}
