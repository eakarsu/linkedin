import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { workflowError } from '@/lib/connection-api';
import { verifyConnectionAudit } from '@/lib/governed-connections';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { id } = await params;
    return NextResponse.json(await verifyConnectionAudit(prisma, session.user.id, id));
  } catch (error) {
    return workflowError(error, 'Connection audit read failed');
  }
}
