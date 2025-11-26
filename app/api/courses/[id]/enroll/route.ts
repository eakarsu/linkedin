import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Check if already enrolled
    const existing = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    // Enroll in course
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId: id,
        userId: user.id,
        progress: 0,
        completed: false,
        lastWatched: new Date(),
      },
      include: {
        course: true,
      },
    });

    // Update student count
    await prisma.course.update({
      where: { id },
      data: {
        students: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}
