import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {
  applyEnrichment,
  handoffLead,
  ingestCrmLead,
  recordCalendarEngagement,
  recordConsent,
  recordSuppression,
  requestOutreach,
  reviewOutreach,
  salesDashboard,
  SalesWorkflowError,
  transitionLead,
  verifySalesAudit,
} from '@/lib/governed-sales';
import prisma from '@/lib/prisma';

type SalesAction = 'INGEST_CRM' | 'CONSENT' | 'SUPPRESS' | 'ENRICH' | 'CALENDAR'
  | 'TRANSITION' | 'HANDOFF' | 'REQUEST_OUTREACH' | 'REVIEW_OUTREACH';

async function principal(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new SalesWorkflowError(401, 'UNAUTHORIZED', 'Sign in is required');
  const workspaceId = request.headers.get('X-Sales-Workspace')?.trim();
  if (!workspaceId) throw new SalesWorkflowError(400, 'WORKSPACE_REQUIRED', 'X-Sales-Workspace is required');
  return { userId: session.user.id, workspaceId };
}

function failure(error: unknown) {
  if (error instanceof SalesWorkflowError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error('Governed sales operation failed', error);
  return NextResponse.json({ error: 'Sales operation failed', code: 'INTERNAL_ERROR' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const actor = await principal(request);
    const url = new URL(request.url);
    const result = url.searchParams.get('view') === 'audit'
      ? await verifySalesAudit(prisma, actor)
      : await salesDashboard(prisma, actor);
    return NextResponse.json(result);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await principal(request);
    const body = await request.json() as { action?: SalesAction; payload?: unknown };
    const payload = (body.payload ?? {}) as never;
    let result: unknown;
    switch (body.action) {
      case 'INGEST_CRM':
        result = await ingestCrmLead(prisma, actor, payload);
        break;
      case 'CONSENT':
        result = await recordConsent(prisma, actor, payload);
        break;
      case 'SUPPRESS':
        result = await recordSuppression(prisma, actor, payload);
        break;
      case 'ENRICH':
        result = await applyEnrichment(prisma, actor, payload);
        break;
      case 'CALENDAR':
        result = await recordCalendarEngagement(prisma, actor, payload);
        break;
      case 'TRANSITION':
        result = await transitionLead(prisma, actor, payload);
        break;
      case 'HANDOFF':
        result = await handoffLead(prisma, actor, payload);
        break;
      case 'REQUEST_OUTREACH':
        result = await requestOutreach(prisma, actor, payload);
        break;
      case 'REVIEW_OUTREACH':
        result = await reviewOutreach(prisma, actor, payload);
        break;
      default:
        throw new SalesWorkflowError(400, 'INVALID_ACTION', 'Unsupported sales action');
    }
    return NextResponse.json(result);
  } catch (error) {
    return failure(error);
  }
}
