--
-- PostgreSQL database dump
--

\restrict Ydw4f5fAkedwsC8M1GaTyIz8bitkwIKJ0chTSW1sAxPpKfwsNmMMEBARXLQuyjg

-- Dumped from database version 16.14
-- Dumped by pg_dump version 18.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Submission" DROP CONSTRAINT IF EXISTS "Submission_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Submission" DROP CONSTRAINT IF EXISTS "Submission_assignmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sponsorship" DROP CONSTRAINT IF EXISTS "Sponsorship_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Section" DROP CONSTRAINT IF EXISTS "Section_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Rubric" DROP CONSTRAINT IF EXISTS "Rubric_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."RubricLevel" DROP CONSTRAINT IF EXISTS "RubricLevel_criteriaId_fkey";
ALTER TABLE IF EXISTS ONLY public."RubricCriteria" DROP CONSTRAINT IF EXISTS "RubricCriteria_rubricId_fkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."ReadingMaterial" DROP CONSTRAINT IF EXISTS "ReadingMaterial_sectionId_fkey";
ALTER TABLE IF EXISTS ONLY public."ReadingMaterialProgress" DROP CONSTRAINT IF EXISTS "ReadingMaterialProgress_readingMaterialId_fkey";
ALTER TABLE IF EXISTS ONLY public."ReadingMaterialProgress" DROP CONSTRAINT IF EXISTS "ReadingMaterialProgress_enrollmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_rubricId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuizAttempt" DROP CONSTRAINT IF EXISTS "QuizAttempt_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuizAttempt" DROP CONSTRAINT IF EXISTS "QuizAttempt_quizId_fkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_quizId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProgramEnrollment" DROP CONSTRAINT IF EXISTS "ProgramEnrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProgramEnrollment" DROP CONSTRAINT IF EXISTS "ProgramEnrollment_programId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProgramApplication" DROP CONSTRAINT IF EXISTS "ProgramApplication_programId_fkey";
ALTER TABLE IF EXISTS ONLY public."PayoutRequest" DROP CONSTRAINT IF EXISTS "PayoutRequest_instructorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Note" DROP CONSTRAINT IF EXISTS "Note_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Note" DROP CONSTRAINT IF EXISTS "Note_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_senderId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_receiverId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_sectionId_fkey";
ALTER TABLE IF EXISTS ONLY public."LessonProgress" DROP CONSTRAINT IF EXISTS "LessonProgress_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."LessonProgress" DROP CONSTRAINT IF EXISTS "LessonProgress_enrollmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Forum" DROP CONSTRAINT IF EXISTS "Forum_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."ForumReply" DROP CONSTRAINT IF EXISTS "ForumReply_postId_fkey";
ALTER TABLE IF EXISTS ONLY public."ForumReply" DROP CONSTRAINT IF EXISTS "ForumReply_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."ForumPost" DROP CONSTRAINT IF EXISTS "ForumPost_forumId_fkey";
ALTER TABLE IF EXISTS ONLY public."ForumPost" DROP CONSTRAINT IF EXISTS "ForumPost_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Extension" DROP CONSTRAINT IF EXISTS "Extension_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Extension" DROP CONSTRAINT IF EXISTS "Extension_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExtensionRequest" DROP CONSTRAINT IF EXISTS "ExtensionRequest_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExtensionRequest" DROP CONSTRAINT IF EXISTS "ExtensionRequest_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_paymentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Discussion" DROP CONSTRAINT IF EXISTS "Discussion_sectionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Discussion" DROP CONSTRAINT IF EXISTS "Discussion_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."Discussion" DROP CONSTRAINT IF EXISTS "Discussion_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Discussion" DROP CONSTRAINT IF EXISTS "Discussion_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."DiscussionReply" DROP CONSTRAINT IF EXISTS "DiscussionReply_discussionId_fkey";
ALTER TABLE IF EXISTS ONLY public."DiscussionReply" DROP CONSTRAINT IF EXISTS "DiscussionReply_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Curriculum" DROP CONSTRAINT IF EXISTS "Curriculum_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Course" DROP CONSTRAINT IF EXISTS "Course_programId_fkey";
ALTER TABLE IF EXISTS ONLY public."Course" DROP CONSTRAINT IF EXISTS "Course_instructorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Course" DROP CONSTRAINT IF EXISTS "Course_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseInvitation" DROP CONSTRAINT IF EXISTS "CourseInvitation_instructorId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseInvitation" DROP CONSTRAINT IF EXISTS "CourseInvitation_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Coupon" DROP CONSTRAINT IF EXISTS "Coupon_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Certificate" DROP CONSTRAINT IF EXISTS "Certificate_templateId_fkey";
ALTER TABLE IF EXISTS ONLY public."Certificate" DROP CONSTRAINT IF EXISTS "Certificate_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Certificate" DROP CONSTRAINT IF EXISTS "Certificate_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_sectionId_fkey";
ALTER TABLE IF EXISTS ONLY public."AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."AttendanceRecord" DROP CONSTRAINT IF EXISTS "AttendanceRecord_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."AttendanceRecord" DROP CONSTRAINT IF EXISTS "AttendanceRecord_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_rubricId_fkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."Answer" DROP CONSTRAINT IF EXISTS "Answer_questionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_sectionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_authorId_fkey";
DROP INDEX IF EXISTS public."User_role_idx";
DROP INDEX IF EXISTS public."User_googleId_key";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."User_email_idx";
DROP INDEX IF EXISTS public."Submission_assignmentId_studentId_key";
DROP INDEX IF EXISTS public."Submission_assignmentId_idx";
DROP INDEX IF EXISTS public."Sponsorship_stripePaymentId_key";
DROP INDEX IF EXISTS public."Section_courseId_idx";
DROP INDEX IF EXISTS public."Review_courseId_studentId_key";
DROP INDEX IF EXISTS public."Review_courseId_idx";
DROP INDEX IF EXISTS public."ReadingMaterialProgress_enrollmentId_readingMaterialId_key";
DROP INDEX IF EXISTS public."Quiz_lessonId_key";
DROP INDEX IF EXISTS public."QuizAttempt_quizId_studentId_idx";
DROP INDEX IF EXISTS public."Question_quizId_idx";
DROP INDEX IF EXISTS public."Program_status_idx";
DROP INDEX IF EXISTS public."ProgramEnrollment_studentId_programId_key";
DROP INDEX IF EXISTS public."ProgramApplication_programId_idx";
DROP INDEX IF EXISTS public."ProgramApplication_email_idx";
DROP INDEX IF EXISTS public."PayoutRequest_instructorId_idx";
DROP INDEX IF EXISTS public."Payment_stripePaymentId_key";
DROP INDEX IF EXISTS public."Notification_userId_isRead_idx";
DROP INDEX IF EXISTS public."Note_studentId_lessonId_key";
DROP INDEX IF EXISTS public."Message_senderId_receiverId_idx";
DROP INDEX IF EXISTS public."Lesson_sectionId_idx";
DROP INDEX IF EXISTS public."LessonProgress_enrollmentId_lessonId_key";
DROP INDEX IF EXISTS public."Forum_courseId_key";
DROP INDEX IF EXISTS public."ForumReply_postId_idx";
DROP INDEX IF EXISTS public."ForumPost_forumId_idx";
DROP INDEX IF EXISTS public."Extension_studentId_itemId_key";
DROP INDEX IF EXISTS public."Extension_studentId_idx";
DROP INDEX IF EXISTS public."Extension_itemId_idx";
DROP INDEX IF EXISTS public."Extension_courseId_idx";
DROP INDEX IF EXISTS public."ExtensionRequest_studentId_idx";
DROP INDEX IF EXISTS public."ExtensionRequest_itemId_idx";
DROP INDEX IF EXISTS public."ExtensionRequest_courseId_idx";
DROP INDEX IF EXISTS public."Enrollment_studentId_idx";
DROP INDEX IF EXISTS public."Enrollment_studentId_courseId_key";
DROP INDEX IF EXISTS public."Enrollment_courseId_idx";
DROP INDEX IF EXISTS public."EmailTemplate_name_key";
DROP INDEX IF EXISTS public."Curriculum_courseId_key";
DROP INDEX IF EXISTS public."Course_status_idx";
DROP INDEX IF EXISTS public."Course_slug_key";
DROP INDEX IF EXISTS public."Course_slug_idx";
DROP INDEX IF EXISTS public."Course_programId_idx";
DROP INDEX IF EXISTS public."Course_instructorId_idx";
DROP INDEX IF EXISTS public."CourseInvitation_status_idx";
DROP INDEX IF EXISTS public."CourseInvitation_instructorId_idx";
DROP INDEX IF EXISTS public."CourseInvitation_courseId_key";
DROP INDEX IF EXISTS public."Coupon_code_key";
DROP INDEX IF EXISTS public."Certificate_uniqueCode_key";
DROP INDEX IF EXISTS public."Certificate_studentId_courseId_key";
DROP INDEX IF EXISTS public."Category_slug_key";
DROP INDEX IF EXISTS public."BlogPost_slug_key";
DROP INDEX IF EXISTS public."BlogPost_slug_idx";
DROP INDEX IF EXISTS public."AttendanceRecord_sessionId_studentId_key";
DROP INDEX IF EXISTS public."Assignment_lessonId_key";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Submission" DROP CONSTRAINT IF EXISTS "Submission_pkey";
ALTER TABLE IF EXISTS ONLY public."Sponsorship" DROP CONSTRAINT IF EXISTS "Sponsorship_pkey";
ALTER TABLE IF EXISTS ONLY public."SiteSettings" DROP CONSTRAINT IF EXISTS "SiteSettings_pkey";
ALTER TABLE IF EXISTS ONLY public."Section" DROP CONSTRAINT IF EXISTS "Section_pkey";
ALTER TABLE IF EXISTS ONLY public."Rubric" DROP CONSTRAINT IF EXISTS "Rubric_pkey";
ALTER TABLE IF EXISTS ONLY public."RubricLevel" DROP CONSTRAINT IF EXISTS "RubricLevel_pkey";
ALTER TABLE IF EXISTS ONLY public."RubricCriteria" DROP CONSTRAINT IF EXISTS "RubricCriteria_pkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_pkey";
ALTER TABLE IF EXISTS ONLY public."ReadingMaterial" DROP CONSTRAINT IF EXISTS "ReadingMaterial_pkey";
ALTER TABLE IF EXISTS ONLY public."ReadingMaterialProgress" DROP CONSTRAINT IF EXISTS "ReadingMaterialProgress_pkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_pkey";
ALTER TABLE IF EXISTS ONLY public."QuizAttempt" DROP CONSTRAINT IF EXISTS "QuizAttempt_pkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_pkey";
ALTER TABLE IF EXISTS ONLY public."Program" DROP CONSTRAINT IF EXISTS "Program_pkey";
ALTER TABLE IF EXISTS ONLY public."ProgramEnrollment" DROP CONSTRAINT IF EXISTS "ProgramEnrollment_pkey";
ALTER TABLE IF EXISTS ONLY public."ProgramApplication" DROP CONSTRAINT IF EXISTS "ProgramApplication_pkey";
ALTER TABLE IF EXISTS ONLY public."PayoutRequest" DROP CONSTRAINT IF EXISTS "PayoutRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_pkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."Note" DROP CONSTRAINT IF EXISTS "Note_pkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_pkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_pkey";
ALTER TABLE IF EXISTS ONLY public."LessonProgress" DROP CONSTRAINT IF EXISTS "LessonProgress_pkey";
ALTER TABLE IF EXISTS ONLY public."Forum" DROP CONSTRAINT IF EXISTS "Forum_pkey";
ALTER TABLE IF EXISTS ONLY public."ForumReply" DROP CONSTRAINT IF EXISTS "ForumReply_pkey";
ALTER TABLE IF EXISTS ONLY public."ForumPost" DROP CONSTRAINT IF EXISTS "ForumPost_pkey";
ALTER TABLE IF EXISTS ONLY public."Extension" DROP CONSTRAINT IF EXISTS "Extension_pkey";
ALTER TABLE IF EXISTS ONLY public."ExtensionRequest" DROP CONSTRAINT IF EXISTS "ExtensionRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_pkey";
ALTER TABLE IF EXISTS ONLY public."EmailTemplate" DROP CONSTRAINT IF EXISTS "EmailTemplate_pkey";
ALTER TABLE IF EXISTS ONLY public."Discussion" DROP CONSTRAINT IF EXISTS "Discussion_pkey";
ALTER TABLE IF EXISTS ONLY public."DiscussionReply" DROP CONSTRAINT IF EXISTS "DiscussionReply_pkey";
ALTER TABLE IF EXISTS ONLY public."Curriculum" DROP CONSTRAINT IF EXISTS "Curriculum_pkey";
ALTER TABLE IF EXISTS ONLY public."Course" DROP CONSTRAINT IF EXISTS "Course_pkey";
ALTER TABLE IF EXISTS ONLY public."CourseInvitation" DROP CONSTRAINT IF EXISTS "CourseInvitation_pkey";
ALTER TABLE IF EXISTS ONLY public."Coupon" DROP CONSTRAINT IF EXISTS "Coupon_pkey";
ALTER TABLE IF EXISTS ONLY public."Certificate" DROP CONSTRAINT IF EXISTS "Certificate_pkey";
ALTER TABLE IF EXISTS ONLY public."CertificateTemplate" DROP CONSTRAINT IF EXISTS "CertificateTemplate_pkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_pkey";
ALTER TABLE IF EXISTS ONLY public."BlogPost" DROP CONSTRAINT IF EXISTS "BlogPost_pkey";
ALTER TABLE IF EXISTS ONLY public."AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_pkey";
ALTER TABLE IF EXISTS ONLY public."AttendanceRecord" DROP CONSTRAINT IF EXISTS "AttendanceRecord_pkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_pkey";
ALTER TABLE IF EXISTS ONLY public."Answer" DROP CONSTRAINT IF EXISTS "Answer_pkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Submission";
DROP TABLE IF EXISTS public."Sponsorship";
DROP TABLE IF EXISTS public."SiteSettings";
DROP TABLE IF EXISTS public."Section";
DROP TABLE IF EXISTS public."RubricLevel";
DROP TABLE IF EXISTS public."RubricCriteria";
DROP TABLE IF EXISTS public."Rubric";
DROP TABLE IF EXISTS public."Review";
DROP TABLE IF EXISTS public."ReadingMaterialProgress";
DROP TABLE IF EXISTS public."ReadingMaterial";
DROP TABLE IF EXISTS public."QuizAttempt";
DROP TABLE IF EXISTS public."Quiz";
DROP TABLE IF EXISTS public."Question";
DROP TABLE IF EXISTS public."ProgramEnrollment";
DROP TABLE IF EXISTS public."ProgramApplication";
DROP TABLE IF EXISTS public."Program";
DROP TABLE IF EXISTS public."PayoutRequest";
DROP TABLE IF EXISTS public."Payment";
DROP TABLE IF EXISTS public."Notification";
DROP TABLE IF EXISTS public."Note";
DROP TABLE IF EXISTS public."Message";
DROP TABLE IF EXISTS public."LessonProgress";
DROP TABLE IF EXISTS public."Lesson";
DROP TABLE IF EXISTS public."ForumReply";
DROP TABLE IF EXISTS public."ForumPost";
DROP TABLE IF EXISTS public."Forum";
DROP TABLE IF EXISTS public."ExtensionRequest";
DROP TABLE IF EXISTS public."Extension";
DROP TABLE IF EXISTS public."Enrollment";
DROP TABLE IF EXISTS public."EmailTemplate";
DROP TABLE IF EXISTS public."DiscussionReply";
DROP TABLE IF EXISTS public."Discussion";
DROP TABLE IF EXISTS public."Curriculum";
DROP TABLE IF EXISTS public."CourseInvitation";
DROP TABLE IF EXISTS public."Course";
DROP TABLE IF EXISTS public."Coupon";
DROP TABLE IF EXISTS public."CertificateTemplate";
DROP TABLE IF EXISTS public."Certificate";
DROP TABLE IF EXISTS public."Category";
DROP TABLE IF EXISTS public."BlogPost";
DROP TABLE IF EXISTS public."AttendanceSession";
DROP TABLE IF EXISTS public."AttendanceRecord";
DROP TABLE IF EXISTS public."Assignment";
DROP TABLE IF EXISTS public."Answer";
DROP TABLE IF EXISTS public."Announcement";
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "sectionId" text,
    "authorId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Answer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Answer" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    text text NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL
);


