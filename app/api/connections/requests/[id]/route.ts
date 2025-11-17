import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// PUT /api/connections/requests/[id] - Accept or reject connection request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: requestId } = await params;
    const { action } = await request.json();

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Verify the connection request exists and is for the current user
    const connectionRequest = await prisma.connection.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!connectionRequest) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      );
    }

    if (connectionRequest.connectedId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this connection request' },
        { status: 403 }
      );
    }

    // Update the connection status
    const status = action === 'accept' ? 'accepted' : 'rejected';
    const updatedConnection = await prisma.connection.update({
      where: { id: requestId },
      data: { status },
    });

    // Create notification for the requester if accepted
    if (action === 'accept') {
      await prisma.notification.create({
        data: {
          userId: connectionRequest.userId,
          type: 'connection',
          content: `${session.user.name} accepted your connection request`,
          link: `/profile/${session.user.id}`,
        },
      });
    }

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error('Connection request update error:', error);
    return NextResponse.json(
      { error: 'Failed to update connection request' },
      { status: 500 }
    );
  }
}
