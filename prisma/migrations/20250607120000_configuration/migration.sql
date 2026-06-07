-- Organization branding & portal settings
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "landingTitle" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "landingSubtitle" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "landingTagline" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "missionText" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "visionText" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "strategicGoals" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT '#2563eb';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "accentColor" TEXT DEFAULT '#16a34a';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "dashboardLayout" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "enabledRegions" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "koboEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "koboApiUrl" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "koboProjectId" TEXT;

CREATE TABLE IF NOT EXISTS "OrgUnit" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrgUnit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramIndicator" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "category" TEXT,
  "unit" TEXT,
  "target" DOUBLE PRECISION,
  "baseline" DOUBLE PRECISION,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgramIndicator_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserScopeMapping" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "region" TEXT,
  "zone" TEXT,
  "woreda" TEXT,
  "kebele" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserScopeMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReportWorkflowRule" (
  "id" TEXT NOT NULL,
  "reportType" TEXT NOT NULL,
  "submitterRoles" TEXT NOT NULL,
  "approverRoles" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReportWorkflowRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReportWorkflowRule_reportType_key" ON "ReportWorkflowRule"("reportType");
CREATE INDEX IF NOT EXISTS "UserScopeMapping_userId_idx" ON "UserScopeMapping"("userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserScopeMapping_userId_fkey') THEN
    ALTER TABLE "UserScopeMapping" ADD CONSTRAINT "UserScopeMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
