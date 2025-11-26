import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/jobs/applications - Get user's job applications
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        applicantId: session.user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            experienceLevel: true,
            salary: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/applications - Apply for a job
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobId, coverLetter, resume } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: session.user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: session.user.id,
        coverLetter,
        resume,
        status: 'pending',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Application create error:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/applications - Update application status
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify application belongs to user
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (existingApplication.applicantId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this application' },
        { status: 403 }
      );
    }

    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/applications - Withdraw application
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
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing applicationId' },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.applicantId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this application' },
        { status: 403 }
      );
    }

    await prisma.jobApplication.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Application delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
