-- Add the AI & Machine Learning program.
-- Both changes are additive enum values; existing rows are unaffected.

-- 1. New course-page level, keyed by AiCourse.level (public route /courses/aiml).
ALTER TYPE "CourseLevel" ADD VALUE IF NOT EXISTS 'L3_AIML';

-- 2. New lead-capture option, used by demo bookings and enquiries.
ALTER TYPE "Course" ADD VALUE IF NOT EXISTS 'AI_ML';
