import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const status = new URL(request.url).searchParams.get('status');
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ userId: session.user.id }, { connectedId: session.user.id }],
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        status: true,
        purpose: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, title: true, avatar: true } },
        connected: { select: { id: true, name: true, email: true, title: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(connections);
  } catch (error) {
    console.error('Connections fetch failed', error);
    return NextResponse.json({ error: 'Failed to fetch connections', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

function governedMutationOnly() {
  return NextResponse.json(
    {
      error: 'Use the governed /api/connections/send and /api/connections/requests endpoints',
      code: 'LEGACY_MUTATION_DISABLED',
    },
    { status: 410, headers: { Allow: 'GET' } },
  );
}

export const POST = governedMutationOnly;
export const PATCH = governedMutationOnly;
export const DELETE = governedMutationOnly;
