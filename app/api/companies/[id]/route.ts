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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        industry: body.industry,
        companySize: body.companySize,
        headquarters: body.headquarters,
        founded: body.founded,
        specialties: body.specialties,
        website: body.website,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.companyEmployee.deleteMany({ where: { companyId: id } });
    await prisma.company.delete({ where: { id } });

    return NextResponse.json({ message: 'Company deleted' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
