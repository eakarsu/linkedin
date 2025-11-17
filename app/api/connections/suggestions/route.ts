import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/connections/suggestions - Get connection suggestions (people you may know)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get IDs of users already connected or with pending requests
    const existingConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { connectedId: session.user.id },
        ],
      },
      select: {
        userId: true,
        connectedId: true,
      },
    });

    const connectedUserIds = new Set<string>();
    existingConnections.forEach((conn) => {
      connectedUserIds.add(conn.userId);
      connectedUserIds.add(conn.connectedId);
    });
    connectedUserIds.add(session.user.id); // Exclude self

    // Get users not connected
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: Array.from(connectedUserIds),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        avatar: true,
        location: true,
        _count: {
          select: {
            connections: true,
          },
        },
      },
      take: 10, // Limit to 10 suggestions
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Connection suggestions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connection suggestions' },
      { status: 500 }
    );
  }
}
