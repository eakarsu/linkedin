import { NextResponse } from 'next/server';
import { WorkflowError, type WorkflowResponse } from '@/lib/governed-connections';

export function idempotencyKey(request: Request): string {
  return request.headers.get('Idempotency-Key') ?? '';
}

export function workflowJson(result: WorkflowResponse): NextResponse {
  return NextResponse.json(result.body, { status: result.status });
}

export function workflowError(error: unknown, context: string): NextResponse {
  if (error instanceof WorkflowError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(context, error);
  return NextResponse.json(
    { error: 'The connection workflow could not complete', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}
