// AI résumé builder + job-match scoring.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function callAI(messages: any[], max = 1500) {
  if (!OPENROUTER_API_KEY) {
    const e: any = new Error('OPENROUTER_API_KEY not configured'); e.status = 503; throw e;
  }
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages, max_tokens: max, temperature: 0.4 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

// POST /api/ai/resume-builder — build a résumé from profile.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { mode = 'build', jobDescription } = body;
    const userId = (session.user as any)?.id;
    const user: any = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    if (mode === 'build') {
      const sys = 'You generate a clean ATS-friendly résumé from a user profile. Output Markdown.';
      const usr = `Profile:\n${JSON.stringify(user || {}, null, 2)}`;
      const out = await callAI([{ role: 'system', content: sys }, { role: 'user', content: usr }]);
      return NextResponse.json({ resume: out });
    }

    if (mode === 'job-match') {
      if (!jobDescription) return NextResponse.json({ error: 'jobDescription required' }, { status: 400 });
      const sys = 'You score a candidate vs a job description. Return JSON {"score":0-100,"strengths":[string],"gaps":[string],"tailoredBullet":string}.';
      const usr = `Candidate: ${JSON.stringify(user || {})}\n\nJob:\n${jobDescription}`;
      const out = await callAI([{ role: 'system', content: sys }, { role: 'user', content: usr }], 800);
      let parsed: any;
      try { parsed = JSON.parse(out.match(/\{[\s\S]*\}/)[0]); } catch { parsed = { raw: out }; }
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'mode must be build|job-match' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}
