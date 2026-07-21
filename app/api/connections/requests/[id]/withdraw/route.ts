import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { idempotencyKey, workflowError, workflowJson } from '@/lib/connection-api';
import { withdrawConnectionRequest } from '@/lib/governed-connections';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json() as { expectedVersion?: number };
    const result = await withdrawConnectionRequest(prisma, {
      actorId: session.user.id,
      connectionId: id,
      expectedVersion: body.expectedVersion ?? 0,
      idempotencyKey: idempotencyKey(request),
    });
    return workflowJson(result);
  } catch (error) {
    return workflowError(error, 'Connection request withdrawal failed');
  }
}
