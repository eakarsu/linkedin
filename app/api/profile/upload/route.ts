import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST /api/profile/upload - Upload profile or cover image
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, image } = await request.json();

    if (!type || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'avatar' && type !== 'coverImage') {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      );
    }

    // In production, you would upload to a cloud storage service (S3, Cloudinary, etc.)
    // For this MVP, we'll store the base64 image directly in the database
    // Note: This is not recommended for production as it can bloat the database

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { [type]: image },
      select: {
        id: true,
        avatar: true,
        coverImage: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
