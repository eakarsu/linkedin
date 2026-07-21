import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    if (process.env.ALLOW_PUBLIC_REGISTRATION !== 'true') {
      return NextResponse.json({ error: 'Public registration is disabled' }, { status: 403 });
    }
    const { name, email, password } = await request.json() as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (name.trim().length > 100 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid name or email' }, { status: 400 });
    }
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Password must have 12+ characters with upper, lower, and numeric characters' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 12),
      },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration failed', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
