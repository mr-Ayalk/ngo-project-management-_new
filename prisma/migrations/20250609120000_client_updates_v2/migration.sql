-- Report enhancements: activity table, drive link, post-approval edits
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "activityTable" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "driveLink" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "editedAfterApproval" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "editedAfterApprovalAt" TIMESTAMP(3);

-- Sign-in location tracking
CREATE TABLE IF NOT EXISTS "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LoginEvent_userId_idx" ON "LoginEvent"("userId");
CREATE INDEX IF NOT EXISTS "LoginEvent_createdAt_idx" ON "LoginEvent"("createdAt");

DO $$ BEGIN
  ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
