import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const mutualConnections = Number(body.mutualConnections ?? 0);
  const sharedIndustries = Number(body.sharedIndustries ?? 0);
  const recentEngagements = Number(body.recentEngagements ?? 0);
  const profileCompleteness = Number(body.profileCompleteness ?? 0);
  const spamSignals = Number(body.spamSignals ?? 0);

  const score = Math.max(0, Math.min(100, Math.round(
    Math.min(30, mutualConnections * 3) +
    Math.min(20, sharedIndustries * 7) +
    Math.min(25, recentEngagements * 5) +
    profileCompleteness * 0.25 -
    spamSignals * 12
  )));

  return NextResponse.json({
    feature: 'network_fit_score',
    score,
    level: score >= 75 ? 'high-fit' : score >= 45 ? 'review' : 'low-fit',
    suggestions: [
      mutualConnections < 3 && 'Add context from shared connections before sending an invite.',
      recentEngagements < 2 && 'Engage with recent posts before outreach.',
      profileCompleteness < 70 && 'Improve profile completeness before scaling connection requests.',
      spamSignals > 0 && 'Reduce generic or repeated outreach patterns.',
    ].filter(Boolean),
  });
}
