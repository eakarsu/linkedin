import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const courses = await prisma.course.findMany({
      where: category && category !== 'All' ? { category } : undefined,
      orderBy: {
        rating: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, instructor, duration, level, category, price, isFree } = body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor,
        duration,
        level,
        category,
        price: price || 0,
        isFree: isFree || false,
        thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