--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Assignment" (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "maxScore" integer DEFAULT 100 NOT NULL,
    "attachmentUrl" text,
    "rubricId" text
);


--
-- Name: AttendanceRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AttendanceRecord" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "studentId" text NOT NULL,
    status text DEFAULT 'ABSENT'::text NOT NULL,
    "markedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text
);


--
-- Name: AttendanceSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AttendanceSession" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "sectionId" text,
    title text NOT NULL,
    description text,
    "sessionDate" timestamp(3) without time zone NOT NULL,
    "sessionType" text DEFAULT 'LIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: BlogPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogPost" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    "coverImage" text,
    "coverKey" text,
    "authorId" text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "readingTime" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customAuthor" text
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    "order" integer DEFAULT 0 NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Certificate" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uniqueCode" text NOT NULL,
    "downloadUrl" text,
    "templateId" text
);


--
-- Name: CertificateTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CertificateTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    "htmlTemplate" text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "logoUrl" text,
    "signatorySignatureUrl" text,
    "borderStyle" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    discount double precision NOT NULL,
    type text NOT NULL,
    "maxUses" integer DEFAULT 100 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "courseId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Course; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    subtitle text,
    description text,
    thumbnail text,
    "promoVideoUrl" text,
    price double precision DEFAULT 0 NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    level text DEFAULT 'BEGINNER'::text NOT NULL,
    language text DEFAULT 'ENGLISH'::text NOT NULL,
    "moduleNumber" integer,
    "weeksDuration" integer DEFAULT 6 NOT NULL,
    "totalLectures" integer DEFAULT 0 NOT NULL,
    "totalDuration" integer DEFAULT 0 NOT NULL,
    "scriptureRef" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isFree" boolean DEFAULT true NOT NULL,
    requirements text DEFAULT '[]'::text NOT NULL,
    outcomes text DEFAULT '[]'::text NOT NULL,
    "targetAudience" text DEFAULT '[]'::text NOT NULL,
    "welcomeMessage" text,
    "congratsMessage" text,
    tags text DEFAULT '[]'::text NOT NULL,
    "rejectionReason" text,
    "instructorId" text NOT NULL,
    "categoryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invitationStatus" text DEFAULT 'UNASSIGNED'::text NOT NULL,
    "programId" text,
    "courseCode" text
);


--
-- Name: CourseInvitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CourseInvitation" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "instructorId" text NOT NULL,
    "adminNote" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Curriculum; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Curriculum" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    overview text,
    objectives text DEFAULT '[]'::text NOT NULL,
    "weeklyPlan" text DEFAULT '[]'::text NOT NULL,
    "assessmentPlan" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Discussion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Discussion" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "sectionId" text,
    "lessonId" text,
    "authorId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    score integer,
    feedback text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DiscussionReply; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DiscussionReply" (
    id text NOT NULL,
    "discussionId" text NOT NULL,
    "authorId" text NOT NULL,
    content text NOT NULL,
    "isInstructor" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: EmailTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    "htmlBody" text NOT NULL,
    variables text DEFAULT '[]'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Enrollment" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    progress double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "paymentId" text,
    "sponsorshipId" text
);


--
-- Name: Extension; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Extension" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "itemId" text NOT NULL,
    "itemType" text NOT NULL,
    "courseId" text NOT NULL,
    "extendedDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ExtensionRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExtensionRequest" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "itemId" text NOT NULL,
    "itemType" text NOT NULL,
    "courseId" text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "requestedDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Forum; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Forum" (
    id text NOT NULL,
    "courseId" text NOT NULL
);


--
-- Name: ForumPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ForumPost" (
    id text NOT NULL,
    "forumId" text NOT NULL,
    "authorId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ForumReply; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ForumReply" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "authorId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lesson" (
    id text NOT NULL,
    "sectionId" text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    content text,
    "videoUrl" text,
    duration integer DEFAULT 0 NOT NULL,
    "order" integer NOT NULL,
    "isFree" boolean DEFAULT false NOT NULL,
    "isPreview" boolean DEFAULT false NOT NULL,
    "bunnyVideoId" text,
    "forumMarks" integer,
    "dueDate" timestamp(3) without time zone
);


