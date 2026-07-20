-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "city" TEXT,
    "email" TEXT,
    "userType" TEXT,
    "programSlug" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "submissionCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_enrollments_whatsappNumber_programSlug_idx" ON "program_enrollments"("whatsappNumber", "programSlug");

-- CreateIndex
CREATE INDEX "program_enrollments_programSlug_idx" ON "program_enrollments"("programSlug");

-- CreateIndex
CREATE INDEX "program_enrollments_status_idx" ON "program_enrollments"("status");
