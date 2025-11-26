import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/connections/send - Send a connection request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Missing recipientId' },
        { status: 400 }
      );
    }

    if (recipientId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot connect with yourself' },
        { status: 400 }
      );
    }

    // Check if the recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if a connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: session.user.id, connectedId: recipientId },
          { userId: recipientId, connectedId: session.user.id },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists or is pending' },
        { status: 400 }
      );
    }

    // Create the connection request
    const connection = await prisma.connection.create({
      data: {
        userId: session.user.id,
        connectedId: recipientId,
        status: 'pending',
      },
    });

    // Create a notification for the recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        actorId: session.user.id,
        type: 'connection',
        content: `${session.user.name || 'Someone'} sent you a connection request`,
        link: `/network`,
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}
