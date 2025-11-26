import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/connections/status?userId=xxx - Check connection status with a user
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Check if there's a connection between the current user and the target user
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: session.user.id, connectedId: userId },
          { userId: userId, connectedId: session.user.id },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json({ status: 'none' });
    }

    if (connection.status === 'accepted') {
      return NextResponse.json({ status: 'connected' });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    console.error('Error checking connection status:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}
