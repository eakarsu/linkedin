import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { idempotencyKey, workflowError, workflowJson } from '@/lib/connection-api';
import { setOutreachPreference } from '@/lib/governed-connections';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const preference = await prisma.outreachPreference.findUnique({
    where: { userId: session.user.id },
    select: {
      allowConnectionRequests: true,
      suppressionReason: true,
      suppressedAt: true,
      version: true,
    },
  });
  return NextResponse.json({
    preference: preference ?? {
      allowConnectionRequests: true,
      suppressionReason: null,
      suppressedAt: null,
      version: 0,
    },
  });
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const body = await request.json() as {
      allowConnectionRequests?: boolean;
      suppressionReason?: string;
      expectedVersion?: number;
    };
    const result = await setOutreachPreference(prisma, {
      actorId: session.user.id,
      allowConnectionRequests: body.allowConnectionRequests as boolean,
      suppressionReason: body.suppressionReason,
      expectedVersion: body.expectedVersion ?? -1,
      idempotencyKey: idempotencyKey(request),
    });
    return workflowJson(result);
  } catch (error) {
    return workflowError(error, 'Connection preference update failed');
  }
}
