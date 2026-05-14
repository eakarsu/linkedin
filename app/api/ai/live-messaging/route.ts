// Live messaging + voice/video signalling endpoints (WebRTC offer/answer/ICE relay).
// TODO: configure credentials for STUN/TURN servers if a private TURN is used.
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simple in-memory signalling store; replace with Redis pub/sub for production.
type Signal = { id: string; from: string; to: string; type: 'offer' | 'answer' | 'ice'; payload: any; at: number };
const queue: Signal[] = [];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { type, to, payload } = await req.json();
    if (!['offer', 'answer', 'ice'].includes(type)) {
      return NextResponse.json({ error: 'type must be offer|answer|ice' }, { status: 400 });
    }
    if (!to || !payload) return NextResponse.json({ error: 'to and payload required' }, { status: 400 });
    const sig: Signal = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      from: (session.user as any)?.id || 'anon',
      to,
      type,
      payload,
      at: Date.now()
    };
    queue.push(sig);
    return NextResponse.json({ ok: true, id: sig.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/ai/live-messaging?since=<ms> — long-poll style fetch of pending signals.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = (session.user as any)?.id || 'anon';
  const since = Number(req.nextUrl.searchParams.get('since')) || 0;
  const mine = queue.filter(s => s.to === me && s.at > since).slice(0, 50);
  const ice = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };
  return NextResponse.json({ signals: mine, ice });
}
