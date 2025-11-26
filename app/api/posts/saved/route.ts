import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/posts/saved - Get user's saved posts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's saved posts
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { savedPosts: true },
    });

    const savedPostIds = (user?.savedPosts as string[]) || [];

    if (savedPostIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch the saved posts
    const posts = await prisma.post.findMany({
      where: {
        id: {
          in: savedPostIds,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Saved posts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}