--
-- Name: LessonProgress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LessonProgress" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    "lessonId" text NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "watchedSeconds" integer DEFAULT 0 NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    content text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


--
-- Name: Note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Note" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "lessonId" text NOT NULL,
    content text NOT NULL,
    "timestamp" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "stripePaymentId" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "isSponsored" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PayoutRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PayoutRequest" (
    id text NOT NULL,
    "instructorId" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "bankDetails" text,
    note text,
    "adminNote" text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone
);


--
-- Name: Program; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Program" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail text,
    "thumbnailKey" text,
    duration text,
    tags text DEFAULT '[]'::text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProgramApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProgramApplication" (
    id text NOT NULL,
    "programId" text NOT NULL,
    "mediumOfStudy" text DEFAULT 'English'::text NOT NULL,
    "fullName" text NOT NULL,
    dob timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    "maritalStatus" text NOT NULL,
    nationality text NOT NULL,
    "aadhaarNumber" text,
    "passportPhotoUrl" text NOT NULL,
    "mobileNumber" text NOT NULL,
    "whatsappNumber" text NOT NULL,
    email text NOT NULL,
    "permanentAddress" text NOT NULL,
    "currentAddress" text NOT NULL,
    "highestQualification" text NOT NULL,
    "previousInstitution" text NOT NULL,
    "yearOfCompletion" text NOT NULL,
    "marksOrGrade" text NOT NULL,
    "certificatesUrls" text NOT NULL,
    "isBornAgain" boolean NOT NULL,
    "churchName" text NOT NULL,
    "churchAddress" text NOT NULL,
    "pastorName" text NOT NULL,
    "ministryExperience" text,
    "callingStatement" text NOT NULL,
    "reference1Name" text NOT NULL,
    "reference1Phone" text NOT NULL,
    "reference1Relation" text NOT NULL,
    "reference2Name" text NOT NULL,
    "reference2Phone" text NOT NULL,
    "reference2Relation" text NOT NULL,
    "declarationName" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProgramEnrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProgramEnrollment" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "programId" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "currentCourseId" text
);


--
-- Name: Question; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    "quizId" text NOT NULL,
    text text NOT NULL,
    type text DEFAULT 'MCQ'::text NOT NULL,
    points integer DEFAULT 1 NOT NULL,
    "order" integer NOT NULL,
    "scriptureRef" text
);


--
-- Name: Quiz; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Quiz" (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    title text NOT NULL,
    "passingScore" integer DEFAULT 70 NOT NULL,
    "timeLimit" integer,
    "maxAttempts" integer DEFAULT 3 NOT NULL,
    "rubricId" text
);


