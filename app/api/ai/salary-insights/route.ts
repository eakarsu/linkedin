// Salary / compensation insights with privacy-preserving aggregation.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Privacy: never return individual rows; require >= 5 samples per bucket.
const MIN_BUCKET = 5;

// In-memory submissions; in production, store hashed identifiers only.
const submissions: { role: string; location: string; yoe: number; salary: number; at: number }[] = [];

function percentile(arr: number[], p: number) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length * p)];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { role, location, yearsExperience, salary } = await req.json();
    if (!role || salary == null) return NextResponse.json({ error: 'role and salary required' }, { status: 400 });
    submissions.push({
      role: String(role).toLowerCase(),
      location: String(location || 'global').toLowerCase(),
      yoe: Math.max(0, Math.min(50, Number(yearsExperience) || 0)),
      salary: Math.max(0, Number(salary)),
      at: Date.now()
    });
    return NextResponse.json({ ok: true, totalSubmissions: submissions.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = req.nextUrl.searchParams;
  const role = (params.get('role') || '').toLowerCase();
  const location = (params.get('location') || '').toLowerCase();
  const bucket = submissions.filter(s =>
    (!role || s.role === role) && (!location || s.location === location)
  );
  if (bucket.length < MIN_BUCKET) {
    return NextResponse.json({
      role,
      location,
      count: bucket.length,
      privacyMinimum: MIN_BUCKET,
      note: `Not enough samples (need ${MIN_BUCKET})`
    });
  }
  const sal = bucket.map(b => b.salary);
  return NextResponse.json({
    role,
    location,
    count: bucket.length,
    p10: percentile(sal, 0.1),
    median: percentile(sal, 0.5),
    p90: percentile(sal, 0.9),
    note: 'Aggregated, no individual records returned.'
  });
}
