import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const requests = await prisma.connection.findMany({
      where: {
        connectedId: session.user.id,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        purpose: true,
        message: true,
        version: true,
        expiresAt: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, title: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests.map((item) => ({
      id: item.id,
      sender: item.user,
      purpose: item.purpose,
      message: item.message,
      version: item.version,
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
    })));
  } catch (error) {
    console.error('Connection requests fetch failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch connection requests', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