--
-- Name: QuizAttempt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QuizAttempt" (
    id text NOT NULL,
    "quizId" text NOT NULL,
    "studentId" text NOT NULL,
    score double precision DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    answers text NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: ReadingMaterial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReadingMaterial" (
    id text NOT NULL,
    "sectionId" text NOT NULL,
    title text NOT NULL,
    description text,
    "fileUrl" text NOT NULL,
    "fileKey" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ReadingMaterialProgress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReadingMaterialProgress" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    "readingMaterialId" text NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "studentId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "isApproved" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Rubric; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Rubric" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    title text NOT NULL,
    description text,
    "totalPoints" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RubricCriteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RubricCriteria" (
    id text NOT NULL,
    "rubricId" text NOT NULL,
    title text NOT NULL,
    description text,
    "maxPoints" integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: RubricLevel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RubricLevel" (
    id text NOT NULL,
    "criteriaId" text NOT NULL,
    label text NOT NULL,
    description text NOT NULL,
    points integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: Section; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Section" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    title text NOT NULL,
    description text,
    objectives text DEFAULT '[]'::text NOT NULL,
    "weekNumber" integer,
    "isPublished" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiteSettings" (
    id text NOT NULL,
    "siteName" text DEFAULT 'CWAY Academy'::text NOT NULL,
    "logoUrl" text,
    tagline text,
    "contactEmail" text,
    "contactWhatsApp" text,
    "primaryColor" text DEFAULT '#C9973A'::text NOT NULL,
    "smtpConfig" text,
    "stripeConfig" text,
    "storageConfig" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Sponsorship; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Sponsorship" (
    id text NOT NULL,
    "sponsorName" text NOT NULL,
    "sponsorEmail" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "stripePaymentId" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    message text,
    "studentId" text,
    "courseId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Submission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Submission" (
    id text NOT NULL,
    "assignmentId" text NOT NULL,
    "studentId" text NOT NULL,
    content text,
    "fileUrl" text,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    grade double precision,
    feedback text,
    "gradedAt" timestamp(3) without time zone,
    "isGraded" boolean DEFAULT false NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    role text DEFAULT 'STUDENT'::text NOT NULL,
    avatar text,
    bio text,
    phone text,
    church text,
    location text,
    "preferredLanguage" text DEFAULT 'ENGLISH'::text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isBanned" boolean DEFAULT false NOT NULL,
    "payoutPercentage" double precision DEFAULT 70 NOT NULL,
    "emailVerifyToken" text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    "googleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "socialLinks" text,
    title text,
    credentials text,
    "yearsExperience" integer,
    expertise text DEFAULT '[]'::text NOT NULL,
    "notificationPrefs" text DEFAULT '{}'::text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Announcement" (id, "courseId", "sectionId", "authorId", title, content, "isPinned", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Answer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Answer" (id, "questionId", text, "isCorrect") FROM stdin;
cmqm8r0py0011676pc56gkxbb	cmqm8r0py0010676pjacvj8tx	John Calvin	f
cmqm8r0py0012676pkwc3u3vf	cmqm8r0py0010676pjacvj8tx	Martin Luther	t
cmqm8r0py0013676pcjy5nkhy	cmqm8r0py0010676pjacvj8tx	John Wesley	f
cmqm8r0py0014676plm5yi7jl	cmqm8r0py0010676pjacvj8tx	Ulrich Zwingli	f
cmqm8syoz0017676p48aylem7	cmqm8syoz0016676pf1wpfvuc	Augsburg Confession	f
cmqm8syoz0018676pj609b7bj	cmqm8syoz0016676pf1wpfvuc	Institutes of the Christian Religion	f
cmqm8syoz0019676pmbsinawt	cmqm8syoz0016676pf1wpfvuc	Ninety-Five Theses	t
cmqm8syoz001a676pkgy5t18o	cmqm8syoz0016676pf1wpfvuc	Westminster Confession	f
cmqm8u3py001d676p5yfpzgr0	cmqm8u3py001c676px5058mj9	Sola Scriptura	f
cmqm8u3py001e676pwjhotzya	cmqm8u3py001c676px5058mj9	Sola Gratia	f
cmqm8u3py001f676pq4he9i3u	cmqm8u3py001c676px5058mj9	Solus Christus	f
cmqm8u3py001g676px6r784v0	cmqm8u3py001c676px5058mj9	Sola Fide	t
cmqm8vcaf001j676p1wa3hjpr	cmqm8vcaf001i676pc0ms9r2b	John Calvin	t
cmqm8vcaf001k676p5r5rrk81	cmqm8vcaf001i676pc0ms9r2b	Martin Luther	f
cmqm8vcaf001l676pj2y970xg	cmqm8vcaf001i676pc0ms9r2b	John Knox	f
cmqm8vcaf001m676pb6cjpe93	cmqm8vcaf001i676pc0ms9r2b	John Wesley	f
cmqm8web8001p676pm1rx5za2	cmqm8web8001o676p3s2ey700	Renaissance	f
cmqm8web8001q676ptgxtldte	cmqm8web8001o676p3s2ey700	Crusades	f
cmqm8web8001r676p45ikvc8e	cmqm8web8001o676p3s2ey700	Missionary Movement	t
cmqm8web8001s676py59arn52	cmqm8web8001o676p3s2ey700	Monastic Movement	f
cmqm9d2kp0007fjta5ue25cwk	cmqm9d2kp0006fjtav409qnoe	The Crucifixion	f
cmqm9d2kp0008fjtailrqyejo	cmqm9d2kp0006fjtav409qnoe	The Resurrection	f
cmqm9d2kp0009fjtacsanjg9e	cmqm9d2kp0006fjtav409qnoe	Pentecost	t
cmqm9d2kp000afjtaod6zo1ib	cmqm9d2kp0006fjtav409qnoe	The Council of Nicaea	f
cmqm9ecor000dfjtacrxahr8a	cmqm9ecor000cfjta9zx2tdhr	Paul	f
cmqm9ecor000efjtagien1qsr	cmqm9ecor000cfjta9zx2tdhr	Peter	f
cmqm9ecor000ffjtabco571bb	cmqm9ecor000cfjta9zx2tdhr	Stephen	t
cmqm9ecor000gfjtaduxd7p0i	cmqm9ecor000cfjta9zx2tdhr	James	f
cmqm9fc12000jfjta41sakp1g	cmqm9fc12000ifjtaacd7joj3	Nero	f
cmqm9fc12000kfjtadjb21iyg	cmqm9fc12000ifjtaacd7joj3	Constantine	t
cmqm9fc12000lfjtabpoj7e51	cmqm9fc12000ifjtaacd7joj3	Diocletian	f
cmqm9fc12000mfjta39gln583	cmqm9fc12000ifjtaacd7joj3	Augustus	f
cmqm9gdit000pfjtaqwezvuto	cmqm9gdit000ofjtaypczypg1	Council of Trent	f
cmqm9gdit000qfjta9edrh5hw	cmqm9gdit000ofjtaypczypg1	Council of Chalcedon	f
cmqm9gdit000rfjta06950c26	cmqm9gdit000ofjtaypczypg1	Council of Nicaea	t
cmqm9gdit000sfjtaalhocpgc	cmqm9gdit000ofjtaypczypg1	Council of Jerusalem	f
cmqm9hkp9000vfjta9o9glrmy	cmqm9hkp9000ufjtav6vc7j7n	Augustine	f
cmqm9hkp9000wfjtauz1jnjuo	cmqm9hkp9000ufjtav6vc7j7n	Jerome	f
cmqm9hkp9000xfjta6rl2vmx3	cmqm9hkp9000ufjtav6vc7j7n	Benedict of Nursia	t
cmqm9hkp9000yfjtax5pzfrls	cmqm9hkp9000ufjtav6vc7j7n	Athanasius	f
cmqmaiod1001lfjtaqft6rizz	cmqmaiod1001kfjtalfgwev8o	Romans 12:1–2	f
cmqmaiod1001mfjtawisrmacg	cmqmaiod1001kfjtalfgwev8o	1 Timothy 3:1–7	t
cmqmaiod1001nfjtaxk6sq9l2	cmqmaiod1001kfjtalfgwev8o	Psalm 23	f
cmqmaiod1001ofjta5nbc33fx	cmqmaiod1001kfjtalfgwev8o	Revelation 21	f
cmqmak1ay001rfjtacg9z7teh	cmqmak1ay001qfjta272cjzdk	Vine	f
cmqmak1ay001sfjtan3e1ieps	cmqmak1ay001qfjta272cjzdk	Bread of Life	f
cmqmak1ay001tfjta8me5z9gc	cmqmak1ay001qfjta272cjzdk	Good Shepherd	t
cmqmak1ay001ufjtau1qklk7n	cmqmak1ay001qfjta272cjzdk	Living Water	f
cmqmalcwk001xfjtawnuidr50	cmqmalcwk001wfjta3g37o2lr	Under compulsion	f
cmqmalcwk001yfjtat4lohwt6	cmqmalcwk001wfjta3g37o2lr	Willingly and eagerly	t
cmqmalcwk001zfjtag6jwdnzl	cmqmalcwk001wfjta3g37o2lr	For financial gain	f
cmqmalcwk0020fjtaux8avkch	cmqmalcwk001wfjta3g37o2lr	By force	f
cmqmamfes0023fjta22ehq784	cmqmamfes0022fjtau37xuuwt	King Saul	f
cmqmamfes0024fjta1ji49a9p	cmqmamfes0022fjtau37xuuwt	Jesus Christ	t
cmqmamfes0025fjtaszn8fooo	cmqmamfes0022fjtau37xuuwt	Pilate	f
cmqmamfes0026fjtano8vdbcb	cmqmamfes0022fjtau37xuuwt	Herod	f
cmqmanq9v0029fjta9fgdnqk6	cmqmanq9v0028fjtax35vzqnc	Wealthy	f
cmqmanq9v002afjta5wdst5bs	cmqmanq9v0028fjtax35vzqnc	Blameless	t
cmqmanq9v002bfjta9ki7zy02	cmqmanq9v0028fjtax35vzqnc	Famous	f
cmqmanq9v002cfjtaxcjkpest	cmqmanq9v0028fjtax35vzqnc	Powerful	f
cmqmawb38002tfjta6p35j5rk	cmqmawb38002sfjtabz083w4a	Matthew 28:18–20	t
cmqmawb38002ufjtabnv9a2c2	cmqmawb38002sfjtabz083w4a	Psalm 23	f
cmqmawb38002vfjtauf6rxyz0	cmqmawb38002sfjtabz083w4a	Genesis 1	f
cmqmawb38002wfjtabcj1c4hj	cmqmawb38002sfjtabz083w4a	Revelation 22	f
cmqmaxje6002zfjtamik3aqqy	cmqmaxje6002yfjtaszngtc1z	Build kingdoms	f
cmqmaxje60030fjtajrxbnrs6	cmqmaxje6002yfjtaszngtc1z	Equip the saints for ministry	t
cmqmaxje60031fjtaepd4sfs9	cmqmaxje6002yfjtaszngtc1z	Rule nations	f
cmqmaxje60032fjtaxx23kvxn	cmqmaxje6002yfjtaszngtc1z	Gain wealth	f
cmqmaygcy0035fjta79typsck	cmqmaygcy0034fjtazgrmd7ic	Ignore false teachers	f
cmqmaygcy0036fjtatp2iw56k	cmqmaygcy0034fjtazgrmd7ic	Shepherd the church of God	t
cmqmaygcy0037fjtatnshvvsx	cmqmaygcy0034fjtazgrmd7ic	Build temples	f
cmqmaygcy0038fjta4mywnxtf	cmqmaygcy0034fjtazgrmd7ic	Seek political power	f
cmqmazbow003bfjtafjcpaoax	cmqmazbow003afjtat094ha02	Pride	f
cmqmazbow003cfjtatg7qnni2	cmqmazbow003afjtat094ha02	Humility	t
cmqmazbow003dfjtar87l8g4g	cmqmazbow003afjtat094ha02	Ambition	f
cmqmazbow003efjta5joz8nck	cmqmazbow003afjtat094ha02	Competition	f
cmqmb06zf003hfjtacxr0wg0w	cmqmb06zf003gfjta053o2z64	Authority	f
cmqmb06zf003ifjtawascpa0n	cmqmb06zf003gfjta053o2z64	Wealth	f
cmqmb06zf003jfjtaegr69qk5	cmqmb06zf003gfjta053o2z64	Service	t
cmqmb06zf003kfjtaq1o1xkvl	cmqmb06zf003gfjta053o2z64	Popularity	f
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Assignment" (id, "lessonId", title, description, "dueDate", "maxScore", "attachmentUrl", "rubricId") FROM stdin;
cmqm80ohd000e676p6czu0aux	cmqm80ohb000c676pmvmgotrk	Historical Reflection Essay (700–1,000 words)	"How did the witness and perseverance of the early Christians contribute to the growth and preservation of the Church?"	2026-06-21 03:00:00	100	\N	\N
cmqm88xou000r676pqmmgppo8	cmqm88xop000p676peegc2hlt	Church History Timeline Project (1,000–1,500 words)	Create a timeline highlighting significant events in church history and write a reflection explaining how these events continue to influence Christianity and ministry today.	2026-06-21 09:00:00	25	\N	\N
cmqmab2yh001bfjtathv2kork	cmqmab2yd0019fjtan1gr22cr	Reflection Paper (700–1,000 words)	"Describe the biblical qualifications and responsibilities of a pastor and explain how Jesus Christ serves as the perfect model of servant leadership."	2026-06-21 12:00:00	25	\N	\N
cmqmaunv7002lfjtayb3y966e	cmqmaunv0002jfjtabouyu5z4	Ministry Development Project (1,000–1,500 words)	Prepare a ministry plan for a local church including:\n\nVision Statement\nMission Statement\nLeadership Structure\nDiscipleship Strategy\nPastoral Care Plan\nEvangelism and Outreach Goals	2026-06-21 16:30:00	25	\N	\N
\.


--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AttendanceRecord" (id, "sessionId", "studentId", status, "markedAt", note) FROM stdin;
\.


--
-- Data for Name: AttendanceSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AttendanceSession" (id, "courseId", "sectionId", title, description, "sessionDate", "sessionType", "createdAt") FROM stdin;
\.


--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BlogPost" (id, title, slug, excerpt, content, "coverImage", "coverKey", "authorId", "isPublished", "readingTime", "createdAt", "updatedAt", "customAuthor") FROM stdin;
cmqku2zfu007l3u1qoqezuhts	Obedience to the Will of God — The Garrs	obedience-will-of-god-the-garrs	Alfred and Lillian Garr were model missionaries who obeyed God's will to bring the Pentecostal message to India in 1906.	<p>The story of the Garrs is one of absolute obedience. Leaving their comforts behind, they traveled to Calcutta and established early assemblies, demonstrating dynamic spiritual leadership.</p>	\N	\N	cmqku2zbu00013u1qbthq3afd	t	8	2026-06-19 11:16:42.091	2026-06-19 11:16:42.091	\N
cmqku2zft007h3u1qbu9v4vdu	Arulappan: A Pioneer of Indigenous Leadership Training in India	arulappan-pioneer-indigenous-leadership	John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India.	<p>John Christian Arulappan represents a powerful movement in early indigenous missions. His dedication to raises local leaders without relying on Western patterns paved the way for modern training ministries in rural India.</p>	\N	\N	cmqku2zbu00013u1qbthq3afd	t	6	2026-06-19 11:16:42.089	2026-06-19 11:16:42.089	\N
cmqku2zfu007j3u1qtf384kx1	"They Will Not Go, I Must" — The Legacy of Mary Chapman	legacy-of-mary-chapman	Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India.	<p>Mary Chapman arrived in India at an age when most people prepare to retire. Her courage to establish ministries and serve rural populations stands as a monuments of faith and leadership.</p>	\N	\N	cmqku2zbu00013u1qbthq3afd	t	7	2026-06-19 11:16:42.09	2026-06-19 11:16:42.09	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, slug, icon, "order", "parentId", "createdAt") FROM stdin;
cmqku2zc000033u1q4jxxz6rm	Biblical Studies	biblical-studies	book-open	0	\N	2026-06-19 11:16:41.952
cmqku2zc200043u1qepizf3ax	Theology	theology	flame	0	\N	2026-06-19 11:16:41.955
cmqku2zc400053u1q598m2y8t	Ministry & Leadership	ministry-leadership	users	0	\N	2026-06-19 11:16:41.956
cmqku2zc500063u1qa0r9egdz	Church History	church-history	building-church	0	\N	2026-06-19 11:16:41.958
cmqku2zc600073u1q20sr90j1	Spiritual Formation	spiritual-formation	heart	0	\N	2026-06-19 11:16:41.959
\.


--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Certificate" (id, "studentId", "courseId", "issuedAt", "uniqueCode", "downloadUrl", "templateId") FROM stdin;
\.


