// Moderation pipeline (toxicity + spam) with appeal workflow.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

// In-memory moderation events; replace with ModerationEvent model when migration permitted.
type Event = {
  id: string;
  postId?: string;
  text: string;
  verdict: any;
  appealed?: boolean;
  appealText?: string;
  appealStatus?: string;
  createdAt: Date;
};
const events: Event[] = [];

async function classify(text: string) {
  if (!OPENROUTER_API_KEY) return { toxicity: 0, spam: 0, allowed: true, reasons: ['ai not configured'] };
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: 'Classify text. Return JSON {"toxicity":0-1,"spam":0-1,"allowed":bool,"reasons":[string]}.' },
        { role: 'user', content: text.slice(0, 4000) }
      ],
      max_tokens: 300,
      temperature: 0.1
    })
  });
  const d = await r.json();
  try { return JSON.parse(d.choices[0].message.content.match(/\{[\s\S]*\}/)[0]); }
  catch { return { toxicity: 0, spam: 0, allowed: true, reasons: ['parse failed'] }; }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { text, postId, action = 'classify', eventId, appealText } = await req.json();

    if (action === 'classify') {
      if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });
      const verdict = await classify(text);
      const id = `m_${Date.now()}`;
      events.push({ id, postId, text: text.slice(0, 500), verdict, createdAt: new Date() });
      return NextResponse.json({ id, verdict });
    }

    if (action === 'appeal') {
      if (!eventId || !appealText) return NextResponse.json({ error: 'eventId and appealText required' }, { status: 400 });
      const ev = events.find(e => e.id === eventId);
      if (!ev) return NextResponse.json({ error: 'event not found' }, { status: 404 });
      ev.appealed = true;
      ev.appealText = appealText;
      ev.appealStatus = 'pending';
      return NextResponse.json({ ok: true, event: ev });
    }

    if (action === 'review-appeal') {
      const ev = events.find(e => e.id === eventId);
      if (!ev) return NextResponse.json({ error: 'event not found' }, { status: 404 });
      const decision = req.headers.get('x-decision') || 'approve';
      ev.appealStatus = decision;
      return NextResponse.json({ ok: true, event: ev });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ count: events.length, events: events.slice(-100) });
}
