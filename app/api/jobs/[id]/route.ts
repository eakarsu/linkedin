import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/jobs/[id] - Get a single job by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: { applications: true },
        },
        poster: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Job fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const job = await prisma.job.update({
      where: { id },
      data: {
        title: body.title,
        company: body.company,
        location: body.location,
        type: body.type,
        experienceLevel: body.experienceLevel,
        salary: body.salary,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.jobApplication.deleteMany({ where: { jobId: id } });
    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
