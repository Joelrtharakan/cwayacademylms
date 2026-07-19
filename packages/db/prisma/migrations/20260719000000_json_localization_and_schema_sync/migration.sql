-- DropForeignKey
ALTER TABLE "PayoutRequest" DROP CONSTRAINT "PayoutRequest_instructorId_fkey";

-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "text" TYPE jsonb USING jsonb_build_object('en', "text");

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', "title");
ALTER TABLE "Assignment" ALTER COLUMN "description" TYPE jsonb USING jsonb_build_object('en', "description");

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "name" TYPE jsonb USING jsonb_build_object('en', "name");

-- AlterTable Course Defaults
ALTER TABLE "Course" ALTER COLUMN "requirements" DROP DEFAULT;
ALTER TABLE "Course" ALTER COLUMN "outcomes" DROP DEFAULT;
ALTER TABLE "Course" ALTER COLUMN "targetAudience" DROP DEFAULT;

-- AlterTable Course Type Casts
ALTER TABLE "Course" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', "title");
ALTER TABLE "Course" ALTER COLUMN "subtitle" TYPE jsonb USING jsonb_build_object('en', "subtitle");
ALTER TABLE "Course" ALTER COLUMN "description" TYPE jsonb USING jsonb_build_object('en', "description");
ALTER TABLE "Course" ALTER COLUMN "requirements" TYPE jsonb USING jsonb_build_object('en', "requirements");
ALTER TABLE "Course" ALTER COLUMN "outcomes" TYPE jsonb USING jsonb_build_object('en', "outcomes");
ALTER TABLE "Course" ALTER COLUMN "targetAudience" TYPE jsonb USING jsonb_build_object('en', "targetAudience");
ALTER TABLE "Course" ALTER COLUMN "welcomeMessage" TYPE jsonb USING jsonb_build_object('en', "welcomeMessage");
ALTER TABLE "Course" ALTER COLUMN "congratsMessage" TYPE jsonb USING jsonb_build_object('en', "congratsMessage");

-- AlterTable Course Set New Defaults
ALTER TABLE "Course" ALTER COLUMN "requirements" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Course" ALTER COLUMN "outcomes" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Course" ALTER COLUMN "targetAudience" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', "title");
ALTER TABLE "Lesson" ALTER COLUMN "content" TYPE jsonb USING jsonb_build_object('en', "content");

-- AlterTable
ALTER TABLE "Program" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', "title");
ALTER TABLE "Program" ALTER COLUMN "description" TYPE jsonb USING jsonb_build_object('en', "description");

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "text" TYPE jsonb USING jsonb_build_object('en', "text");

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', "title");

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', "title");
ALTER TABLE "Section" ALTER COLUMN "description" TYPE jsonb USING jsonb_build_object('en', "description");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "payoutPercentage";

-- DropTable
DROP TABLE "PayoutRequest";
