-- Task date range + document cover thumbnails
ALTER TABLE "Task" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "Document" ADD COLUMN "thumbnailUrl" TEXT;