--
-- Data for Name: CertificateTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CertificateTemplate" (id, name, "htmlTemplate", "isDefault", "logoUrl", "signatorySignatureUrl", "borderStyle", "createdAt") FROM stdin;
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Coupon" (id, code, discount, type, "maxUses", "usedCount", "expiresAt", "courseId", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Course" (id, title, slug, subtitle, description, thumbnail, "promoVideoUrl", price, currency, status, level, language, "moduleNumber", "weeksDuration", "totalLectures", "totalDuration", "scriptureRef", "isFeatured", "isFree", requirements, outcomes, "targetAudience", "welcomeMessage", "congratsMessage", tags, "rejectionReason", "instructorId", "categoryId", "createdAt", "updatedAt", "invitationStatus", "programId", "courseCode") FROM stdin;
cmqm4xmwo0005fzym9rhv5byg	Church History and Historical Theology	church-history-and-historical-theology		This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781954512817-cmqm4xmwo0005fzym9rhv5byg-1781954512817.png	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmqku2zbu00013u1qbthq3afd	cmqku2zc500063u1qa0r9egdz	2026-06-20 09:08:14.52	2026-06-21 13:21:31.994	ACCEPTED	cmqdmxali00009bd9nmskius7	MDIV 502
cmqm3bas20005pm88e08zdgem	Pastoral Theology and Christian Leadership	pastoral-theology-and-christian-leadership-1		This course examines the biblical foundations and practical aspects of pastoral ministry and leadership. Emphasis is placed on shepherding, discipleship, counseling, administration, and servant leadership in the church.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781955105749-cmqm3bas20005pm88e08zdgem-1781955105749.png	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmql8quqk0000h58xt3rfj7uo	cmqku2zc200043u1qepizf3ax	2026-06-20 08:22:52.754	2026-06-21 13:21:40.402	ACCEPTED	cmqdmxali00009bd9nmskius7	MDIV 501
\.


--
-- Data for Name: CourseInvitation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CourseInvitation" (id, "courseId", "instructorId", "adminNote", status, "createdAt", "updatedAt") FROM stdin;
cmqm3tuv10001fzymvbwtj1zw	cmqm3bas20005pm88e08zdgem	cmql8quqk0000h58xt3rfj7uo	Join The Course	ACCEPTED	2026-06-20 08:37:18.589	2026-06-20 08:40:29.417
cmqm4y6500007fzymr0e9z2zx	cmqm4xmwo0005fzym9rhv5byg	cmqku2zbu00013u1qbthq3afd	Join the Course	ACCEPTED	2026-06-20 09:08:39.444	2026-06-20 09:09:55.582
\.


--
-- Data for Name: Curriculum; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Curriculum" (id, "courseId", overview, objectives, "weeklyPlan", "assessmentPlan", "updatedAt") FROM stdin;
cmqm60fxq0001yakbrdzo19v2	cmqm4xmwo0005fzym9rhv5byg	This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.	["Trace the major periods of church history.","Understand significant theological developments.","Identify key figures and movements in Christianity.","Evaluate the impact of historical events on the contemporary church.","Apply lessons from church history to present-day ministry."]	[]	\N	2026-06-20 09:38:25.07
cmqm63aq60003yakbot2u9ifc	cmqm3bas20005pm88e08zdgem	This course explores the biblical and theological foundations of pastoral ministry and Christian leadership. Students will examine the role of the pastor as a shepherd, servant, and leader while developing practical skills in pastoral care, discipleship, counseling, and church administration.	["Understand the biblical role of a pastor.","Demonstrate principles of servant leadership.","Apply pastoral care and counseling techniques.","Develop strategies for discipleship and church growth.","Lead congregations with integrity and spiritual maturity."]	[]	\N	2026-06-20 09:42:24.336
\.


--
-- Data for Name: Discussion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Discussion" (id, "courseId", "sectionId", "lessonId", "authorId", title, content, "isPinned", "isLocked", score, feedback, "createdAt") FROM stdin;
\.


--
-- Data for Name: DiscussionReply; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DiscussionReply" (id, "discussionId", "authorId", content, "isInstructor", "createdAt") FROM stdin;
\.


--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmailTemplate" (id, name, subject, "htmlBody", variables, "createdAt", "updatedAt") FROM stdin;
cmq2987hd00001r46ctodgatb	WELCOME_EMAIL	Login Credentials	<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Login Credentials</title>\n</head>\n<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">\n\n    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 0;">\n        <tr>\n            <td align="center">\n\n                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">\n\n                    <!-- Header -->\n                    <tr>\n                        <td align="center" style="background-color:#1e3a8a; padding:30px;">\n                            <h1 style="color:#ffffff; margin:0;">Welcome!</h1>\n                        </td>\n                    </tr>\n\n                    <!-- Content -->\n                    <tr>\n                        <td style="padding:40px; color:#333333; line-height:1.8; font-size:16px;">\n\n                            <p>Dear <strong>{{name}}</strong>,</p>\n\n                            <p>\n                                Welcome to our platform. Your account has been successfully created.\n                                Please find your login credentials below:\n                            </p>\n\n                            <table cellpadding="8" cellspacing="0" width="100%" style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px;">\n                                <tr>\n                                    <td width="30%"><strong>Email:</strong></td>\n                                    <td>{{email}}</td>\n                                </tr>\n                                <tr>\n                                    <td><strong>Password:</strong></td>\n                                    <td>{{password}}</td>\n                                </tr>\n                            </table>\n\n                            <p style="margin-top:30px;">\n                                For security purposes, we recommend changing your password after your first login.\n                            </p>\n\n                            <div style="text-align:center; margin:35px 0;">\n                                <a href="{{login_url}}" style="background-color:#1e3a8a; color:#ffffff; text-decoration:none; padding:14px 30px; border-radius:6px; display:inline-block;">\n                                    Login Now\n                                </a>\n                            </div>\n\n                            <p>\n                                If you have any questions or require assistance, please feel free to contact us.\n                            </p>\n\n                            <p>\n                                Regards,<br>\n                                <strong>CWAY Academy Team</strong>\n                            </p>\n\n                        </td>\n                    </tr>\n\n                    <!-- Footer -->\n                    <tr>\n                        <td align="center" style="background-color:#f8fafc; padding:20px; font-size:13px; color:#6b7280;">\n                            © 2026 CWAY Academy. All rights reserved.\n                        </td>\n                    </tr>\n\n                </table>\n\n            </td>\n        </tr>\n    </table>\n\n</body>\n</html>	[]	2026-06-06 11:13:02.689	2026-06-06 11:13:02.689
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Enrollment" (id, "studentId", "courseId", "enrolledAt", "completedAt", progress, status, "paymentId", "sponsorshipId") FROM stdin;
cmqnui4ba0001d427te28s7kk	cmqku2zbu00013u1qbthq3afd	cmqm4xmwo0005fzym9rhv5byg	2026-06-21 13:51:46.774	\N	0	ACTIVE	\N	\N
\.


--
-- Data for Name: Extension; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Extension" (id, "studentId", "itemId", "itemType", "courseId", "extendedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ExtensionRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExtensionRequest" (id, "studentId", "itemId", "itemType", "courseId", reason, status, "requestedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Forum; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Forum" (id, "courseId") FROM stdin;
\.


--
-- Data for Name: ForumPost; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ForumPost" (id, "forumId", "authorId", title, content, "isPinned", "createdAt") FROM stdin;
\.


