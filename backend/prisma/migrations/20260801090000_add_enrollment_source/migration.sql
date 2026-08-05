-- Referral source tracking for program enrollments.
-- Nullable + no default: existing rows stay NULL and render as "Direct".
ALTER TABLE "program_enrollments" ADD COLUMN "source" TEXT;

-- Supports the admin "Source" filter and the bySource stats grouping.
CREATE INDEX "program_enrollments_source_idx" ON "program_enrollments"("source");
