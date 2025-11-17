import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST /api/posts/[id]/save - Save/unsave a post (toggle)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get user's saved posts
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { savedPosts: true },
    });

    const savedPosts = (user?.savedPosts as string[]) || [];
    const isSaved = savedPosts.includes(postId);

    // Toggle save state
    const newSavedPosts = isSaved
      ? savedPosts.filter(id => id !== postId)
      : [...savedPosts, postId];

    // Update user's saved posts
    await prisma.user.update({
      where: { id: session.user.id },
      data: { savedPosts: newSavedPosts },
    });

    return NextResponse.json({
      saved: !isSaved,
      message: isSaved ? 'Post unsaved' : 'Post saved'
    });
  } catch (error) {
    console.error('Save post error:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}
