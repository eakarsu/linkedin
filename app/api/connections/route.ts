import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/connections - Get user's connections
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, accepted, rejected

    const where: any = {
      OR: [
        { userId: session.user.id },
        { connectedId: session.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const connections = await prisma.connection.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            avatar: true,
          },
        },
        connected: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Connections fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// POST /api/connections - Send connection request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { connectedId } = await request.json();

    if (!connectedId) {
      return NextResponse.json(
        { error: 'Missing connectedId' },
        { status: 400 }
      );
    }

    if (connectedId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot connect to yourself' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: session.user.id, connectedId },
          { userId: connectedId, connectedId: session.user.id },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      );
    }

    const connection = await prisma.connection.create({
      data: {
        userId: session.user.id,
        connectedId,
        status: 'pending',
      },
      include: {
        connected: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for the recipient
    await prisma.notification.create({
      data: {
        userId: connectedId,
        type: 'connection',
        content: `${session.user.name} sent you a connection request`,
        link: `/network`,
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Connection create error:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

// PATCH /api/connections - Accept/reject connection request
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { connectionId, status } = await request.json();

    if (!connectionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify the connection request is for the current user
    const existingConnection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existingConnection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (existingConnection.connectedId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this connection' },
        { status: 403 }
      );
    }

    const connection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            avatar: true,
          },
        },
        connected: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for the requester
    if (status === 'accepted') {
      await prisma.notification.create({
        data: {
          userId: existingConnection.userId,
          type: 'connection',
          content: `${session.user.name} accepted your connection request`,
          link: `/profile/${session.user.id}`,
        },
      });
    }

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Connection update error:', error);
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}

// DELETE /api/connections - Remove connection
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Missing connectionId' },
        { status: 400 }
      );
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Verify the current user is part of this connection
    if (
      connection.userId !== session.user.id &&
      connection.connectedId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this connection' },
        { status: 403 }
      );
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Connection delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}
