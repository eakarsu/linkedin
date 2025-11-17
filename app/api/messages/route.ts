import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/messages - Get conversations or messages with a specific user
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
    const otherUserId = searchParams.get('userId');

    if (otherUserId) {
      // Get messages with a specific user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json(messages);
    } else {
      // Get list of conversations
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              title: true,
            },
          },
          receiver: {
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

      // Group by conversation partner
      const conversations = new Map();

      messages.forEach((message) => {
        const partnerId = message.senderId === session.user.id
          ? message.receiverId
          : message.senderId;

        const partner = message.senderId === session.user.id
          ? message.receiver
          : message.sender;

        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        if (!message.read && message.receiverId === session.user.id) {
          const conv = conversations.get(partnerId);
          conv.unreadCount += 1;
        }
      });

      return NextResponse.json(Array.from(conversations.values()));
    }
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a message
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'message',
        content: `${session.user.name} sent you a message`,
        link: `/messaging?userId=${session.user.id}`,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { senderId } = await request.json();

    if (!senderId) {
      return NextResponse.json(
        { error: 'Missing senderId' },
        { status: 400 }
      );
    }

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Messages update error:', error);
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    );
  }
}
