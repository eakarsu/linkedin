// Feed ranking and "people you may know" recommendation services with embeddings.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Quick token-overlap "embedding" — replace with a real embeddings call when available.
function tokens(s: string): Set<string> {
  return new Set((s || '').toLowerCase().match(/[a-z0-9]+/g) || []);
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any)?.id;
  try {
    const me = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    const myInterests = tokens(`${me?.title || ''} ${me?.bio || ''}`);

    const posts: any[] = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { author: { select: { id: true, name: true, title: true, avatar: true } } } as any
    }).catch(() => []);

    const ranked = posts.map((p: any) => {
      const postTok = tokens(`${p.content || ''} ${p.author?.title || ''}`);
      const interest = similarity(myInterests, postTok);
      const recencyHrs = (Date.now() - new Date(p.createdAt).getTime()) / 3600000;
      const recency = Math.max(0, 1 - recencyHrs / 168); // decay over a week
      const score = 0.7 * interest + 0.3 * recency;
      return { ...p, _score: Number(score.toFixed(4)) };
    }).sort((a: any, b: any) => b._score - a._score);

    return NextResponse.json({ count: ranked.length, posts: ranked.slice(0, 25) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET people-you-may-know list
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });

  try {
    const me: any = await prisma.user.findUnique({ where: { id: userId } });
    const myTok = tokens(`${me?.title || ''} ${me?.bio || ''}`);
    const candidates: any[] = await prisma.user.findMany({
      where: { NOT: { id: userId } },
      take: 200,
      select: { id: true, name: true, title: true, avatar: true, bio: true } as any
    }).catch(() => []);
    const ranked = candidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      avatar: c.avatar,
      score: similarity(myTok, tokens(`${c.title || ''} ${c.bio || ''}`))
    })).sort((a, b) => b.score - a.score).slice(0, 20);
    return NextResponse.json({ suggestions: ranked });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
