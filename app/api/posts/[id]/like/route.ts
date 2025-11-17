import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST /api/posts/[id]/like - Like/react to a post (toggle or change reaction)
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

    const { type } = await request.json();
    const reactionType = type || 'like'; // Default to 'like' if no type provided
    const validTypes = ['like', 'celebrate', 'support', 'love', 'insightful', 'curious'];

    if (!validTypes.includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    const postId = params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      // If same reaction type, unlike (remove)
      if (existingLike.type === reactionType) {
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        return NextResponse.json({
          liked: false,
          type: null,
          message: 'Reaction removed',
        });
      } else {
        // Change reaction type
        const updatedLike = await prisma.like.update({
          where: {
            id: existingLike.id,
          },
          data: {
            type: reactionType,
          },
        });

        return NextResponse.json({
          liked: true,
          type: reactionType,
          message: 'Reaction updated',
        });
      }
    } else {
      // Create new reaction
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
          type: reactionType,
        },
      });

      // Create notification for post author (if not liking own post)
      if (post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'like',
            content: `${session.user.name} liked your post`,
            link: `/post/${postId}`,
          },
        });
      }

      return NextResponse.json({
        liked: true,
        type: reactionType,
        message: 'Reaction added',
      });
    }
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json(
      { error: 'Failed to react to post' },
      { status: 500 }
    );
  }
}
