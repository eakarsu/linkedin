import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { recordProviderOptOut, SalesWorkflowError } from '@/lib/governed-sales';
import prisma from '@/lib/prisma';

function equalHex(left: string, right: string) {
  if (!/^[0-9a-f]{64}$/i.test(left) || !/^[0-9a-f]{64}$/i.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

export async function POST(request: Request, context: { params: Promise<{ provider: string }> }) {
  try {
    const { provider } = await context.params;
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(provider)) {
      throw new SalesWorkflowError(400, 'INVALID_PROVIDER', 'Provider is invalid');
    }
    const timestamp = request.headers.get('X-Sales-Timestamp') ?? '';
    const signature = request.headers.get('X-Sales-Signature') ?? '';
    const workspaceId = request.headers.get('X-Sales-Workspace') ?? '';
    const seconds = Number(timestamp);
    if (!Number.isInteger(seconds) || Math.abs(Date.now() - seconds * 1000) > 5 * 60_000) {
      throw new SalesWorkflowError(401, 'STALE_WEBHOOK', 'Webhook timestamp is invalid');
    }
    const secretName = `SALES_WEBHOOK_SECRET_${provider.toUpperCase().replace(/-/g, '_')}`;
    const secret = process.env[secretName];
    if (!secret || secret.length < 32) throw new SalesWorkflowError(503, 'WEBHOOK_NOT_CONFIGURED', 'Webhook is not configured');
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 64 * 1024) throw new SalesWorkflowError(413, 'WEBHOOK_TOO_LARGE', 'Webhook is too large');
    const expected = createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');
    if (!equalHex(signature, expected)) throw new SalesWorkflowError(401, 'INVALID_SIGNATURE', 'Webhook signature is invalid');
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new SalesWorkflowError(400, 'INVALID_JSON', 'Webhook body is invalid');
    }
    if (body.type !== 'CONTACT_OPTED_OUT') throw new SalesWorkflowError(400, 'INVALID_EVENT', 'Unsupported webhook event');
    const result = await recordProviderOptOut(prisma, {
      workspaceId,
      provider,
      providerEventId: String(body.eventId ?? ''),
      leadId: String(body.leadId ?? ''),
      channel: String(body.channel ?? ''),
      occurredAt: String(body.occurredAt ?? ''),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SalesWorkflowError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error('Sales webhook failed', error);
    return NextResponse.json({ error: 'Webhook failed', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
