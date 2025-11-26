import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: true,
      },
      orderBy: {
        lastWatched: 'desc',
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching my learning:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
