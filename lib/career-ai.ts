import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdvisoryError, execution, providerResult } from './advisory-execution';

type Mode = 'resume-build' | 'job-match' | 'moderation';
const profileSelect = { id: true, name: true, title: true, location: true, bio: true, experience: true, education: true, skills: true, languages: true, projects: true, certifications: true } as const;
const providers: Record<Mode, string> = { 'resume-build': 'openrouter/resume-build', 'job-match': 'openrouter/job-match', moderation: 'openrouter/moderation' };
const profileHash = (profile: unknown) => crypto.createHash('sha256').update(JSON.stringify(profile)).digest('hex');
function hasEvidence(value: unknown, depth = 0): boolean {
  if (depth > 20 || value === null || value === undefined) return false;
  if (typeof value === 'string') return Boolean(value.trim());
  if (Array.isArray(value)) return value.some(item => hasEvidence(item, depth + 1));
  if (typeof value === 'object') return Object.values(value).some(item => hasEvidence(item, depth + 1));
  return typeof value === 'number' && Number.isFinite(value);
}
async function sessionId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && !(session.user as typeof session.user & { invalid?: boolean }).invalid ? session.user.id : null;
}
function stringField(value: unknown, name: string, max: number, required = false) {
  if (value !== undefined && value !== null && typeof value !== 'string') throw new AdvisoryError(`${name} must be text.`, 400);
  const result = typeof value === 'string' ? value.trim() : '';
  if (result.length > max || (required && !result)) throw new AdvisoryError(`${name} must contain ${required ? '1' : '0'} through ${max} characters.`, 400);
  return result;
}
function structuredAnswer(content: string) {
  const fenced = content.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  try { return JSON.parse(fenced ? fenced[1] : content); } catch { throw new AdvisoryError('The provider returned an invalid assessment. Try again.'); }
}
function stringList(value: unknown): value is string[] { return Array.isArray(value) && value.length <= 30 && value.every(item => typeof item === 'string' && item.length <= 2000); }
function assessment(mode: Mode, content: string) {
  if (mode === 'resume-build') return content;
  const value = structuredAnswer(content);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AdvisoryError('The provider returned an invalid assessment.');
  if (mode === 'job-match') {
    if (!Number.isFinite(value.score) || value.score < 0 || value.score > 100 || !stringList(value.strengths) || !stringList(value.gaps) || typeof value.tailoredBullet !== 'string' || value.tailoredBullet.length > 4000) throw new AdvisoryError('The provider returned an invalid job-match assessment.');
    return { score: value.score, strengths: value.strengths, gaps: value.gaps, tailoredBullet: value.tailoredBullet };
  }
  if (!Number.isFinite(value.toxicity) || value.toxicity < 0 || value.toxicity > 1 || !Number.isFinite(value.spam) || value.spam < 0 || value.spam > 1 || typeof value.allowed !== 'boolean' || !stringList(value.reasons)) throw new AdvisoryError('The provider returned an invalid moderation assessment.');
  return { toxicity: value.toxicity, spam: value.spam, allowed: value.allowed, reasons: value.reasons };
}
function savedReport(row: any) {
  const receipt = row.providerReceipt;
  return { id: row.id, prompt: row.prompt, input: receipt.input, content: row.content, model: row.model, createdAt: row.createdAt, mode: receipt.feature, appeal: receipt.appeal ?? null };
}
function moderationEvent(row: any) {
  const report = savedReport(row);
  return { ...report, text: report.input.text, postId: report.input.postId || undefined, verdict: JSON.parse(row.content), appealed: report.appeal?.status === 'pending', appealText: report.appeal?.text || undefined, appealStatus: report.appeal?.status === 'pending' ? 'pending' : undefined };
}

