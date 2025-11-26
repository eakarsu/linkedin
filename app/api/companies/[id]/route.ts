import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        employees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                title: true,
                avatar: true,
              },
            },
          },
          take: 10,
        },
        jobs: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            employees: true,
            jobs: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}
