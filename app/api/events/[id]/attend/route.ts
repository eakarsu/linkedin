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
    const body = await request.json();
    const { status } = body;

    // Check if already attending
    const existing = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Update status
      const updated = await prisma.eventAttendee.update({
        where: {
          eventId_userId: {
            eventId: id,
            userId: user.id,
          },
        },
        data: { status },
      });
      return NextResponse.json(updated);
    }

    // Create new attendance
    const attendance = await prisma.eventAttendee.create({
      data: {
        eventId: id,
        userId: user.id,
        status: status || 'going',
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing attendance:', error);
    return NextResponse.json({ error: 'Failed to remove attendance' }, { status: 500 });
  }
}