--
-- Data for Name: ForumReply; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ForumReply" (id, "postId", "authorId", content, "createdAt") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lesson" (id, "sectionId", title, type, content, "videoUrl", duration, "order", "isFree", "isPreview", "bunnyVideoId", "forumMarks", "dueDate") FROM stdin;
cmqm7qfur0003676pzxgtogtb	cmqm7o0px0001676p3m8poipq	The First 150 Years of Christianity in the Roman World	VIDEO	\N	https://youtu.be/oM8Gcn1gbRw?si=XNRIeYTwonTZcFYe	780	0	f	f	\N	\N	\N
cmqm7xxk40005676pf5itb3zf	cmqm7o0px0001676p3m8poipq	Early Christian Schisms - Before Imperium - Extra History	VIDEO	\N	https://youtu.be/E1ZZeCDGHJE?si=qGqhNLOde2OZQeno	480	1	f	f	\N	\N	\N
cmqm830ov000g676pi9q80t1h	cmqm7o0px0001676p3m8poipq	What lessons can contemporary believers learn from the faith and commitment of the early church?	FORUM	Give a Reply for this Question	\N	0	3	f	f	\N	25	\N
cmqm88xop000p676peegc2hlt	cmqm84hxm000i676p1tz73xr2	Church History Timeline Project (1,000–1,500 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmqmas8i9002efjtat36qtmqu	cmqma4r8j0012fjtawds1ajg0	Leadership, 5 Things Jesus Teaches us about Leadership	VIDEO	\N	https://youtu.be/1ru9B3E1joY?si=O8jS_y-w9N85v09B	660	0	f	f	\N	\N	\N
cmqmaunv0002jfjtabouyu5z4	cmqma4r8j0012fjtawds1ajg0	Ministry Development Project (1,000–1,500 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmqmb15gu003mfjtagdy38md2	cmqma4r8j0012fjtawds1ajg0	Forum 2	FORUM	What challenges do Christian leaders face today, and how can they remain faithful to their calling?	\N	0	3	f	f	\N	25	\N
cmqm80ohb000c676pmvmgotrk	cmqm7o0px0001676p3m8poipq	Historical Reflection Essay (700–1,000 words)	ASSIGNMENT	\N	\N	0	2	f	f	\N	\N	\N
cmqm861xv000k676palb9pam4	cmqm84hxm000i676p1tz73xr2	 Why did the Protestant Reformation Happen?	VIDEO	\N	https://youtu.be/cXYyIBdBubE?si=k3bckFT9v9I71lt0	720	0	f	f	\N	\N	\N
cmqm8b1ct000t676pealzxzcv	cmqm84hxm000i676p1tz73xr2	In what ways has the Protestant Reformation shaped the beliefs and practices of the modern Church?	FORUM	Give as reply for the Forum	\N	0	2	f	f	\N	25	\N
cmqm8cx3c000w676p4tm0ux3m	cmqm84hxm000i676p1tz73xr2	Week 2 Quiz	QUIZ		\N	0	3	f	f	\N	\N	\N
cmqm9bhoc0002fjtamemwjsgb	cmqm7o0px0001676p3m8poipq	Week 1 Quiz	QUIZ		\N	0	4	f	f	\N	\N	\N
cmqma7u560014fjta1di1my64	cmqma3dhl0010fjta6rse61y7	What is Pastoral Ministry?	VIDEO	\N	https://youtu.be/hyJKt2hbod8?si=L2H06iZ1wqsw-TJ7	180	0	f	f	\N	\N	\N
cmqmag2e2001dfjtatsq6s9pj	cmqma3dhl0010fjta6rse61y7	Disscusion Week 1	FORUM	Why is servant leadership essential for effective pastoral ministry in the twenty-first century?	\N	0	2	f	f	\N	25	\N
cmqmagxos001gfjtatxn5zxo5	cmqma3dhl0010fjta6rse61y7	Week 1 Quiz	QUIZ		\N	0	3	f	f	\N	\N	\N
cmqmab2yd0019fjtan1gr22cr	cmqma3dhl0010fjta6rse61y7	Reflection Paper (700–1,000 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmqmav4yw002ofjta6c5ocmpl	cmqma4r8j0012fjtawds1ajg0	Week 2 Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
\.


--
-- Data for Name: LessonProgress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LessonProgress" (id, "enrollmentId", "lessonId", "completedAt", "watchedSeconds") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "senderId", "receiverId", content, "sentAt", "readAt") FROM stdin;
\.


--
-- Data for Name: Note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Note" (id, "studentId", "lessonId", content, "timestamp", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, body, link, "isRead", "createdAt") FROM stdin;
cmqm3es9z0009pm88hqgecp70	cmql8quqk0000h58xt3rfj7uo	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Pastoral Theology and Christian Leadership"	/instructor/courses	f	2026-06-20 08:25:35.4
cmqm3tuvc0003fzym8bq3opk2	cmql8quqk0000h58xt3rfj7uo	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Pastoral Theology and Christian Leadership"	/instructor/courses	f	2026-06-20 08:37:18.601
cmqm4y65c0009fzym3c9exbgf	cmqku2zbu00013u1qbthq3afd	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Church History and Historical Theology"	/instructor/courses	f	2026-06-20 09:08:39.456
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "studentId", "courseId", amount, currency, "stripePaymentId", status, "isSponsored", "createdAt") FROM stdin;
\.


--
-- Data for Name: PayoutRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PayoutRequest" (id, "instructorId", amount, currency, status, "bankDetails", note, "adminNote", "requestedAt", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Program" (id, title, description, thumbnail, "thumbnailKey", duration, tags, status, "createdAt", "updatedAt") FROM stdin;
cmqdmxali00009bd9nmskius7	Master of Divinity (M.Div.)	The Master of Divinity (M.Div.) program is a comprehensive theological and ministerial training course designed to equip students with a strong foundation in Biblical studies, Christian doctrine, spiritual formation, pastoral ministry, preaching, missions, and leadership. Through structured coursework and practical ministry experience, students will be prepared to serve effectively in churches, missions, and Christian organizations while growing in their relationship with Christ and commitment to His Kingdom.	\N	\N	3 Years	[]	PUBLISHED	2026-06-14 10:21:56.071	2026-06-21 20:17:07.704
\.


--
-- Data for Name: ProgramApplication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProgramApplication" (id, "programId", "mediumOfStudy", "fullName", dob, gender, "maritalStatus", nationality, "aadhaarNumber", "passportPhotoUrl", "mobileNumber", "whatsappNumber", email, "permanentAddress", "currentAddress", "highestQualification", "previousInstitution", "yearOfCompletion", "marksOrGrade", "certificatesUrls", "isBornAgain", "churchName", "churchAddress", "pastorName", "ministryExperience", "callingStatement", "reference1Name", "reference1Phone", "reference1Relation", "reference2Name", "reference2Phone", "reference2Relation", "declarationName", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProgramEnrollment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProgramEnrollment" (id, "studentId", "programId", status, "enrolledAt", "completedAt", "currentCourseId") FROM stdin;
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Question" (id, "quizId", text, type, points, "order", "scriptureRef") FROM stdin;
cmqm8r0py0010676pjacvj8tx	cmqm8cx3g000y676prkm8offi	1. Who initiated the Protestant Reformation in 1517?	MCQ	1	0	\N
cmqm8syoz0016676pf1wpfvuc	cmqm8cx3g000y676prkm8offi	2. What document did Martin Luther publish in 1517?	MCQ	1	1	\N
cmqm8u3py001c676px5058mj9	cmqm8cx3g000y676prkm8offi	3. Which doctrine emphasizes salvation by faith alone?	MCQ	1	2	\N
cmqm8vcaf001i676pc0ms9r2b	cmqm8cx3g000y676prkm8offi	4. Who wrote Institutes of the Christian Religion?	MCQ	1	3	\N
cmqm8web8001o676p3s2ey700	cmqm8cx3g000y676prkm8offi	5. Which movement emphasized global evangelization during the eighteenth and nineteenth centuries?	MCQ	1	4	\N
cmqm9d2kp0006fjtav409qnoe	cmqm9bhof0004fjta9a419oal	1. Which event marked the birth of the Christian Church?	MCQ	1	0	\N
cmqm9ecor000cfjta9zx2tdhr	cmqm9bhof0004fjta9a419oal	2. Who was the first Christian martyr?	MCQ	1	1	\N
cmqm9fc12000ifjtaacd7joj3	cmqm9bhof0004fjta9a419oal	3. Which Roman emperor legalized Christianity through the Edict of Milan in AD 313?	MCQ	1	2	\N
cmqm9gdit000ofjtaypczypg1	cmqm9bhof0004fjta9a419oal	4. Which church council affirmed the deity of Christ in AD 325?	MCQ	1	3	\N
cmqm9hkp9000ufjtav6vc7j7n	cmqm9bhof0004fjta9a419oal	5. Who is known as the "Father of Western Monasticism"?	MCQ	1	4	\N
cmqmaiod1001kfjtalfgwev8o	cmqmagxoz001ifjtap3v7ekhu	1. Which passage outlines the qualifications for overseers?	MCQ	1	0	\N
cmqmak1ay001qfjta272cjzdk	cmqmagxoz001ifjtap3v7ekhu	2. Jesus described Himself as the:	MCQ	1	1	\N
cmqmalcwk001wfjta3g37o2lr	cmqmagxoz001ifjtap3v7ekhu	3. According to 1 Peter 5:1–4, elders are to shepherd God's flock:	MCQ	1	2	\N
cmqmamfes0022fjtau37xuuwt	cmqmagxoz001ifjtap3v7ekhu	4. Servant leadership is best demonstrated by:	MCQ	1	3	\N
cmqmanq9v0028fjtax35vzqnc	cmqmagxoz001ifjtap3v7ekhu	5. Which quality is required of church leaders according to Titus 1?	MCQ	1	4	\N
cmqmawb38002sfjtabz083w4a	cmqmav4z2002qfjta8sk12q8p	1. Which passage contains the Great Commission?	MCQ	1	0	\N
cmqmaxje6002yfjtaszngtc1z	cmqmav4z2002qfjta8sk12q8p	2. According to Ephesians 4:11–12, church leaders are given to:\n\n	MCQ	1	1	\N
cmqmaygcy0034fjtazgrmd7ic	cmqmav4z2002qfjta8sk12q8p	3. Paul instructed the Ephesian elders to:	MCQ	1	2	\N
cmqmazbow003afjtat094ha02	cmqmav4z2002qfjta8sk12q8p	4. Which attitude is emphasized in Philippians 2?\n	MCQ	1	3	\N
cmqmb06zf003gfjta053o2z64	cmqmav4z2002qfjta8sk12q8p	5. Christian leadership should primarily reflect:	MCQ	1	4	\N
\.


--
-- Data for Name: Quiz; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Quiz" (id, "lessonId", title, "passingScore", "timeLimit", "maxAttempts", "rubricId") FROM stdin;
cmqm8cx3g000y676prkm8offi	cmqm8cx3c000w676p4tm0ux3m	Week 2 Quiz	70	120	2	\N
cmqm9bhof0004fjta9a419oal	cmqm9bhoc0002fjtamemwjsgb	Week 1 Quiz	70	300	1	\N
cmqmagxoz001ifjtap3v7ekhu	cmqmagxos001gfjtatxn5zxo5	Week 1 Quiz	70	180	2	\N
cmqmav4z2002qfjta8sk12q8p	cmqmav4yw002ofjta6c5ocmpl	Week 2 Quiz	70	240	2	\N
\.


--
-- Data for Name: QuizAttempt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."QuizAttempt" (id, "quizId", "studentId", score, passed, answers, "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: ReadingMaterial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ReadingMaterial" (id, "sectionId", title, description, "fileUrl", "fileKey", "fileType", "fileSize", "order", "createdAt") FROM stdin;
cmqm7yqzc0007676pniigiguw	cmqm7o0px0001676p3m8poipq	Week 1 Mateial	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm7o0px0001676p3m8poipq/1781951583565-undefined-certificate.pdf	reading-materials/cmqm7o0px0001676p3m8poipq/1781951583565-undefined-certificate.pdf	pdf	334959	0	2026-06-20 10:33:05.304
cmqm7z6910009676pt9184nm4	cmqm7o0px0001676p3m8poipq	Week 1.2	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm7o0px0001676p3m8poipq/1781951603525-undefined-certificate--3-.pdf	reading-materials/cmqm7o0px0001676p3m8poipq/1781951603525-undefined-certificate--3-.pdf	pdf	334959	1	2026-06-20 10:33:25.093
cmqm87qik000m676p0bgi01un	cmqm84hxm000i676p1tz73xr2	Week 2 Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm84hxm000i676p1tz73xr2/1781952003828-undefined-certificate--1-.pdf	reading-materials/cmqm84hxm000i676p1tz73xr2/1781952003828-undefined-certificate--1-.pdf	pdf	334959	0	2026-06-20 10:40:04.604
cmqma8s0z0016fjtaisqfkrd5	cmqma3dhl0010fjta6rse61y7	Week 1 Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqma3dhl0010fjta6rse61y7/1781955411103-Bible-Story.pdf	reading-materials/cmqma3dhl0010fjta6rse61y7/1781955411103-Bible-Story.pdf	pdf	139145	0	2026-06-20 11:36:52.452
cmqmatex8002gfjtank6d6kjw	cmqma4r8j0012fjtawds1ajg0	Week 2 Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqma4r8j0012fjtawds1ajg0/1781956373587-undefined-certificate.pdf	reading-materials/cmqma4r8j0012fjtawds1ajg0/1781956373587-undefined-certificate.pdf	pdf	334959	0	2026-06-20 11:52:55.245
\.


--
-- Data for Name: ReadingMaterialProgress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ReadingMaterialProgress" (id, "enrollmentId", "readingMaterialId", "completedAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "courseId", "studentId", rating, comment, "isApproved", "createdAt") FROM stdin;
\.


--
-- Data for Name: Rubric; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Rubric" (id, "courseId", title, description, "totalPoints", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RubricCriteria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RubricCriteria" (id, "rubricId", title, description, "maxPoints", "order") FROM stdin;
\.


--
-- Data for Name: RubricLevel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RubricLevel" (id, "criteriaId", label, description, points, "order") FROM stdin;
\.


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Section" (id, "courseId", title, description, objectives, "weekNumber", "isPublished", "order") FROM stdin;
cmqm7o0px0001676p3m8poipq	cmqm4xmwo0005fzym9rhv5byg	Week 1: The Early Church and the Medieval Period	This course provides a survey of the historical development of Christianity and the major theological traditions that have shaped the Church from the apostolic era to the present day. Students will examine significant events, influential leaders, ecumenical councils, the Protestant Reformation, missionary movements, and contemporary theological developments. Through the study of church history and historical theology, students will gain a deeper understanding of the continuity of the Christian faith and its relevance for ministry in the modern world.	[]	\N	f	0
cmqm84hxm000i676p1tz73xr2	cmqm4xmwo0005fzym9rhv5byg	Week 2: The Reformation and Modern Christianity	This module examines the Protestant Reformation and its theological significance, the rise of missionary movements, and the growth of Christianity throughout the modern era. Students will also consider contemporary challenges and opportunities facing the Church in the twenty-first century.	[]	\N	f	1
cmqma3dhl0010fjta6rse61y7	cmqm3bas20005pm88e08zdgem	Week 1: Foundations of Pastoral Ministry	This module introduces students to the biblical understanding of pastoral ministry and Christian leadership. Students will examine the qualifications and responsibilities of pastors, the model of servant leadership demonstrated by Jesus Christ, and the importance of shepherding God's people with love and faithfulness.	[]	\N	f	0
cmqma4r8j0012fjtawds1ajg0	cmqm3bas20005pm88e08zdgem	Week 2: Christian Leadership and Ministry Practice	This module focuses on the practical aspects of Christian leadership, including spiritual formation, discipleship, church administration, pastoral counseling, and ministry development. Students will explore ways to effectively lead congregations while maintaining personal spiritual growth and integrity.	[]	\N	f	1
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiteSettings" (id, "siteName", "logoUrl", tagline, "contactEmail", "contactWhatsApp", "primaryColor", "smtpConfig", "stripeConfig", "storageConfig", "updatedAt") FROM stdin;
cmqku2zfs007f3u1qauy3l7qd	CWAY Academy	\N	Coach. Challenge. Commission.	support@cwayacademy.com	+919663831220	#C9973A	\N	\N	\N	2026-06-19 11:16:42.088
\.


--
-- Data for Name: Sponsorship; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Sponsorship" (id, "sponsorName", "sponsorEmail", amount, currency, "stripePaymentId", status, message, "studentId", "courseId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Submission" (id, "assignmentId", "studentId", content, "fileUrl", "submittedAt", grade, feedback, "gradedAt", "isGraded") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, "passwordHash", role, avatar, bio, phone, church, location, "preferredLanguage", "isVerified", "isBanned", "payoutPercentage", "emailVerifyToken", "resetToken", "resetTokenExpiry", "googleId", "createdAt", "updatedAt", "socialLinks", title, credentials, "yearsExperience", expertise, "notificationPrefs") FROM stdin;
cmql8quqk0000h58xt3rfj7uo	Joel R Tharakan	joelrtharakan@gmail.com	$2b$12$3D98EqtM5sqS7/R/7Mln4evVTRtmO6vEwon1jg4oQkbCy4Il2EXE2	INSTRUCTOR	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781892569411-cmql8quqk0000h58xt3rfj7uo.jpeg		+91 6360238632	Crossway AG Church	BENGALURU	ENGLISH	t	f	0	\N	\N	\N	\N	2026-06-19 18:07:10.364	2026-06-20 09:27:33.101	\N	Mr.	B.Tech	1	[]	{}
cmqku2zby00023u1qy4o9yich	Pr. Robin Ninan	pr.robin@cwayacademy.com	$2b$12$uyuVqkBdoUtDZiZp.bCrCutMtvfAS9m9rNhM45WAQ58SXwqwCsUNW	INSTRUCTOR	\N	Holding a Master of Divinity and extensive experience in leadership, management, and media. Secretary-Trustee of CWAY Missions Religious Trust, Bangalore.	\N	CWAY Missions	Bangalore, India	ENGLISH	t	f	0	\N	\N	\N	\N	2026-06-19 11:16:41.95	2026-06-20 09:27:39.205	\N	\N	\N	\N	[]	{}
cmqku2zbu00013u1qbthq3afd	Dr. Reeju Tharakan	dr.reeju@cwayacademy.com	$2b$12$uyuVqkBdoUtDZiZp.bCrCutMtvfAS9m9rNhM45WAQ58SXwqwCsUNW	INSTRUCTOR	\N	With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education. Lead Pastor of Immanuel AG Church in Dubai and President-Trustee of CWAY Missions.	\N	Immanuel AG Church, Dubai	Dubai, UAE	ENGLISH	t	f	0	\N	\N	\N	\N	2026-06-19 11:16:41.947	2026-06-20 09:27:43.758	\N	\N	\N	\N	[]	{}
cmqku2zct000k3u1qegpd6yok	Reviewer 1	reviewer1@cway.dev	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.982	2026-06-19 11:16:41.982	\N	\N	\N	\N	[]	{}
cmqku2zd0000n3u1q8wvzo2kx	Reviewer 2	reviewer2@cway.dev	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.988	2026-06-19 11:16:41.988	\N	\N	\N	\N	[]	{}
cmqku2zd4000q3u1q3cmhdn0m	Reviewer 3	reviewer3@cway.dev	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.993	2026-06-19 11:16:41.993	\N	\N	\N	\N	[]	{}
cmqku2zeo004t3u1qdff43hnt	Rahul Sharma	student1@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Grace Bible Church	Kerala	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.049	2026-06-19 11:16:42.049	\N	\N	\N	\N	[]	{}
cmqku2zep004u3u1q9vsn4vwi	Priya Nair	student2@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Bethel Fellowship	Tamil Nadu	TAMIL	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.05	2026-06-19 11:16:42.05	\N	\N	\N	\N	[]	{}
cmqku2zeq004v3u1qxmenxe88	Samuel David	student3@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Emmanuel Assembly	Karnataka	TELUGU	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.05	2026-06-19 11:16:42.05	\N	\N	\N	\N	[]	{}
cmqku2zeq004w3u1qss13hsfr	Mary Thomas	student4@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Zion Chapel	Andhra Pradesh	MALAYALAM	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.051	2026-06-19 11:16:42.051	\N	\N	\N	\N	[]	{}
cmqku2zer004x3u1q5zxvdqbs	Amit Patel	student5@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Calvary Tabernacle	Maharashtra	KANNADA	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.052	2026-06-19 11:16:42.052	\N	\N	\N	\N	[]	{}
cmqku2zes004y3u1qxcgenhbm	Shalini Kumari	student6@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Hebron Assembly	Jharkhand	HINDI	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.052	2026-06-19 11:16:42.052	\N	\N	\N	\N	[]	{}
cmqku2zet004z3u1qsf61dlmm	Ebenezer Paul	student7@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Trinity Covenant	Assam	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.053	2026-06-19 11:16:42.053	\N	\N	\N	\N	[]	{}
cmqku2zet00503u1q3tos24vz	Rupali Das	student8@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Redeemer Assembly	West Bengal	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.054	2026-06-19 11:16:42.054	\N	\N	\N	\N	[]	{}
cmqku2zeu00513u1q4ljp2a52	John Wesley	student9@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Faith Mission	Uttar Pradesh	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.054	2026-06-19 11:16:42.054	\N	\N	\N	\N	[]	{}
cmqku2zeu00523u1qd33zl1p7	Mercy Mathew	student10@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Hope Fellowship	Telangana	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.055	2026-06-19 11:16:42.055	\N	\N	\N	\N	[]	{}
cmqku2zbo00003u1qrtqtk0h8	CWAY Admin	admin@cwayacademy.com	$2b$12$bp47KfmHG258KcNitM5YGOdwz3Y/eIcyfvFq6oKMOtKvaSR6MmXZC	ADMIN	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781889985771-cmqku2zbo00003u1qrtqtk0h8.jpeg	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.941	2026-06-19 17:26:27.896	\N	\N	\N	\N	[]	{}
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
edce18fe-2397-4e91-a054-e8c012145bd4	5a22a5f113524a60e8cc93a92d15072d8728bd8fd0a7c072d414f99c90952dba	2026-06-17 09:56:25.936779+00	20260617095518_init_postgres		\N	2026-06-17 09:56:25.936779+00	0
\.


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: Answer Answer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceRecord AttendanceRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceSession AttendanceSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: CertificateTemplate CertificateTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CertificateTemplate"
    ADD CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Certificate Certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CourseInvitation CourseInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseInvitation"
    ADD CONSTRAINT "CourseInvitation_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: Curriculum Curriculum_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Curriculum"
    ADD CONSTRAINT "Curriculum_pkey" PRIMARY KEY (id);


--
-- Name: DiscussionReply DiscussionReply_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DiscussionReply"
    ADD CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY (id);


--
-- Name: Discussion Discussion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplate EmailTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: ExtensionRequest ExtensionRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_pkey" PRIMARY KEY (id);


--
-- Name: Extension Extension_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Extension"
    ADD CONSTRAINT "Extension_pkey" PRIMARY KEY (id);


--
-- Name: ForumPost ForumPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_pkey" PRIMARY KEY (id);


--
-- Name: ForumReply ForumReply_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForumReply"
    ADD CONSTRAINT "ForumReply_pkey" PRIMARY KEY (id);


--
-- Name: Forum Forum_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Forum"
    ADD CONSTRAINT "Forum_pkey" PRIMARY KEY (id);


--
-- Name: LessonProgress LessonProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Note Note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PayoutRequest PayoutRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY (id);


--
-- Name: ProgramApplication ProgramApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProgramApplication"
    ADD CONSTRAINT "ProgramApplication_pkey" PRIMARY KEY (id);


--
-- Name: ProgramEnrollment ProgramEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProgramEnrollment"
    ADD CONSTRAINT "ProgramEnrollment_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: QuizAttempt QuizAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Quiz Quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY (id);


--
-- Name: ReadingMaterialProgress ReadingMaterialProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReadingMaterialProgress"
    ADD CONSTRAINT "ReadingMaterialProgress_pkey" PRIMARY KEY (id);


--
-- Name: ReadingMaterial ReadingMaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReadingMaterial"
    ADD CONSTRAINT "ReadingMaterial_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: RubricCriteria RubricCriteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RubricCriteria"
    ADD CONSTRAINT "RubricCriteria_pkey" PRIMARY KEY (id);


--
-- Name: RubricLevel RubricLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RubricLevel"
    ADD CONSTRAINT "RubricLevel_pkey" PRIMARY KEY (id);


--
-- Name: Rubric Rubric_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Rubric"
    ADD CONSTRAINT "Rubric_pkey" PRIMARY KEY (id);


--
-- Name: Section Section_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: Sponsorship Sponsorship_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sponsorship"
    ADD CONSTRAINT "Sponsorship_pkey" PRIMARY KEY (id);


--
-- Name: Submission Submission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Assignment_lessonId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Assignment_lessonId_key" ON public."Assignment" USING btree ("lessonId");


--
-- Name: AttendanceRecord_sessionId_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON public."AttendanceRecord" USING btree ("sessionId", "studentId");


--
-- Name: BlogPost_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_slug_idx" ON public."BlogPost" USING btree (slug);


--
-- Name: BlogPost_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlogPost_slug_key" ON public."BlogPost" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Certificate_studentId_courseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Certificate_studentId_courseId_key" ON public."Certificate" USING btree ("studentId", "courseId");


--
-- Name: Certificate_uniqueCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Certificate_uniqueCode_key" ON public."Certificate" USING btree ("uniqueCode");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: CourseInvitation_courseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CourseInvitation_courseId_key" ON public."CourseInvitation" USING btree ("courseId");


--
-- Name: CourseInvitation_instructorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseInvitation_instructorId_idx" ON public."CourseInvitation" USING btree ("instructorId");


--
-- Name: CourseInvitation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseInvitation_status_idx" ON public."CourseInvitation" USING btree (status);


--
-- Name: Course_instructorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Course_instructorId_idx" ON public."Course" USING btree ("instructorId");


--
-- Name: Course_programId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Course_programId_idx" ON public."Course" USING btree ("programId");


--
-- Name: Course_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Course_slug_idx" ON public."Course" USING btree (slug);


--
-- Name: Course_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Course_slug_key" ON public."Course" USING btree (slug);


--
-- Name: Course_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Course_status_idx" ON public."Course" USING btree (status);


--
-- Name: Curriculum_courseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Curriculum_courseId_key" ON public."Curriculum" USING btree ("courseId");


--
-- Name: EmailTemplate_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EmailTemplate_name_key" ON public."EmailTemplate" USING btree (name);


--
-- Name: Enrollment_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Enrollment_courseId_idx" ON public."Enrollment" USING btree ("courseId");


--
-- Name: Enrollment_studentId_courseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON public."Enrollment" USING btree ("studentId", "courseId");


--
-- Name: Enrollment_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Enrollment_studentId_idx" ON public."Enrollment" USING btree ("studentId");


--
-- Name: ExtensionRequest_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExtensionRequest_courseId_idx" ON public."ExtensionRequest" USING btree ("courseId");


--
-- Name: ExtensionRequest_itemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExtensionRequest_itemId_idx" ON public."ExtensionRequest" USING btree ("itemId");


--
-- Name: ExtensionRequest_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExtensionRequest_studentId_idx" ON public."ExtensionRequest" USING btree ("studentId");


--
-- Name: Extension_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Extension_courseId_idx" ON public."Extension" USING btree ("courseId");


--
-- Name: Extension_itemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Extension_itemId_idx" ON public."Extension" USING btree ("itemId");


--
-- Name: Extension_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Extension_studentId_idx" ON public."Extension" USING btree ("studentId");


--
-- Name: Extension_studentId_itemId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Extension_studentId_itemId_key" ON public."Extension" USING btree ("studentId", "itemId");


--
-- Name: ForumPost_forumId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ForumPost_forumId_idx" ON public."ForumPost" USING btree ("forumId");


--
-- Name: ForumReply_postId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ForumReply_postId_idx" ON public."ForumReply" USING btree ("postId");


--
-- Name: Forum_courseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Forum_courseId_key" ON public."Forum" USING btree ("courseId");


--
-- Name: LessonProgress_enrollmentId_lessonId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON public."LessonProgress" USING btree ("enrollmentId", "lessonId");


--
-- Name: Lesson_sectionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lesson_sectionId_idx" ON public."Lesson" USING btree ("sectionId");


--
-- Name: Message_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderId_receiverId_idx" ON public."Message" USING btree ("senderId", "receiverId");


--
-- Name: Note_studentId_lessonId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Note_studentId_lessonId_key" ON public."Note" USING btree ("studentId", "lessonId");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: Payment_stripePaymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON public."Payment" USING btree ("stripePaymentId");


--
-- Name: PayoutRequest_instructorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PayoutRequest_instructorId_idx" ON public."PayoutRequest" USING btree ("instructorId");


--
-- Name: ProgramApplication_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProgramApplication_email_idx" ON public."ProgramApplication" USING btree (email);


--
-- Name: ProgramApplication_programId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProgramApplication_programId_idx" ON public."ProgramApplication" USING btree ("programId");


--
-- Name: ProgramEnrollment_studentId_programId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProgramEnrollment_studentId_programId_key" ON public."ProgramEnrollment" USING btree ("studentId", "programId");


--
-- Name: Program_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Program_status_idx" ON public."Program" USING btree (status);


--
-- Name: Question_quizId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_quizId_idx" ON public."Question" USING btree ("quizId");


--
-- Name: QuizAttempt_quizId_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QuizAttempt_quizId_studentId_idx" ON public."QuizAttempt" USING btree ("quizId", "studentId");


--
-- Name: Quiz_lessonId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Quiz_lessonId_key" ON public."Quiz" USING btree ("lessonId");


--
-- Name: ReadingMaterialProgress_enrollmentId_readingMaterialId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ReadingMaterialProgress_enrollmentId_readingMaterialId_key" ON public."ReadingMaterialProgress" USING btree ("enrollmentId", "readingMaterialId");


--
-- Name: Review_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Review_courseId_idx" ON public."Review" USING btree ("courseId");


--
-- Name: Review_courseId_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Review_courseId_studentId_key" ON public."Review" USING btree ("courseId", "studentId");


--
-- Name: Section_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Section_courseId_idx" ON public."Section" USING btree ("courseId");


--
-- Name: Sponsorship_stripePaymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Sponsorship_stripePaymentId_key" ON public."Sponsorship" USING btree ("stripePaymentId");


--
-- Name: Submission_assignmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Submission_assignmentId_idx" ON public."Submission" USING btree ("assignmentId");


--
-- Name: Submission_assignmentId_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Submission_assignmentId_studentId_key" ON public."Submission" USING btree ("assignmentId", "studentId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Announcement Announcement_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Answer Answer_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Assignment Assignment_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Assignment Assignment_rubricId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES public."Rubric"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AttendanceRecord AttendanceRecord_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AttendanceSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceRecord AttendanceRecord_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceSession AttendanceSession_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceSession AttendanceSession_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogPost BlogPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Certificate Certificate_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certificate Certificate_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certificate Certificate_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."CertificateTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Coupon Coupon_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseInvitation CourseInvitation_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseInvitation"
    ADD CONSTRAINT "CourseInvitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseInvitation CourseInvitation_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseInvitation"
    ADD CONSTRAINT "CourseInvitation_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Course Course_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Curriculum Curriculum_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Curriculum"
    ADD CONSTRAINT "Curriculum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DiscussionReply DiscussionReply_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DiscussionReply"
    ADD CONSTRAINT "DiscussionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DiscussionReply DiscussionReply_discussionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DiscussionReply"
    ADD CONSTRAINT "DiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Enrollment Enrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Enrollment Enrollment_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Enrollment Enrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionRequest ExtensionRequest_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionRequest ExtensionRequest_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Extension Extension_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Extension"
    ADD CONSTRAINT "Extension_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Extension Extension_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Extension"
    ADD CONSTRAINT "Extension_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumPost ForumPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumPost ForumPost_forumId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES public."Forum"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ForumReply ForumReply_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForumReply"
    ADD CONSTRAINT "ForumReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumReply ForumReply_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForumReply"
    ADD CONSTRAINT "ForumReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."ForumPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Forum Forum_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Forum"
    ADD CONSTRAINT "Forum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LessonProgress LessonProgress_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LessonProgress LessonProgress_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Note Note_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Note Note_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PayoutRequest PayoutRequest_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramApplication ProgramApplication_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProgramApplication"
    ADD CONSTRAINT "ProgramApplication_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramEnrollment ProgramEnrollment_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProgramEnrollment"
    ADD CONSTRAINT "ProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramEnrollment ProgramEnrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProgramEnrollment"
    ADD CONSTRAINT "ProgramEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuizAttempt QuizAttempt_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuizAttempt QuizAttempt_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quiz Quiz_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quiz Quiz_rubricId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES public."Rubric"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReadingMaterialProgress ReadingMaterialProgress_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReadingMaterialProgress"
    ADD CONSTRAINT "ReadingMaterialProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingMaterialProgress ReadingMaterialProgress_readingMaterialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReadingMaterialProgress"
    ADD CONSTRAINT "ReadingMaterialProgress_readingMaterialId_fkey" FOREIGN KEY ("readingMaterialId") REFERENCES public."ReadingMaterial"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingMaterial ReadingMaterial_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReadingMaterial"
    ADD CONSTRAINT "ReadingMaterial_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RubricCriteria RubricCriteria_rubricId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RubricCriteria"
    ADD CONSTRAINT "RubricCriteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES public."Rubric"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RubricLevel RubricLevel_criteriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RubricLevel"
    ADD CONSTRAINT "RubricLevel_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES public."RubricCriteria"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rubric Rubric_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Rubric"
    ADD CONSTRAINT "Rubric_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Section Section_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sponsorship Sponsorship_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sponsorship"
    ADD CONSTRAINT "Sponsorship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Submission Submission_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Ydw4f5fAkedwsC8M1GaTyIz8bitkwIKJ0chTSW1sAxPpKfwsNmMMEBARXLQuyjg

