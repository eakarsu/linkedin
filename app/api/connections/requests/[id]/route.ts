import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { idempotencyKey, workflowError, workflowJson } from '@/lib/connection-api';
import { decideConnectionRequest } from '@/lib/governed-connections';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json() as { action?: string; expectedVersion?: number };
    if (body.action !== 'accept' && body.action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be accept or reject', code: 'INVALID_ACTION' },
        { status: 400 },
      );
    }
    const result = await decideConnectionRequest(prisma, {
      actorId: session.user.id,
      connectionId: id,
      action: body.action,
      expectedVersion: body.expectedVersion ?? 0,
      idempotencyKey: idempotencyKey(request),
    });
    return workflowJson(result);
  } catch (error) {
    return workflowError(error, 'Connection request decision failed');
  }
}
