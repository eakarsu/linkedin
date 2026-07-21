import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { idempotencyKey, workflowError, workflowJson } from '@/lib/connection-api';
import { createConnectionRequest } from '@/lib/governed-connections';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const body = await request.json() as {
      recipientId?: string;
      purpose?: string;
      message?: string;
    };
    const result = await createConnectionRequest(prisma, {
      actorId: session.user.id,
      recipientId: body.recipientId ?? '',
      purpose: body.purpose,
      message: body.message,
      idempotencyKey: idempotencyKey(request),
    });
    return workflowJson(result);
  } catch (error) {
    return workflowError(error, 'Connection request creation failed');
  }
}
