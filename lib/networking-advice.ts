import crypto from 'node:crypto';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdvisoryError, execution, providerResult } from './advisory-execution';

async function nativeActor() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as typeof session.user & { invalid?: boolean }).invalid) return null;
  return prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
}
export function createNetworkingAdvice({ db = prisma, actor = nativeActor, providerFetch = fetch } = {}) {
  async function GET() {
    const user = await actor();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const reports = await db.runtimeAiResult.findMany({ where: { userId: user.id, provider: 'openrouter' }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, prompt: true, content: true, model: true, createdAt: true } });
    return NextResponse.json({ reports });
  }
  async function POST(request: NextRequest) {
    const job = execution(request.signal);
    try {
      const user = await actor();
      if (!user) throw new AdvisoryError('Unauthorized', 401);
      job.check();
      const body = await request.json().catch(() => ({}));
      const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
      if (!prompt || prompt.length > 8000) throw new AdvisoryError('Prompt must contain 1 through 8000 characters', 400);
      const apiKey = process.env.OPENROUTER_API_KEY, model = process.env.OPENROUTER_MODEL, baseUrl = process.env.OPENROUTER_BASE_URL;
      if (!apiKey || !model || baseUrl?.replace(/\/$/, '') !== 'https://openrouter.ai/api/v1') throw new AdvisoryError('OpenRouter is not configured', 503);
      const response = await providerFetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, temperature: 0.2, messages: [{ role: 'system', content: 'You are a professional-networking reviewer. Return concise risks, evidence gaps, next actions, uncertainty, and decisions requiring human approval. Do not send outreach or claim an action was executed.' }, { role: 'user', content: prompt }] }), signal: job.signal });
      const { content, receipt } = providerResult(await response.json().catch(() => null), response, model);
      job.check();
      const result = await db.$transaction(async tx => {
        const fresh = await tx.user.findUnique({ where: { id: user.id }, select: { id: true } });
        if (!fresh) throw new AdvisoryError('Unauthorized', 401);
        job.check();
        const row = await tx.runtimeAiResult.create({ data: { id: crypto.randomUUID(), userId: user.id, prompt, content, provider: 'openrouter', model: receipt.upstreamModel, providerReceipt: receipt } });
        job.check(); return row;
      });
      return NextResponse.json({ id: result.id, content, provider: 'openrouter', model: receipt.upstreamModel, providerReceipt: receipt, createdAt: result.createdAt });
    } catch (error) {
      const failure = job.signal.aborted ? job.signal.reason : error;
      return NextResponse.json({ error: failure instanceof AdvisoryError ? failure.message : 'AI provider request failed' }, { status: failure instanceof AdvisoryError ? failure.status : 502 });
    } finally { job.close(); }
  }
  return { GET, POST };
}
