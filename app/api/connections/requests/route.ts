import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/connections/requests - Get pending connection requests for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get connection requests where current user is the recipient (connectedId)
    // and status is pending
    const requests = await prisma.connection.findMany({
      where: {
        connectedId: session.user.id,
        status: 'pending',
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to match the expected format
    const formattedRequests = requests.map((request) => ({
      id: request.id,
      sender: request.user,
      createdAt: request.createdAt,
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('Connection requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connection requests' },
      { status: 500 }
    );
  }
}
