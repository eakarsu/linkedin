import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/search - Search for users, posts, and jobs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // users, posts, jobs, all

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results: any = {
      users: [],
      posts: [],
      jobs: [],
    };

    // Search users
    if (!type || type === 'users' || type === 'all') {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
          location: true,
          avatar: true,
        },
        take: 20,
      });
    }

    // Search posts
    if (!type || type === 'posts' || type === 'all') {
      results.posts = await prisma.post.findMany({
        where: {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              title: true,
              avatar: true,
            },
          },
          likes: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });
    }

    // Search jobs
    if (!type || type === 'jobs' || type === 'all') {
      results.jobs = await prisma.job.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              company: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              location: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });
    }

    // If specific type requested, return only that type
    if (type && type !== 'all') {
      return NextResponse.json(results[type]);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
