import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST /api/profile/sections - Add item to a profile section
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { section, data } = await request.json();

    // Validate section name
    const validSections = ['experience', 'education', 'skills', 'languages', 'projects', 'certifications'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    // Get current data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { [section]: true },
    });

    const currentData = (user?.[section as keyof typeof user] as any[]) || [];
    const newData = [...currentData, { ...data, id: Date.now().toString() }];

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { [section]: newData },
      select: { [section]: true },
    });

    return NextResponse.json({ [section]: updatedUser[section as keyof typeof updatedUser] });
  } catch (error) {
    console.error('Section add error:', error);
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile/sections - Update item in a profile section
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { section, itemId, data } = await request.json();

    // Validate section name
    const validSections = ['experience', 'education', 'skills', 'languages', 'projects', 'certifications'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    // Get current data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { [section]: true },
    });

    const currentData = (user?.[section as keyof typeof user] as any[]) || [];
    const newData = currentData.map((item: any) =>
      item.id === itemId ? { ...item, ...data } : item
    );

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { [section]: newData },
      select: { [section]: true },
    });

    return NextResponse.json({ [section]: updatedUser[section as keyof typeof updatedUser] });
  } catch (error) {
    console.error('Section update error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/sections - Delete item from a profile section
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const itemId = searchParams.get('itemId');

    // Validate section name
    const validSections = ['experience', 'education', 'skills', 'languages', 'projects', 'certifications'];
    if (!section || !validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    // Get current data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { [section]: true },
    });

    const currentData = (user?.[section as keyof typeof user] as any[]) || [];
    const newData = currentData.filter((item: any) => item.id !== itemId);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { [section]: newData },
      select: { [section]: true },
    });

    return NextResponse.json({ [section]: updatedUser[section as keyof typeof updatedUser] });
  } catch (error) {
    console.error('Section delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
