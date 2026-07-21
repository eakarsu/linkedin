-- Reconcile models already used by application routes with migration history.
-- Existing data is preserved: userId is renamed to applicantId, and legacy
-- job level values are copied before the old column is removed. Legacy jobs
-- may remain explicitly unowned (posterId NULL).

ALTER TABLE "Connection" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "OutreachPreference" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "User"
  ADD COLUMN "profileCompleteness" INTEGER DEFAULT 0,
  ADD COLUMN "savedPosts" JSONB;

ALTER TABLE "Like" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'like';

ALTER TABLE "Notification"
  ADD COLUMN "actorId" TEXT,
  ADD COLUMN "postId" TEXT;

CREATE TABLE "Story" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "image" TEXT,
  "video" TEXT,
  "text" TEXT,
  "views" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "tagline" TEXT,
  "description" TEXT,
  "industry" TEXT,
  "companySize" TEXT,
  "headquarters" TEXT,
  "founded" TEXT,
  "specialties" TEXT,
  "website" TEXT,
  "logo" TEXT,
  "coverImage" TEXT,
  "followers" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyEmployee" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT,
  "startDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyEmployee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "image" TEXT,
  "type" TEXT NOT NULL DEFAULT 'online',
  "location" TEXT,
  "eventUrl" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "timezone" TEXT,
  "organizerId" TEXT NOT NULL,
  "companyId" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventAttendee" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'going',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Group" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "rules" TEXT,
  "image" TEXT,
  "coverImage" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "industry" TEXT,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupMember" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupPost" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "image" TEXT,
  "groupId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GroupPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Course" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "thumbnail" TEXT,
  "instructor" TEXT NOT NULL,
  "duration" TEXT,
  "level" TEXT,
  "category" TEXT,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "students" INTEGER NOT NULL DEFAULT 0,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isFree" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseEnrollment" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "lastWatched" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Job"
  ADD COLUMN "companyId" TEXT,
  ADD COLUMN "experienceLevel" TEXT,
  ADD COLUMN "posterId" TEXT,
  ALTER COLUMN "requirements" DROP NOT NULL;
UPDATE "Job" SET "experienceLevel" = "level" WHERE "experienceLevel" IS NULL;
ALTER TABLE "Job" DROP COLUMN "applicants", DROP COLUMN "level";

ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";
DROP INDEX "JobApplication_jobId_userId_key";
ALTER TABLE "JobApplication" RENAME COLUMN "userId" TO "applicantId";

CREATE UNIQUE INDEX "CompanyEmployee_companyId_userId_key" ON "CompanyEmployee"("companyId", "userId");
CREATE UNIQUE INDEX "EventAttendee_eventId_userId_key" ON "EventAttendee"("eventId", "userId");
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");
CREATE UNIQUE INDEX "CourseEnrollment_courseId_userId_key" ON "CourseEnrollment"("courseId", "userId");
CREATE UNIQUE INDEX "JobApplication_jobId_applicantId_key" ON "JobApplication"("jobId", "applicantId");

ALTER TABLE "Job" ADD CONSTRAINT "Job_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyEmployee" ADD CONSTRAINT "CompanyEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyEmployee" ADD CONSTRAINT "CompanyEmployee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