export function createCareerAI({ db = prisma, actorId = sessionId, providerFetch = fetch, timeout = 60_000 } = {}) {
  async function freshUser(id: string, tx = db) { return tx.user.findUnique({ where: { id }, select: profileSelect }); }
  async function lockUser(tx: typeof db, id: string) {
    // Parameterized native row locks keep the checked profile/identity stable through commit.
    await tx.$queryRawUnsafe('SELECT id FROM "User" WHERE id=$1 FOR SHARE', id);
    const fresh = await freshUser(id, tx);
    if (!fresh) throw new AdvisoryError('Unauthorized', 401);
    return fresh;
  }
  async function ownedPost(id: string, userId: string, tx = db) {
    const post = await tx.post.findFirst({ where: { id, authorId: userId }, select: { id: true, content: true } });
    if (!post) throw new AdvisoryError('Select one of your actual saved posts.', 404);
    return post;
  }
  async function generate(request: NextRequest, kind: 'resume' | 'moderation') {
    const job = execution(request.signal, timeout);
    try {
      const id = await actorId(), user = id ? await freshUser(id) : null;
      if (!id || !user) throw new AdvisoryError('Unauthorized', 401);
      job.check();
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AdvisoryError('Enter a valid request.', 400);
      let mode: Mode, input: Record<string, string>, post: { id: string; content: string } | null = null;
      if (kind === 'resume') {
        if (body.mode !== undefined && !['build', 'job-match'].includes(body.mode)) throw new AdvisoryError('mode must be build or job-match.', 400);
        mode = body.mode === 'job-match' ? 'job-match' : 'resume-build';
        input = { mode: mode === 'resume-build' ? 'build' : 'job-match', jobDescription: stringField(body.jobDescription, 'Job description', 12_000, mode === 'job-match') };
      } else {
        if (body.action !== undefined && body.action !== 'classify') return await appeal(body, id, job);
        mode = 'moderation';
        input = { action: 'classify', text: stringField(body.text, 'Content', 4000, true), postId: stringField(body.postId, 'Post', 100) };
        if (input.postId) {
          post = await ownedPost(input.postId, id);
          if (input.text !== post.content.trim()) throw new AdvisoryError('Linked content must match the actual saved post. Choose Draft content to assess revised text.', 409);
        }
      }
      job.check();
      const key = process.env.OPENROUTER_API_KEY, model = process.env.OPENROUTER_MODEL;
      if (!key || !model || process.env.OPENROUTER_BASE_URL?.replace(/\/$/, '') !== 'https://openrouter.ai/api/v1') throw new AdvisoryError('OpenRouter is not configured.', 503);
      const system = mode === 'resume-build'
        ? 'Write a clean ATS-friendly résumé in professional Markdown using only the saved profile. Do not invent skills, employers, qualifications, dates or achievements. Clearly mark missing evidence. An optional job description may guide emphasis, never create new facts.'
        : mode === 'job-match'
          ? 'Assess the actual saved candidate profile against the supplied job description. Return JSON {"score":number from 0 through 100,"strengths":[string],"gaps":[string],"tailoredBullet":string}. Treat missing profile evidence as a gap; never invent achievements. This is guidance, not a hiring decision.'
          : 'Assess content for toxicity and spam. Return JSON {"toxicity":number from 0 through 1,"spam":number from 0 through 1,"allowed":boolean,"reasons":[string]}. Explain uncertainty and need for human review. This advisory assessment does not publish, remove or restrict content.';
      const prompt = mode === 'moderation' ? input.text : `Saved candidate profile:\n${JSON.stringify(user)}\n\nJob description:\n${input.jobDescription || 'No job description supplied.'}`;
      const response = await providerFetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, temperature: mode === 'moderation' ? 0.1 : 0.4, max_tokens: mode === 'resume-build' ? 2000 : 1000, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }), signal: job.signal });
      const { content: raw, receipt } = providerResult(await response.json().catch(() => null), response, model);
      const output = assessment(mode, raw), content = typeof output === 'string' ? output : JSON.stringify(output);
      job.check();
      const result = await db.$transaction(async tx => {
        const fresh = await lockUser(tx as unknown as typeof db, id);
        if (mode !== 'moderation' && profileHash(fresh) !== profileHash(user)) throw new AdvisoryError('Your saved profile changed during this request. Review it and generate again.', 409);
        if (post) {
          await tx.$queryRawUnsafe('SELECT id FROM "Post" WHERE id=$1 AND "authorId"=$2 FOR SHARE', post.id, id);
          const current = await ownedPost(post.id, id, tx as unknown as typeof db);
          if (current.content !== post.content) throw new AdvisoryError('The saved post changed during this request. Review it and generate again.', 409);
        }
        job.check();
        const row = await tx.runtimeAiResult.create({ data: { id: crypto.randomUUID(), userId: id, provider: providers[mode], model: receipt.upstreamModel, prompt: mode === 'moderation' ? input.text : input.jobDescription || 'Résumé from my saved profile', content, providerReceipt: { ...receipt, feature: mode, input, ...(mode === 'moderation' ? { appeal: { version: 0, status: 'none', text: '' } } : { profileId: user.id, profileHash: profileHash(user) }) } } });
        job.check();
        if (!await freshUser(id, tx as unknown as typeof db)) throw new AdvisoryError('Unauthorized', 401);
        job.check();
        return row;
      });
      const report = savedReport(result);
      return NextResponse.json({ ...report, provider: 'openrouter', providerReceipt: receipt, ...(mode === 'resume-build' ? { resume: content } : mode === 'job-match' ? output as object : { verdict: output }) });
    } catch (error) {
      const failure = job.signal.aborted ? job.signal.reason : error;
      return NextResponse.json({ error: failure instanceof AdvisoryError ? failure.message : 'AI provider request failed. Try again.' }, { status: failure instanceof AdvisoryError ? failure.status : 502 });
    } finally { job.close(); }
  }
  async function appeal(body: any, userId: string, job: ReturnType<typeof execution>) {
    if (body.action === 'review-appeal') throw new AdvisoryError('Independent moderator authority is not configured. Appeals remain pending human review.', 403);
    if (body.action !== 'appeal') throw new AdvisoryError('Unknown moderation action.', 400);
    const eventId = stringField(body.eventId, 'Saved assessment', 100, true), text = stringField(body.appealText, 'Appeal', 4000, true);
    const result = await db.$transaction(async tx => {
      await lockUser(tx as unknown as typeof db, userId);
      await tx.$queryRawUnsafe('SELECT id FROM runtime_ai_results WHERE id=$1 AND "userId"=$2 AND provider=$3 FOR UPDATE', eventId, userId, providers.moderation);
      const row = await tx.runtimeAiResult.findFirst({ where: { id: eventId, userId, provider: providers.moderation } });
      if (!row) throw new AdvisoryError('Saved assessment not found.', 404);
      job.check();
      const receipt = row.providerReceipt as any;
      const updated = await tx.runtimeAiResult.update({ where: { id: row.id }, data: { providerReceipt: { ...receipt, appeal: { version: Number(receipt.appeal?.version || 0) + 1, status: 'pending', text, submittedAt: new Date().toISOString() } } } });
      job.check();
      return moderationEvent(updated);
    });
    return NextResponse.json({ ok: true, event: result });
  }
  async function history(request: NextRequest, kind: 'resume' | 'moderation') {
    try {
      const id = await actorId(), user = id ? await freshUser(id) : null;
      if (!id || !user) throw new AdvisoryError('Unauthorized', 401);
      const requested = new URL(request.url).searchParams.get('mode');
      if (kind === 'resume' && requested && !['build', 'job-match'].includes(requested)) throw new AdvisoryError('mode must be build or job-match.', 400);
      const filter = kind === 'moderation' ? [providers.moderation] : requested === 'job-match' ? [providers['job-match']] : requested === 'build' ? [providers['resume-build']] : [providers['resume-build'], providers['job-match']];
      const rows = await db.runtimeAiResult.findMany({ where: { userId: id, provider: { in: filter } }, orderBy: { createdAt: 'desc' }, take: 50 });
      const reports = rows.map(savedReport);
      const posts = kind === 'moderation' ? await db.post.findMany({ where: { authorId: id }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, content: true } }) : [];
      return NextResponse.json({ reports, ...(kind === 'moderation' ? { count: reports.length, events: rows.map(moderationEvent), posts } : { profile: { id: user.id, name: user.name, title: user.title, hasExperience: hasEvidence(user.experience), hasSkills: hasEvidence(user.skills) } }) });
    } catch (error) { return NextResponse.json({ error: error instanceof AdvisoryError ? error.message : 'Saved reports could not be loaded.' }, { status: error instanceof AdvisoryError ? error.status : 502 }); }
  }
  return {
    resume: { POST: (request: NextRequest) => generate(request, 'resume'), GET: (request: NextRequest) => history(request, 'resume') },
    moderation: { POST: (request: NextRequest) => generate(request, 'moderation'), GET: (request: NextRequest) => history(request, 'moderation') },
  };
}
