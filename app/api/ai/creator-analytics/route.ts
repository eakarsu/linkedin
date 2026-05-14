// Creator analytics dashboard (impressions, dwell time, reactions over time).
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory metrics store; replace with PostImpression / PostView models when migration allowed.
type Impression = { postId: string; viewerId?: string; dwellMs: number; at: number };
const impressions: Impression[] = [];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { postId, dwellMs } = await req.json();
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });
    impressions.push({
      postId,
      viewerId: (session.user as any)?.id,
      dwellMs: Math.max(0, Math.min(60000, Number(dwellMs) || 0)),
      at: Date.now()
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'no user' }, { status: 400 });

  try {
    const myPosts: any[] = await prisma.post.findMany({ where: { authorId: userId }, take: 50 }).catch(() => []);
    const ids = new Set(myPosts.map((p: any) => p.id));
    const mine = impressions.filter(i => ids.has(i.postId));
    const byPost: Record<string, { count: number; avgDwellMs: number }> = {};
    for (const i of mine) {
      const b = byPost[i.postId] || { count: 0, avgDwellMs: 0 };
      b.avgDwellMs = (b.avgDwellMs * b.count + i.dwellMs) / (b.count + 1);
      b.count++;
      byPost[i.postId] = b;
    }
    const last7d = mine.filter(i => Date.now() - i.at < 7 * 86400000);
    return NextResponse.json({
      totalPosts: myPosts.length,
      totalImpressions: mine.length,
      impressionsLast7d: last7d.length,
      perPost: byPost
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
