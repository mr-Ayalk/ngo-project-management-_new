-- AlterTable Organization
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "fiscalYearStart" TEXT NOT NULL DEFAULT 'July';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "staffRole" TEXT;

-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "donorName" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "assumptions" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "risks" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "indicators" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "outcomes" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "income" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "locationType" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "zone" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "town" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "kebele" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "woreda" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "woredaBudget" DOUBLE PRECISION;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "mitigationStrategies" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "leadId" TEXT;

-- AlterTable Message
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "taskId" TEXT;

-- AlterTable Notification
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "taskId" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "linkType" TEXT;

-- CreateTable ProjectMember
CREATE TABLE IF NOT EXISTS "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable PinnedProject
CREATE TABLE IF NOT EXISTS "PinnedProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PinnedProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable TaskComment
CREATE TABLE IF NOT EXISTS "TaskComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PinnedProject_userId_projectId_key" ON "PinnedProject"("userId", "projectId");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "Project" ADD CONSTRAINT "Project_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "PinnedProject" ADD CONSTRAINT "PinnedProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "PinnedProject" ADD CONSTRAINT "PinnedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
