import { randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { processSalesOutbox } from '@/lib/governed-sales';
import { createSalesConnectorAdapter } from '@/lib/sales-connectors';
import prisma from '@/lib/prisma';

function sameToken(left: string | null, right: string) {
  if (!left?.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(left.slice(7));
  const expected = Buffer.from(right);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const token = process.env.SALES_WORKER_TOKEN?.trim() ?? '';
  if (token.length < 32) {
    return NextResponse.json({ error: 'Worker is not configured', code: 'WORKER_NOT_CONFIGURED' }, { status: 503 });
  }
  if (!sameToken(request.headers.get('Authorization'), token)) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  try {
    const result = await processSalesOutbox(prisma, `http-worker:${randomUUID()}`, createSalesConnectorAdapter(prisma));
    return NextResponse.json({ processed: Boolean(result), result });
  } catch (error) {
    console.error('Sales worker failed', error);
    return NextResponse.json({ error: 'Worker failed', code: 'WORKER_FAILED' }, { status: 500 });
  }
}
