-- Planning Module: LogFrame outcomes, outputs, and activities

CREATE TABLE "PlanOutcome" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "indicator" TEXT,
    "targetValue" DOUBLE PRECISION,
    "baseline" DOUBLE PRECISION,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'on-track',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanOutcome_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlanOutput" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deliverable" TEXT,
    "targetQty" DOUBLE PRECISION,
    "achievedQty" DOUBLE PRECISION DEFAULT 0,
    "unit" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanOutput_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlanActivity" (
    "id" TEXT NOT NULL,
    "outputId" TEXT,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "location" TEXT,
    "budget" DOUBLE PRECISION,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlanOutcome_projectId_idx" ON "PlanOutcome"("projectId");
CREATE INDEX "PlanOutput_outcomeId_idx" ON "PlanOutput"("outcomeId");
CREATE INDEX "PlanOutput_projectId_idx" ON "PlanOutput"("projectId");
CREATE INDEX "PlanActivity_projectId_idx" ON "PlanActivity"("projectId");
CREATE INDEX "PlanActivity_assigneeId_idx" ON "PlanActivity"("assigneeId");
CREATE INDEX "PlanActivity_outputId_idx" ON "PlanActivity"("outputId");

ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanOutput" ADD CONSTRAINT "PlanOutput_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "PlanOutcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanOutput" ADD CONSTRAINT "PlanOutput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanActivity" ADD CONSTRAINT "PlanActivity_outputId_fkey" FOREIGN KEY ("outputId") REFERENCES "PlanOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlanActivity" ADD CONSTRAINT "PlanActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanActivity" ADD CONSTRAINT "PlanActivity_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
