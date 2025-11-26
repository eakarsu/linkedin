import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Calculate profile completeness percentage
function calculateCompleteness(user: any): number {
  let score = 0;
  const maxScore = 100;

  // Basic info (40 points total)
  if (user.name) score += 10;
  if (user.email) score += 5;
  if (user.title) score += 10;
  if (user.location) score += 5;
  if (user.bio) score += 10;

  // Profile media (15 points total)
  if (user.avatar) score += 10;
  if (user.coverImage) score += 5;

  // Experience & Education (25 points total)
  const experience = user.experience as any[] || [];
  const education = user.education as any[] || [];
  if (experience.length > 0) score += 15;
  if (education.length > 0) score += 10;

  // Skills (10 points total)
  const skills = user.skills as any[] || [];
  if (skills.length >= 3) score += 10;
  else if (skills.length > 0) score += 5;

  // Additional sections (10 points total)
  const languages = user.languages as any[] || [];
  const certifications = user.certifications as any[] || [];
  const projects = user.projects as any[] || [];

  if (languages.length > 0) score += 3;
  if (certifications.length > 0) score += 4;
  if (projects.length > 0) score += 3;

  return Math.min(score, maxScore);
}

// GET /api/profile/completeness - Get profile completeness
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const completeness = calculateCompleteness(user);

    // Update the completeness in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileCompleteness: completeness },
    });

    // Get missing sections
    const missingSections = [];

    if (!user.title) missingSections.push('Add your job title');
    if (!user.location) missingSections.push('Add your location');
    if (!user.bio) missingSections.push('Add an about section');
    if (!user.avatar) missingSections.push('Add a profile photo');
    if (!user.coverImage) missingSections.push('Add a cover photo');

    const experience = user.experience as any[] || [];
    const education = user.education as any[] || [];
    const skills = user.skills as any[] || [];

    if (experience.length === 0) missingSections.push('Add work experience');
    if (education.length === 0) missingSections.push('Add education');
    if (skills.length < 3) missingSections.push('Add at least 3 skills');

    return NextResponse.json({
      completeness,
      missingSections,
      isComplete: completeness === 100,
    });
  } catch (error) {
    console.error('Profile completeness error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate profile completeness' },
      { status: 500 }
    );
  }
}
