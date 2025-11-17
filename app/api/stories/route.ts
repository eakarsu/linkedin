import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/stories - Get active stories from connections
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: 'accepted' },
          { connectedId: session.user.id, status: 'accepted' },
        ],
      },
    });

    const connectedUserIds = new Set<string>();
    connections.forEach((conn) => {
      connectedUserIds.add(conn.userId);
      connectedUserIds.add(conn.connectedId);
    });
    connectedUserIds.add(session.user.id); // Include own stories

    // Get active stories (not expired)
    const now = new Date();
    const stories = await prisma.story.findMany({
      where: {
        userId: {
          in: Array.from(connectedUserIds),
        },
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group stories by user
    const storiesByUser = stories.reduce((acc: any, story) => {
      const userId = story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    return NextResponse.json(Object.values(storiesByUser));
  } catch (error) {
    console.error('Stories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST /api/stories - Create a new story
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { image, video, text } = await request.json();

    if (!image && !video && !text) {
      return NextResponse.json(
        { error: 'Story must have image, video, or text' },
        { status: 400 }
      );
    }

    // Stories expire in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        userId: session.user.id,
        image,
        video,
        text,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Story creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}
