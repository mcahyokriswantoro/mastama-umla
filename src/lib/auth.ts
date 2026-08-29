import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';
import { UserSession } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'mastama-umla-super-secret-key-2026';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('umla_auth_token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: {
          include: {
            faculty: true,
            studyProgram: true,
            group: {
              include: {
                mentorAssignments: {
                  include: {
                    mentor: true,
                  },
                },
              },
            },
          },
        },
        mentorAssignments: {
          include: {
            group: {
              include: {
                students: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) return null;

    const mentorName = user.studentProfile?.group?.mentorAssignments?.[0]?.mentor?.fullName || undefined;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      studentProfile: user.studentProfile
        ? {
            id: user.studentProfile.id,
            nim: user.studentProfile.nim,
            faculty: user.studentProfile.faculty
              ? {
                  id: user.studentProfile.faculty.id,
                  name: user.studentProfile.faculty.name,
                  code: user.studentProfile.faculty.code,
                }
              : null,
            studyProgram: user.studentProfile.studyProgram
              ? {
                  id: user.studentProfile.studyProgram.id,
                  name: user.studentProfile.studyProgram.name,
                  code: user.studentProfile.studyProgram.code,
                }
              : null,
            group: user.studentProfile.group
              ? {
                  id: user.studentProfile.group.id,
                  name: user.studentProfile.group.name,
                  number: user.studentProfile.group.number,
                  mentor: mentorName,
                }
              : null,
            totalXp: user.studentProfile.totalXp,
            streakCount: user.studentProfile.streakCount,
          }
        : null,
      mentorGroups: user.mentorAssignments?.map((ma) => ({
        id: ma.group.id,
        number: ma.group.number,
        name: ma.group.name,
        capacity: ma.group.capacity,
        memberCount: ma.group.students.length,
      })),
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
