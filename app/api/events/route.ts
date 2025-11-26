import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, location, eventUrl, startDate, endDate, companyId } = body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type: type || 'online',
        location,
        eventUrl,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        timezone: 'America/Los_Angeles',
        organizerId: user.id,
        companyId: companyId || null,
        image: `https://picsum.photos/seed/${Date.now()}/800/400`,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
