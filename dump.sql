--
-- PostgreSQL database dump
--

\restrict 6c8FrNy6YldaaVumap2m71sewAmuh509C4uqeMMdYGfhCx4UUloiW67jv0a4auw

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
-- Name: Announcement; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Announcement" OWNER TO cway;

--
-- Name: Answer; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."Answer" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    text text NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Answer" OWNER TO cway;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Assignment" OWNER TO cway;

--
-- Name: AttendanceRecord; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."AttendanceRecord" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "studentId" text NOT NULL,
    status text DEFAULT 'ABSENT'::text NOT NULL,
    "markedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text
);


ALTER TABLE public."AttendanceRecord" OWNER TO cway;

--
-- Name: AttendanceSession; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."AttendanceSession" OWNER TO cway;

--
-- Name: BlogPost; Type: TABLE; Schema: public; Owner: cway
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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BlogPost" OWNER TO cway;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Category" OWNER TO cway;

--
-- Name: Certificate; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Certificate" OWNER TO cway;

--
-- Name: CertificateTemplate; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."CertificateTemplate" OWNER TO cway;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Coupon" OWNER TO cway;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: cway
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
    "programId" text
);


ALTER TABLE public."Course" OWNER TO cway;

--
-- Name: CourseInvitation; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."CourseInvitation" OWNER TO cway;

--
-- Name: Curriculum; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Curriculum" OWNER TO cway;

--
-- Name: Discussion; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Discussion" OWNER TO cway;

--
-- Name: DiscussionReply; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."DiscussionReply" (
    id text NOT NULL,
    "discussionId" text NOT NULL,
    "authorId" text NOT NULL,
    content text NOT NULL,
    "isInstructor" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DiscussionReply" OWNER TO cway;

--
-- Name: EmailTemplate; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."EmailTemplate" OWNER TO cway;

--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Enrollment" OWNER TO cway;

--
-- Name: Extension; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Extension" OWNER TO cway;

--
-- Name: ExtensionRequest; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."ExtensionRequest" OWNER TO cway;

--
-- Name: Forum; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."Forum" (
    id text NOT NULL,
    "courseId" text NOT NULL
);


ALTER TABLE public."Forum" OWNER TO cway;

--
-- Name: ForumPost; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."ForumPost" OWNER TO cway;

--
-- Name: ForumReply; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."ForumReply" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "authorId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ForumReply" OWNER TO cway;

--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Lesson" OWNER TO cway;

--
-- Name: LessonProgress; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."LessonProgress" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    "lessonId" text NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "watchedSeconds" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."LessonProgress" OWNER TO cway;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    content text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public."Message" OWNER TO cway;

--
-- Name: Note; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Note" OWNER TO cway;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Notification" OWNER TO cway;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Payment" OWNER TO cway;

--
-- Name: PayoutRequest; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."PayoutRequest" OWNER TO cway;

--
-- Name: Program; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Program" OWNER TO cway;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Question" OWNER TO cway;

--
-- Name: Quiz; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Quiz" OWNER TO cway;

--
-- Name: QuizAttempt; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."QuizAttempt" OWNER TO cway;

--
-- Name: ReadingMaterial; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."ReadingMaterial" OWNER TO cway;

--
-- Name: ReadingMaterialProgress; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."ReadingMaterialProgress" (
    id text NOT NULL,
    "enrollmentId" text NOT NULL,
    "readingMaterialId" text NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."ReadingMaterialProgress" OWNER TO cway;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Review" OWNER TO cway;

--
-- Name: Rubric; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Rubric" OWNER TO cway;

--
-- Name: RubricCriteria; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."RubricCriteria" (
    id text NOT NULL,
    "rubricId" text NOT NULL,
    title text NOT NULL,
    description text,
    "maxPoints" integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."RubricCriteria" OWNER TO cway;

--
-- Name: RubricLevel; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."RubricLevel" (
    id text NOT NULL,
    "criteriaId" text NOT NULL,
    label text NOT NULL,
    description text NOT NULL,
    points integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."RubricLevel" OWNER TO cway;

--
-- Name: Section; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Section" OWNER TO cway;

--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."SiteSettings" OWNER TO cway;

--
-- Name: Sponsorship; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Sponsorship" OWNER TO cway;

--
-- Name: Submission; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."Submission" OWNER TO cway;

--
-- Name: User; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."User" OWNER TO cway;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public._prisma_migrations OWNER TO cway;

--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Announcement" (id, "courseId", "sectionId", "authorId", title, content, "isPinned", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Answer; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Answer" (id, "questionId", text, "isCorrect") FROM stdin;
cmq6ko7a6000c68q3wgbu56j5	cmq6ko7a6000b68q3p2ke5vhp	Written by church leaders	f
cmq6ko7a6000d68q38rvwhpuc	cmq6ko7a6000b68q3p2ke5vhp	Inspired by God	t
cmq6ko7a6000e68q3ok6pn1om	cmq6ko7a6000b68q3p2ke5vhp	A collection of stories	f
cmq6ko7a6000f68q374co5oyl	cmq6ko7a6000b68q3p2ke5vhp	Open to personal interpretation only	f
cmq6kp8ng000i68q304funf6p	cmq6kp8ng000h68q3uq1s5qu4	Good works alone	f
cmq6kp8ng000j68q3c0geg1q2	cmq6kp8ng000h68q3uq1s5qu4	Church attendance	f
cmq6kp8ng000k68q3je7utcy8	cmq6kp8ng000h68q3uq1s5qu4	Grace through faith in Jesus Christ	t
cmq6kp8ng000l68q30x7npv1f	cmq6kp8ng000h68q3uq1s5qu4	Religious traditions	f
cmq6kq89x000o68q3z87oav19	cmq6kq89x000n68q3o57f3you	The Apostles	f
cmq6kq89x000p68q3rrxdjn3g	cmq6kq89x000n68q3o57f3you	Angels	f
cmq6kq89x000q68q3fmdlu03b	cmq6kq89x000n68q3o57f3you	God the Father through the power of the Holy Spirit	t
cmq6kq89x000r68q37dfhcque	cmq6kq89x000n68q3o57f3you	The Roman soldiers	f
cmq6ks1is000u68q311295alr	cmq6ks1is000t68q37daiexcs	God the Father	f
cmq6ks1is000v68q3sx5129vg	cmq6ks1is000t68q37daiexcs	Jesus Christ	f
cmq6ks1is000w68q34gnxi7ju	cmq6ks1is000t68q37daiexcs	The Holy Spirit	t
cmq6ks1is000x68q3iibsf3wo	cmq6ks1is000t68q37daiexcs	Moses	f
cmq6kt8ea001068q3qaaqhojq	cmq6kt8ea000z68q3gni8vvef	To impress others	f
cmq6kt8ea001168q3qq2ce618	cmq6kt8ea000z68q3gni8vvef	To communicate with God and grow spiritually	t
cmq6kt8ea001268q3n153k3ck	cmq6kt8ea000z68q3gni8vvef	To earn salvation	f
cmq6kt8ea001368q3ki0bgfkb	cmq6kt8ea000z68q3gni8vvef	To perform rituals	f
cmqglg27n000cm511nerj505o	cmqglg27n000bm5119ulmu62d	Church traditions only	f
cmqglg27n000dm5112ffbja2q	cmqglg27n000bm5119ulmu62d	Human wisdom and philosophy	f
cmqglg27n000em511sweveet9	cmqglg27n000bm5119ulmu62d	The inspired Word of God recorded in the Bible	t
cmqglg27n000fm511aeuaqd7r	cmqglg27n000bm5119ulmu62d	Religious writings from all faiths	f
cmqgligj7000mm5117hlqnt9k	cmqgli9jp000hm511z7om8g95	Written by prophets alone	f
cmqgligj7000nm511tzngz48x	cmqgli9jp000hm511z7om8g95	Inspired by God	t
cmqgligj7000om5119kvm7cyu	cmqgli9jp000hm511z7om8g95	Open to personal interpretation only	f
cmqgligj7000pm511sapumnax	cmqgli9jp000hm511z7om8g95	Historically inaccurate	f
cmqglkgpz000sm511ca5sulpn	cmqglkgpz000rm511s9b1leba	Inspiration	f
cmqglkgpz000tm511y0okzx12	cmqglkgpz000rm511s9b1leba	Illumination	f
cmqglkgpz000um511t7gd9xup	cmqglkgpz000rm511s9b1leba	Inerrancy	t
cmqglkgpz000vm5118s4i58xg	cmqglkgpz000rm511s9b1leba	Revelation	f
cmqgllqwc000ym511h1yg9fz9	cmqgllqwc000xm511j030ocyw	It contains human opinions.	f
cmqgllqwc000zm511qgrd0o4g	cmqgllqwc000xm511j030ocyw	It is based on cultural traditions.	f
cmqgllqwc0010m511r4f7mt7s	cmqgllqwc000xm511j030ocyw	It is God's revelation and provides guidance for faith and practice.	t
cmqgllqwc0011m5112zztd0e2	cmqgllqwc000xm511j030ocyw	It changes according to society.	f
cmqglnn1l0014m511igil2zm4	cmqglnn1l0013m511xpjjjmf3	John 3:16	f
cmqglnn1l0015m5111fl6myn3	cmqglnn1l0013m511xpjjjmf3	Psalm 23:1	f
cmqglnn1l0016m511oyfnugvl	cmqglnn1l0013m511xpjjjmf3	2 Peter 1:20–21	t
cmqglnn1l0017m511cmmt674y	cmqglnn1l0013m511xpjjjmf3	Matthew 5:9	f
cmqgna7co001um511xi361mkg	cmqgna7co001tm511pzah5cf3	Covenant	f
cmqgna7co001vm511dtuqhegj	cmqgna7co001tm511pzah5cf3	Rule or standard	t
cmqgna7co001wm5116d8kpv60	cmqgna7co001tm511pzah5cf3	Prophecy	f
cmqgna7co001xm511psz8x3q0	cmqgna7co001tm511pzah5cf3	Commandment	f
cmqgnb91s0020m511y1p2cfcm	cmqgnb91s001zm5115lohzzd2	100 years	f
cmqgnb91s0021m5119zzq7bbv	cmqgnb91s001zm5115lohzzd2	300 years	f
cmqgnb91s0022m5112ssaskwg	cmqgnb91s001zm5115lohzzd2	1,000 years	t
cmqgnb91s0023m511uqhku1km	cmqgnb91s001zm5115lohzzd2	2,000 years	f
cmqgnc8210026m511t2med83i	cmqgnc8210025m511xgqd5zzg	Writings	f
cmqgnc8210027m511pd1ptm4c	cmqgnc8210025m511xgqd5zzg	Gospels	f
cmqgnc8210028m511g677tsee	cmqgnc8210025m511xgqd5zzg	Prophets	f
cmqgnc8210029m511val61lqs	cmqgnc8210025m511xgqd5zzg	Torah	t
cmqgnd3q5002cm511r3he08a4	cmqgnd3q5002bm511pepvokso	24	f
cmqgnd3q5002dm511yxveq6ys	cmqgnd3q5002bm511pepvokso	27	t
cmqgnd3q5002em511eztxg1a0	cmqgnd3q5002bm511pepvokso	39	f
cmqgnd3q5002fm511qs8lwf1y	cmqgnd3q5002bm511pepvokso	46	f
cmqgne9lj002im511azjov85i	cmqgne9lj002hm511xt0z4dk3	Revelation	f
cmqgne9lj002jm511624409db	cmqgne9lj002hm511xt0z4dk3	Romans	f
cmqgne9lj002km511lnmv96i9	cmqgne9lj002hm511xt0z4dk3	Acts of the Apostles	t
cmqgne9lj002lm511jpnjeryl	cmqgne9lj002hm511xt0z4dk3	Genesis	f
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Assignment" (id, "lessonId", title, description, "dueDate", "maxScore", "attachmentUrl", "rubricId") FROM stdin;
cmq6kmtk3000468q3yh1guczo	cmq6kmtk0000268q3usw88xhn	Foundation in Christ Assignment	This assignment is designed to help you reflect on and apply the biblical truths learned in the Foundations of Christian Faith course.\n\nPart A: Short Answers\n\nWhy is the Bible considered the inspired Word of God?\nExplain the significance of Jesus Christ's death and resurrection.\nWhat is salvation, and how is it received according to the Bible?\nDescribe the role of the Holy Spirit in the life of a believer.\nWhy are prayer and worship essential for spiritual growth?\n\nPart B: Personal Reflection\nWrite a 300–500 word testimony or reflection describing:\n\nHow your understanding of the Christian faith has grown through this course.\nWhich lesson impacted you the most and why.\nHow you intend to apply these biblical principles in your daily life.\n\nSubmission Guidelines\n\nSubmit your work in PDF or Word format.\nUse Scripture references to support your answers where applicable.\nEnsure your responses are your own work.\nWrite clearly and concisely.	2026-06-09 20:00:00	100	\N	\N
cmqgkpcon0004m511pc44bolg	cmqgkpcoj0002m511kp3q8k3d	Nature and Authority Assignment	This assignment introduces the doctrine of Scripture by examining its nature, purpose, inspiration, and authority in the life of believers and the Church. Students will analyze key biblical texts and theological concepts related to how Scripture is understood as God's revealed Word and why it serves as the foundation for Christian faith and practice.	2026-06-16 12:00:00	100	\N	\N
cmqgn72lg001mm511v2arxkux	cmqgn72l7001km511geko620c	Formation and Canon of the Bible	Instructions\nAnswer all questions.\nWrite your answers in your own words.\nSupport your answers with relevant examples where necessary.\nTotal length: 1,000–1,500 words.\nPart A: Short Answer Questions (10 Marks)\nDefine the term Bible and explain what is meant by the canon of the Bible. (2 Marks)\nDescribe the three divisions of the Hebrew Scriptures. (2 Marks)\nState four criteria used by the early Church in recognizing books as canonical. (2 Marks)\nList the major sections of the New Testament and mention the number of books in each section. (2 Marks)\nName any two church councils that contributed to the recognition of the New Testament canon. (2 Marks)\nPart B: Essay Questions (10 Marks)\nQuestion 1 (5 Marks)\n\nDiscuss the process of the formation of the Old Testament and the New Testament. Explain how these writings were preserved and transmitted to later generations.\n\nQuestion 2 (5 Marks)\n\nExplain the meaning of the biblical canon and examine the factors that influenced the acceptance of books into the Christian canon. Highlight the differences between the Protestant, Roman Catholic, and Eastern Orthodox canons.	2026-06-17 20:00:00	50	\N	\N
\.


--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."AttendanceRecord" (id, "sessionId", "studentId", status, "markedAt", note) FROM stdin;
\.


--
-- Data for Name: AttendanceSession; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."AttendanceSession" (id, "courseId", "sectionId", title, description, "sessionDate", "sessionType", "createdAt") FROM stdin;
\.


--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."BlogPost" (id, title, slug, excerpt, content, "coverImage", "coverKey", "authorId", "isPublished", "readingTime", "createdAt", "updatedAt") FROM stdin;
cmq529sgk007hyw0a283volfj	Arulappan: A Pioneer of Indigenous Leadership Training in India	arulappan-pioneer-indigenous-leadership	John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India.	<p>John Christian Arulappan represents a powerful movement in early indigenous missions. His dedication to raises local leaders without relying on Western patterns paved the way for modern training ministries in rural India.</p>	\N	\N	cmq529se10001yw0a1tp3cyo8	t	6	2026-06-08 10:21:37.748	2026-06-08 10:21:37.748
cmq529sgk007jyw0ai6poq70c	"They Will Not Go, I Must" — The Legacy of Mary Chapman	legacy-of-mary-chapman	Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India.	<p>Mary Chapman arrived in India at an age when most people prepare to retire. Her courage to establish ministries and serve rural populations stands as a monuments of faith and leadership.</p>	\N	\N	cmq529se10001yw0a1tp3cyo8	t	7	2026-06-08 10:21:37.749	2026-06-08 10:21:37.749
cmq529sgl007lyw0acht7rnsk	Obedience to the Will of God — The Garrs	obedience-will-of-god-the-garrs	Alfred and Lillian Garr were model missionaries who obeyed God's will to bring the Pentecostal message to India in 1906.	<p>The story of the Garrs is one of absolute obedience. Leaving their comforts behind, they traveled to Calcutta and established early assemblies, demonstrating dynamic spiritual leadership.</p>	\N	\N	cmq529se10001yw0a1tp3cyo8	t	8	2026-06-08 10:21:37.749	2026-06-08 10:21:37.749
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Category" (id, name, slug, icon, "order", "parentId", "createdAt") FROM stdin;
cmq529se30003yw0a0dfm9rtw	Biblical Studies	biblical-studies	book-open	0	\N	2026-06-08 10:21:37.659
cmq529se30004yw0aqxatx2qr	Theology	theology	flame	0	\N	2026-06-08 10:21:37.66
cmq529se40005yw0a9zvoo6wk	Ministry & Leadership	ministry-leadership	users	0	\N	2026-06-08 10:21:37.66
cmq529se40006yw0azwek7h5c	Church History	church-history	building-church	0	\N	2026-06-08 10:21:37.661
cmq529se50007yw0aw98dblip	Spiritual Formation	spiritual-formation	heart	0	\N	2026-06-08 10:21:37.661
\.


--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Certificate" (id, "studentId", "courseId", "issuedAt", "uniqueCode", "downloadUrl", "templateId") FROM stdin;
cmq529sg4005tyw0a6ar22ajm	cmq529sfr004vyw0acq60bb9q	cmq529sel001cyw0axu7kt68m	2026-06-08 10:21:37.732	cmq529sg4005uyw0awoazaidi	\N	\N
cmqb6pjhg00064kf3ohnmbdp0	cmq5lvptl0001fr2a3a4rykpf	cmq6kbzmy00023966zjpl7hwu	2026-06-12 17:12:28.133	cmqb6pjhg00074kf3212ntedj	\N	\N
\.


--
-- Data for Name: CertificateTemplate; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."CertificateTemplate" (id, name, "htmlTemplate", "isDefault", "logoUrl", "signatorySignatureUrl", "borderStyle", "createdAt") FROM stdin;
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Coupon" (id, code, discount, type, "maxUses", "usedCount", "expiresAt", "courseId", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Course" (id, title, slug, subtitle, description, thumbnail, "promoVideoUrl", price, currency, status, level, language, "moduleNumber", "weeksDuration", "totalLectures", "totalDuration", "scriptureRef", "isFeatured", "isFree", requirements, outcomes, "targetAudience", "welcomeMessage", "congratsMessage", tags, "rejectionReason", "instructorId", "categoryId", "createdAt", "updatedAt", "invitationStatus", "programId") FROM stdin;
cmq529se60009yw0a6bboavqi	Spiritual Formation	spiritual-formation	Integrated study of the Christian life and personal character development by the Holy Spirit	This complete theological module guides leaders into deep insights regarding Spiritual Formation.	\N	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	1	6	3	5400	2 Corinthians 3:18	t	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se50007yw0aw98dblip	2026-06-08 10:21:37.662	2026-06-08 10:21:37.662	UNASSIGNED	\N
cmq529sef000uyw0asydfxrtt	Old Testament	old-testament	Overview of the content and theology of the Old Testament books, examining key themes and ministry relevance	This complete theological module guides leaders into deep insights regarding Old Testament.	\N	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	2	6	3	5400	2 Timothy 3:16	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se30003yw0a0dfm9rtw	2026-06-08 10:21:37.671	2026-06-08 10:21:37.671	UNASSIGNED	\N
cmq529sel001cyw0axu7kt68m	New Testament	new-testament	Overview within historical, literary, cultural, and theological contexts, tracing each book's Christological development	This complete theological module guides leaders into deep insights regarding New Testament.	\N	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	3	6	3	5400	John 1:1	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se30003yw0a0dfm9rtw	2026-06-08 10:21:37.677	2026-06-08 10:21:37.677	UNASSIGNED	\N
cmq529ser001uyw0akddrzifu	Interpreting the Bible	interpreting-the-bible	Equipping you with tools to study Scripture with insight, accuracy, and understanding	This complete theological module guides leaders into deep insights regarding Interpreting the Bible.	\N	\N	0	INR	PUBLISHED	INTERMEDIATE	ENGLISH	4	6	3	5400	2 Timothy 2:15	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se30003yw0a0dfm9rtw	2026-06-08 10:21:37.683	2026-06-08 10:21:37.683	UNASSIGNED	\N
cmq529sex002cyw0axh7kzf0g	Theology & Doctrines 1	theology-doctrines-1	God, Humanity, Christ, and Salvation — developing a Biblically grounded theology for life and ministry	This complete theological module guides leaders into deep insights regarding Theology & Doctrines 1.	\N	\N	0	INR	PUBLISHED	INTERMEDIATE	ENGLISH	5	6	3	5400	Hebrews 11:1	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se30004yw0aqxatx2qr	2026-06-08 10:21:37.689	2026-06-08 10:21:37.689	UNASSIGNED	\N
cmq529sf2002uyw0a22cn8eek	Theology & Doctrines 2	theology-doctrines-2	Church, Holy Spirit, and Mission — exploring major areas of Christian theology to defend and teach the faith	This complete theological module guides leaders into deep insights regarding Theology & Doctrines 2.	\N	\N	0	INR	PUBLISHED	INTERMEDIATE	ENGLISH	6	6	3	5400	Acts 1:8	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se30004yw0aqxatx2qr	2026-06-08 10:21:37.695	2026-06-08 10:21:37.695	UNASSIGNED	\N
cmq529sf8003cyw0am105p530	Five-Fold Ministry	five-fold-ministry	Training in church leadership, revealing functions of apostles, prophets, evangelists, pastors, and teachers	This complete theological module guides leaders into deep insights regarding Five-Fold Ministry.	\N	\N	0	INR	PUBLISHED	INTERMEDIATE	ENGLISH	7	6	3	5400	Ephesians 4:11-12	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se40005yw0a9zvoo6wk	2026-06-08 10:21:37.701	2026-06-08 10:21:37.701	UNASSIGNED	\N
cmq529sfe003uyw0aqbv63sdb	Our Roots: Church History	church-history	Development of Christianity from inception to present, including global expansion and India's heritage	This complete theological module guides leaders into deep insights regarding Our Roots: Church History.	\N	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	8	6	3	5400	Matthew 16:18	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se40006yw0azwek7h5c	2026-06-08 10:21:37.706	2026-06-08 10:21:37.706	UNASSIGNED	\N
cmq529sfk004cyw0arpojs1o0	Spiritual Leadership	spiritual-leadership	Practical understanding of leadership principles, blending natural and spiritual qualities to shape your calling	This complete theological module guides leaders into deep insights regarding Spiritual Leadership.	\N	\N	0	INR	PUBLISHED	ADVANCED	ENGLISH	9	6	3	5400	Mark 10:43-44	f	t	[]	[]	[]	\N	\N	[]	\N	cmq529se10001yw0a1tp3cyo8	cmq529se40005yw0a9zvoo6wk	2026-06-08 10:21:37.712	2026-06-08 10:21:37.712	UNASSIGNED	\N
cmqdmzhyv00029bd9do0u640t	Introduction to Biblical Studies	introduction-to-biblical-studies-1		This course provides a foundational overview of the Bible and equips students with essential skills for understanding, interpreting, and applying Scripture. Students will explore the structure, history, themes, and authority of the Old and New Testaments, as well as the principles of biblical inspiration and revelation. Emphasis is placed on developing sound study methods and cultivating a Christ-centered approach to reading God's Word. By the end of the course, students will gain a deeper appreciation for the unity of Scripture and its relevance for Christian life and ministry.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781617567549-cmqdmzhyv00029bd9do0u640t-1781617567549.png	\N	0	INR	DRAFT	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmq6k8y7e00003966gu1247p9	cmq529se30004yw0aqxatx2qr	2026-06-14 10:23:38.935	2026-06-16 13:46:09.869	ACCEPTED	cmqdmxali00009bd9nmskius7
cmq6kbzmy00023966zjpl7hwu	Foundations of Christian Faith	foundations-of-christian-faith-2		\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781602096407-cmq6kbzmy00023966zjpl7hwu-1781602096407.png	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmq6k8y7e00003966gu1247p9	cmq529se50007yw0aw98dblip	2026-06-09 11:34:59.626	2026-06-16 09:28:18.853	UNASSIGNED	\N
\.


--
-- Data for Name: CourseInvitation; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."CourseInvitation" (id, "courseId", "instructorId", "adminNote", status, "createdAt", "updatedAt") FROM stdin;
cmqdmzrlh00049bd9n0v8ugi6	cmqdmzhyv00029bd9do0u640t	cmq6k8y7e00003966gu1247p9	\N	ACCEPTED	2026-06-14 10:23:51.414	2026-06-14 10:28:53.948
\.


--
-- Data for Name: Curriculum; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Curriculum" (id, "courseId", overview, objectives, "weeklyPlan", "assessmentPlan", "updatedAt") FROM stdin;
cmq6kbzmy00043966zk13712n	cmq6kbzmy00023966zjpl7hwu	Foundations of Christian Faith is designed to provide believers with a solid understanding of the essential truths of Christianity. This course explores the authority of Scripture, the nature of God, salvation through Jesus Christ, the ministry of the Holy Spirit, prayer, worship, discipleship, and the mission of the Church. It aims to equip students to grow spiritually and live out their faith according to biblical principles.	["Understand the authority and importance of the Bible as God's inspired Word.","Explain the nature and attributes of God and His plan of redemption.","Describe the person and work of Jesus Christ and the message of salvation.","Recognize the ministry and empowering work of the Holy Spirit in the believer's life.","Develop a consistent life of prayer, worship, and spiritual disciplines."]	[]	\N	2026-06-09 11:36:41.173
cmqdp4hgu000puhubx90nvyv2	cmqdmzhyv00029bd9do0u640t	This course provides a foundational overview of the Bible and equips students with essential skills for understanding, interpreting, and applying Scripture. Students will explore the structure, history, themes, and authority of the Old and New Testaments, as well as the principles of biblical inspiration and revelation. Emphasis is placed on developing sound study methods and cultivating a Christ-centered approach to reading God's Word. By the end of the course, students will gain a deeper appreciation for the unity of Scripture and its relevance for Christian life and ministry.	["Explain the nature, inspiration, and authority of the Bible.","Describe the overall structure and major themes of the Old and New Testaments.","Understand the historical and cultural background of Scripture.","Apply basic principles of biblical interpretation.","Identify the different genres of biblical literature.","Demonstrate effective Bible study methods for personal growth and ministry.","Recognize the centrality of Jesus Christ in the message of the Bible."]	[]	\N	2026-06-14 11:23:30.798
\.


--
-- Data for Name: Discussion; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Discussion" (id, "courseId", "sectionId", "lessonId", "authorId", title, content, "isPinned", "isLocked", score, feedback, "createdAt") FROM stdin;
cmqb6pjgs00014kf3faixpeha	cmq6kbzmy00023966zjpl7hwu	cmq6kev3s000839666ss3xvs3	cmq6ktqh2001568q3k9beixeq	cmq5lvptl0001fr2a3a4rykpf	Discussion	Hello everyone,\n\nMy name is Joshua R. Tharakan. I was born and brought up in Bangalore, and I am currently studying in the 11th Grade.\n\nBy God's grace, I have grown up in a Christian family and have been learning about Jesus Christ from a young age. I have joined this course because I want to strengthen my foundation in the Christian faith, understand God's Word more deeply, and grow closer to Him.\n\nThrough this course, I hope to gain a better understanding of the basics of Christianity and learn how to live a life that glorifies God. I am excited to learn together with everyone and to grow spiritually.\n\nMay God bless each one of us as we study His Word. I pray that this course will help us become stronger in our faith and draw us closer to Jesus Christ. Amen.\n	f	f	10		2026-06-12 17:12:28.108
\.


--
-- Data for Name: DiscussionReply; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."DiscussionReply" (id, "discussionId", "authorId", content, "isInstructor", "createdAt") FROM stdin;
\.


--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."EmailTemplate" (id, name, subject, "htmlBody", variables, "createdAt", "updatedAt") FROM stdin;
cmq2987hd00001r46ctodgatb	WELCOME_EMAIL	Login Credentials	<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Login Credentials</title>\n</head>\n<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, sans-serif;">\n\n    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 0;">\n        <tr>\n            <td align="center">\n\n                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">\n\n                    <!-- Header -->\n                    <tr>\n                        <td align="center" style="background-color:#1e3a8a; padding:30px;">\n                            <h1 style="color:#ffffff; margin:0;">Welcome!</h1>\n                        </td>\n                    </tr>\n\n                    <!-- Content -->\n                    <tr>\n                        <td style="padding:40px; color:#333333; line-height:1.8; font-size:16px;">\n\n                            <p>Dear <strong>{{name}}</strong>,</p>\n\n                            <p>\n                                Welcome to our platform. Your account has been successfully created.\n                                Please find your login credentials below:\n                            </p>\n\n                            <table cellpadding="8" cellspacing="0" width="100%" style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px;">\n                                <tr>\n                                    <td width="30%"><strong>Email:</strong></td>\n                                    <td>{{email}}</td>\n                                </tr>\n                                <tr>\n                                    <td><strong>Password:</strong></td>\n                                    <td>{{password}}</td>\n                                </tr>\n                            </table>\n\n                            <p style="margin-top:30px;">\n                                For security purposes, we recommend changing your password after your first login.\n                            </p>\n\n                            <div style="text-align:center; margin:35px 0;">\n                                <a href="{{login_url}}" style="background-color:#1e3a8a; color:#ffffff; text-decoration:none; padding:14px 30px; border-radius:6px; display:inline-block;">\n                                    Login Now\n                                </a>\n                            </div>\n\n                            <p>\n                                If you have any questions or require assistance, please feel free to contact us.\n                            </p>\n\n                            <p>\n                                Regards,<br>\n                                <strong>CWAY Academy Team</strong>\n                            </p>\n\n                        </td>\n                    </tr>\n\n                    <!-- Footer -->\n                    <tr>\n                        <td align="center" style="background-color:#f8fafc; padding:20px; font-size:13px; color:#6b7280;">\n                            © 2026 CWAY Academy. All rights reserved.\n                        </td>\n                    </tr>\n\n                </table>\n\n            </td>\n        </tr>\n    </table>\n\n</body>\n</html>	[]	2026-06-06 11:13:02.689	2026-06-06 11:13:02.689
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Enrollment" (id, "studentId", "courseId", "enrolledAt", "completedAt", progress, status, "paymentId", "sponsorshipId") FROM stdin;
cmq529sfx0054yw0az480sj47	cmq529sfq004tyw0am8dqt9rt	cmq529se60009yw0a6bboavqi	2026-06-08 10:21:37.725	\N	66.66666666666666	ACTIVE	\N	\N
cmq529sg0005cyw0a9q11qahu	cmq529sfq004uyw0achm89p64	cmq529sef000uyw0asydfxrtt	2026-06-08 10:21:37.728	\N	100	ACTIVE	\N	\N
cmq529sg2005kyw0adfpt1itq	cmq529sfr004vyw0acq60bb9q	cmq529sel001cyw0axu7kt68m	2026-06-08 10:21:37.73	2026-06-08 10:21:37.73	100	COMPLETED	\N	\N
cmq529sg5005wyw0aswvo6943	cmq529sfs004wyw0alpfc5tuh	cmq529ser001uyw0akddrzifu	2026-06-08 10:21:37.733	\N	33.33333333333333	ACTIVE	\N	\N
cmq529sg70064yw0angklvr3c	cmq529sfs004xyw0alxlmc22k	cmq529sex002cyw0axh7kzf0g	2026-06-08 10:21:37.735	\N	66.66666666666666	ACTIVE	\N	\N
cmq529sg9006cyw0axqxrihbh	cmq529sft004yyw0aa0nk9jgq	cmq529sf2002uyw0a22cn8eek	2026-06-08 10:21:37.737	\N	66.66666666666666	ACTIVE	\N	\N
cmq529sgb006kyw0axlwkudhn	cmq529sfu004zyw0ap8jx1xvg	cmq529sf8003cyw0am105p530	2026-06-08 10:21:37.739	\N	0	ACTIVE	\N	\N
cmq529sgd006syw0apl756khg	cmq529sfu0050yw0arcbyea6n	cmq529sfe003uyw0aqbv63sdb	2026-06-08 10:21:37.741	\N	33.33333333333333	ACTIVE	\N	\N
cmq529sgf0070yw0adbnpaasa	cmq529sfv0051yw0at2u3xime	cmq529se60009yw0a6bboavqi	2026-06-08 10:21:37.743	\N	0	ACTIVE	\N	\N
cmq529sgh0078yw0an73180v1	cmq529sfw0052yw0a4ighduuq	cmq529se60009yw0a6bboavqi	2026-06-08 10:21:37.745	\N	0	ACTIVE	\N	\N
cmq6kun9s001768q3b9qotuny	cmq5lvptl0001fr2a3a4rykpf	cmq6kbzmy00023966zjpl7hwu	2026-06-09 11:49:30.064	2026-06-12 17:12:28.129	100	COMPLETED	\N	\N
\.


--
-- Data for Name: Extension; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Extension" (id, "studentId", "itemId", "itemType", "courseId", "extendedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ExtensionRequest; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ExtensionRequest" (id, "studentId", "itemId", "itemType", "courseId", reason, status, "requestedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Forum; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Forum" (id, "courseId") FROM stdin;
cmq529se9000jyw0awk3aohb3	cmq529se60009yw0a6bboavqi
cmq529sei0014yw0afs16gl20	cmq529sef000uyw0asydfxrtt
cmq529seo001myw0a1ofkwar9	cmq529sel001cyw0axu7kt68m
cmq529seu0024yw0an3gxk67f	cmq529ser001uyw0akddrzifu
cmq529sez002myw0apnzprhde	cmq529sex002cyw0axh7kzf0g
cmq529sf50034yw0as1qh2jwm	cmq529sf2002uyw0a22cn8eek
cmq529sfb003myw0adz95f7y4	cmq529sf8003cyw0am105p530
cmq529sfh0044yw0auhnd2mlb	cmq529sfe003uyw0aqbv63sdb
cmq529sfn004myw0a6zzhkznd	cmq529sfk004cyw0arpojs1o0
cmq6kbzmy00033966v700gqsq	cmq6kbzmy00023966zjpl7hwu
\.


--
-- Data for Name: ForumPost; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ForumPost" (id, "forumId", "authorId", title, content, "isPinned", "createdAt") FROM stdin;
\.


--
-- Data for Name: ForumReply; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ForumReply" (id, "postId", "authorId", content, "createdAt") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Lesson" (id, "sectionId", title, type, content, "videoUrl", duration, "order", "isFree", "isPreview", "bunnyVideoId", "forumMarks", "dueDate") FROM stdin;
cmq529se7000dyw0avih2jkkc	cmq529se7000byw0akp7m4rt8	Lesson 1: Foundations of Spiritual Formation	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Corinthians 3:18</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529se8000fyw0am4xlxfop	cmq529se7000byw0akp7m4rt8	Lesson 2: Foundations of Spiritual Formation	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Corinthians 3:18</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529se9000hyw0anmtd55cr	cmq529se7000byw0akp7m4rt8	Lesson 3: Foundations of Spiritual Formation	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Corinthians 3:18</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529seg000yyw0aodxmnxm1	cmq529seg000wyw0az781npe2	Lesson 1: Foundations of Old Testament	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Timothy 3:16</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529seh0010yw0al1m93cjf	cmq529seg000wyw0az781npe2	Lesson 2: Foundations of Old Testament	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Timothy 3:16</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529sei0012yw0aa7nix7qm	cmq529seg000wyw0az781npe2	Lesson 3: Foundations of Old Testament	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Timothy 3:16</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529sem001gyw0afcf3l7o8	cmq529sem001eyw0ac0v5gqxw	Lesson 1: Foundations of New Testament	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">John 1:1</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529sen001iyw0amtl11gd8	cmq529sem001eyw0ac0v5gqxw	Lesson 2: Foundations of New Testament	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">John 1:1</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529seo001kyw0astvpqd67	cmq529sem001eyw0ac0v5gqxw	Lesson 3: Foundations of New Testament	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">John 1:1</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529ses001yyw0ahp2wjro6	cmq529ses001wyw0apsn6rnzw	Lesson 1: Foundations of Interpreting the Bible	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Timothy 2:15</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529set0020yw0a84drouzk	cmq529ses001wyw0apsn6rnzw	Lesson 2: Foundations of Interpreting the Bible	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Timothy 2:15</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529set0022yw0af67lg39a	cmq529ses001wyw0apsn6rnzw	Lesson 3: Foundations of Interpreting the Bible	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">2 Timothy 2:15</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529sey002gyw0afy670q77	cmq529sex002eyw0a5lzzk6a4	Lesson 1: Foundations of Theology & Doctrines 1	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Hebrews 11:1</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529sey002iyw0agvf46hra	cmq529sex002eyw0a5lzzk6a4	Lesson 2: Foundations of Theology & Doctrines 1	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Hebrews 11:1</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529sez002kyw0ac9te08el	cmq529sex002eyw0a5lzzk6a4	Lesson 3: Foundations of Theology & Doctrines 1	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Hebrews 11:1</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529sf4002yyw0ad79gndvf	cmq529sf3002wyw0asq6rp12q	Lesson 1: Foundations of Theology & Doctrines 2	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Acts 1:8</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529sf40030yw0asyfcjdx7	cmq529sf3002wyw0asq6rp12q	Lesson 2: Foundations of Theology & Doctrines 2	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Acts 1:8</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529sf50032yw0aseokljzp	cmq529sf3002wyw0asq6rp12q	Lesson 3: Foundations of Theology & Doctrines 2	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Acts 1:8</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529sf9003gyw0awwmtp9dg	cmq529sf9003eyw0a4tta139w	Lesson 1: Foundations of Five-Fold Ministry	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Ephesians 4:11-12</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529sfa003iyw0apwyqhga4	cmq529sf9003eyw0a4tta139w	Lesson 2: Foundations of Five-Fold Ministry	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Ephesians 4:11-12</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529sfb003kyw0a6m5scixd	cmq529sf9003eyw0a4tta139w	Lesson 3: Foundations of Five-Fold Ministry	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Ephesians 4:11-12</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529sff003yyw0akrpeoze5	cmq529sff003wyw0aqzdcp4dn	Lesson 1: Foundations of Our Roots: Church History	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Matthew 16:18</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529sfg0040yw0ailsjb2fz	cmq529sff003wyw0aqzdcp4dn	Lesson 2: Foundations of Our Roots: Church History	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Matthew 16:18</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529sfg0042yw0aphf2zt99	cmq529sff003wyw0aqzdcp4dn	Lesson 3: Foundations of Our Roots: Church History	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Matthew 16:18</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq529sfl004gyw0agzei1fwn	cmq529sfl004eyw0ab15rap6u	Lesson 1: Foundations of Spiritual Leadership	TEXT	<p>Welcome to Lesson 1. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Mark 10:43-44</blockquote>	\N	1800	1	t	t	\N	\N	\N
cmq529sfm004iyw0ak01gq0nv	cmq529sfl004eyw0ab15rap6u	Lesson 2: Foundations of Spiritual Leadership	TEXT	<p>Welcome to Lesson 2. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Mark 10:43-44</blockquote>	\N	1800	2	t	f	\N	\N	\N
cmq529sfm004kyw0ajdwdctp2	cmq529sfl004eyw0ab15rap6u	Lesson 3: Foundations of Spiritual Leadership	TEXT	<p>Welcome to Lesson 3. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">Mark 10:43-44</blockquote>	\N	1800	3	t	f	\N	\N	\N
cmq6kfm6l000a3966bxagnrfd	cmq6kev3s000839666ss3xvs3	 Our Foundation in Christ	VIDEO	\N	https://youtu.be/oDSgD58Lr2U?si=HrmVe_RNWGYtzCTn	0	0	f	f	\N	\N	\N
cmq6kmtk0000268q3usw88xhn	cmq6kev3s000839666ss3xvs3	Foundation in Christ Assignment	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmq6kn78x000768q3sfkg7u4x	cmq6kev3s000839666ss3xvs3	Foundations of Christian Faith – Module 1 Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
cmq6ktqh2001568q3k9beixeq	cmq6kev3s000839666ss3xvs3	How Has Your Faith Journey Begun?	FORUM	Introduce yourself to the class and share how you came to know Christ or what inspired you to study the foundations of the Christian faith. What are your expectations for this course? Feel free to encourage and pray for one another.	\N	0	3	f	f	\N	10	\N
cmqgkb76300037blezryq4xhl	cmqdphss400017np2xb8ukk5h	 Scripture & Authority: Foundations – An Overview of Systematic Theology 	VIDEO	\N	https://youtu.be/iROEzzQCfVc?si=7ACj8zoIdtz5SjbX	0	0	f	f	\N	\N	\N
cmqgkpcoj0002m511kp3q8k3d	cmqdphss400017np2xb8ukk5h	Nature and Authority Assignment	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmqgle3gh0007m511qau6dz9f	cmqdphss400017np2xb8ukk5h	Week 1: Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
cmqgm5gru0019m511pdgvs4ei	cmqdphss400017np2xb8ukk5h	Week 1 – The Nature and Authority of Scripture	FORUM	This week's discussion focuses on the nature of Scripture and its authority in the Christian faith. Christians believe that the Bible is God's inspired Word and serves as the foundation for doctrine, morality, and spiritual growth. Through this forum, students will explore the meaning of divine inspiration, the authority of Scripture, and the practical implications of biblical teaching.\n\nInitial Discussion Prompt\n\nAfter reading the assigned materials and reflecting on passages such as 2 Timothy 3:16–17, Hebrews 4:12, and 2 Peter 1:20–21, respond to the following questions:\n\nWhat does it mean to say that Scripture is inspired by God?\nWhy do Christians regard the Bible as authoritative?\nHow do the biblical passages studied support the doctrine of Scripture?\nIn what ways does the authority of Scripture influence a believer's daily life and decision-making?\n\nYour initial post should be 200–300 words and should include references to Scripture and course readings where appropriate.\n\nResponse to Classmates\n\nAfter posting your response, reply to at least two classmates. In your responses:\n\nAcknowledge points of agreement or respectfully present differing perspectives.\nSupport your comments with Scripture or theological principles.\nAsk thoughtful questions that encourage further discussion.	\N	0	3	f	f	\N	50	\N
cmqgm7pyj001bm5118q45uujs	cmqdpt6hf00037np23mtd3d1l	 How and when was the canon of the Bible put together?	VIDEO	\N	https://youtu.be/DDJI_f8bTUM?si=-FxekkMG-sOKLMPN	0	0	f	f	\N	\N	\N
cmqgm8ikp001dm5112fxemyc9	cmqdpt6hf00037np23mtd3d1l	How the Biblical Canon Was Formed	VIDEO	\N	https://youtu.be/nFEBwfYZBJY?si=I2XzLqkhC7dzScwQ	0	1	f	f	\N	\N	\N
cmqgn72l7001km511geko620c	cmqdpt6hf00037np23mtd3d1l	Formation and Canon of the Bible	ASSIGNMENT	\N	\N	0	2	f	f	\N	\N	\N
cmqgn88gm001pm511l7izzmf0	cmqdpt6hf00037np23mtd3d1l	Formation and Canon of the Bible	QUIZ		\N	0	3	f	f	\N	\N	\N
cmqgnz4di0001xk47y75mfj2h	cmqdpt6hf00037np23mtd3d1l	Formation and Canon of the Bible	FORUM	This week's discussion focuses on the nature of Scripture and its authority in the Christian faith. Christians believe that the Bible is God's inspired Word and serves as the foundation for doctrine, morality, and spiritual growth. Through this forum, students will explore the meaning of divine inspiration, the authority of Scripture, and the practical implications of biblical teaching.\n\nInitial Discussion Prompt\n\nAfter reading the assigned materials and reflecting on passages such as 2 Timothy 3:16–17, Hebrews 4:12, and 2 Peter 1:20–21, respond to the following questions:\n\nWhat does it mean to say that Scripture is inspired by God?\nWhy do Christians regard the Bible as authoritative?\nHow do the biblical passages studied support the doctrine of Scripture?\nIn what ways does the authority of Scripture influence a believer's daily life and decision-making?\n\nYour initial post should be 200–300 words and should include references to Scripture and course readings where appropriate.\n\nResponse to Classmates\n\nAfter posting your response, reply to at least two classmates. In your responses:\n\nAcknowledge points of agreement or respectfully present differing perspectives.\nSupport your comments with Scripture or theological principles.\nAsk thoughtful questions that encourage further discussion.	\N	0	4	f	f	\N	50	\N
\.


--
-- Data for Name: LessonProgress; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."LessonProgress" (id, "enrollmentId", "lessonId", "completedAt", "watchedSeconds") FROM stdin;
cmq529sfy0056yw0a61datj7n	cmq529sfx0054yw0az480sj47	cmq529se7000dyw0avih2jkkc	2026-06-08 10:21:37.726	1800
cmq529sfz0058yw0aypezaqof	cmq529sfx0054yw0az480sj47	cmq529se8000fyw0am4xlxfop	2026-06-08 10:21:37.727	1800
cmq529sfz005ayw0a86cx1rul	cmq529sfx0054yw0az480sj47	cmq529se9000hyw0anmtd55cr	\N	10
cmq529sg1005eyw0anm3trndg	cmq529sg0005cyw0a9q11qahu	cmq529seg000yyw0aodxmnxm1	2026-06-08 10:21:37.729	1800
cmq529sg1005gyw0asv3byvr5	cmq529sg0005cyw0a9q11qahu	cmq529seh0010yw0al1m93cjf	2026-06-08 10:21:37.729	1800
cmq529sg2005iyw0ae3r35k79	cmq529sg0005cyw0a9q11qahu	cmq529sei0012yw0aa7nix7qm	2026-06-08 10:21:37.73	1800
cmq529sg3005myw0avd0va04y	cmq529sg2005kyw0adfpt1itq	cmq529sem001gyw0afcf3l7o8	2026-06-08 10:21:37.731	1800
cmq529sg3005oyw0a33cku9fe	cmq529sg2005kyw0adfpt1itq	cmq529sen001iyw0amtl11gd8	2026-06-08 10:21:37.731	1800
cmq529sg4005qyw0awyaujp04	cmq529sg2005kyw0adfpt1itq	cmq529seo001kyw0astvpqd67	2026-06-08 10:21:37.732	1800
cmq529sg5005yyw0a0dya3ljv	cmq529sg5005wyw0aswvo6943	cmq529ses001yyw0ahp2wjro6	2026-06-08 10:21:37.733	1800
cmq529sg60060yw0a5e7hat3z	cmq529sg5005wyw0aswvo6943	cmq529set0020yw0a84drouzk	\N	10
cmq529sg60062yw0a6hpbrefu	cmq529sg5005wyw0aswvo6943	cmq529set0022yw0af67lg39a	\N	10
cmq529sg80066yw0ae891uctb	cmq529sg70064yw0angklvr3c	cmq529sey002gyw0afy670q77	2026-06-08 10:21:37.735	1800
cmq529sg80068yw0as28f7izz	cmq529sg70064yw0angklvr3c	cmq529sey002iyw0agvf46hra	2026-06-08 10:21:37.736	1800
cmq529sg9006ayw0au1gd1p1a	cmq529sg70064yw0angklvr3c	cmq529sez002kyw0ac9te08el	\N	10
cmq529sga006eyw0aaqvz5kem	cmq529sg9006cyw0axqxrihbh	cmq529sf4002yyw0ad79gndvf	2026-06-08 10:21:37.738	1800
cmq529sga006gyw0akdmjea2f	cmq529sg9006cyw0axqxrihbh	cmq529sf40030yw0asyfcjdx7	2026-06-08 10:21:37.738	1800
cmq529sga006iyw0agf90txay	cmq529sg9006cyw0axqxrihbh	cmq529sf50032yw0aseokljzp	\N	10
cmq529sgc006myw0ainrbtk82	cmq529sgb006kyw0axlwkudhn	cmq529sf9003gyw0awwmtp9dg	\N	10
cmq529sgc006oyw0at7mlbcqb	cmq529sgb006kyw0axlwkudhn	cmq529sfa003iyw0apwyqhga4	\N	10
cmq529sgd006qyw0agtqih1ew	cmq529sgb006kyw0axlwkudhn	cmq529sfb003kyw0a6m5scixd	\N	10
cmq529sge006uyw0a0vixvcbl	cmq529sgd006syw0apl756khg	cmq529sff003yyw0akrpeoze5	2026-06-08 10:21:37.742	1800
cmq529sge006wyw0aw0jtvlbi	cmq529sgd006syw0apl756khg	cmq529sfg0040yw0ailsjb2fz	\N	10
cmq529sgf006yyw0az8js6omq	cmq529sgd006syw0apl756khg	cmq529sfg0042yw0aphf2zt99	\N	10
cmq529sgg0072yw0adtlxa93d	cmq529sgf0070yw0adbnpaasa	cmq529se7000dyw0avih2jkkc	\N	10
cmq529sgg0074yw0at9ueme4j	cmq529sgf0070yw0adbnpaasa	cmq529se8000fyw0am4xlxfop	\N	10
cmq529sgh0076yw0aik9xhvud	cmq529sgf0070yw0adbnpaasa	cmq529se9000hyw0anmtd55cr	\N	10
cmq529sgi007ayw0a8jslfd8c	cmq529sgh0078yw0an73180v1	cmq529se7000dyw0avih2jkkc	\N	10
cmq529sgi007cyw0a823ov0ki	cmq529sgh0078yw0an73180v1	cmq529se8000fyw0am4xlxfop	\N	10
cmq529sgj007eyw0ak2ldaagn	cmq529sgh0078yw0an73180v1	cmq529se9000hyw0anmtd55cr	\N	10
cmq7qsuh400013trfznjmyz33	cmq6kun9s001768q3b9qotuny	cmq6kfm6l000a3966bxagnrfd	2026-06-10 07:23:49.954	0
cmq9k6vjy000dosesbi0aa06e	cmq6kun9s001768q3b9qotuny	cmq6kn78x000768q3sfkg7u4x	2026-06-11 13:54:19.581	0
cmqaq5a8p0005udfnsgabge3d	cmq6kun9s001768q3b9qotuny	cmq6kmtk0000268q3usw88xhn	2026-06-12 09:49:58.037	0
cmqb6pjh500034kf38ksryj72	cmq6kun9s001768q3b9qotuny	cmq6ktqh2001568q3k9beixeq	2026-06-12 17:12:28.12	0
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Message" (id, "senderId", "receiverId", content, "sentAt", "readAt") FROM stdin;
\.


--
-- Data for Name: Note; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Note" (id, "studentId", "lessonId", content, "timestamp", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Notification" (id, "userId", type, title, body, link, "isRead", "createdAt") FROM stdin;
cmq9j28us0007oseswe0i6423	cmq5lvptl0001fr2a3a4rykpf	QUIZ_PASSED	You passed 'Foundations of Christian Faith – Module 1 Quiz'!	You scored 100.0%.	#	f	2026-06-11 13:22:43.925
cmq9jb3rm000bosesgwama2ww	cmq5lvptl0001fr2a3a4rykpf	QUIZ_PASSED	You passed 'Foundations of Christian Faith – Module 1 Quiz'!	You scored 100.0%.	#	f	2026-06-11 13:29:37.234
cmqaq5a8b0003udfnzd6ud8se	cmq6k8y7e00003966gu1247p9	NEW_SUBMISSION	New assignment submission	A student submitted 'Foundation in Christ Assignment'	/instructor/courses/cmq6kbzmy00023966zjpl7hwu/assignments	f	2026-06-12 09:28:49.164
cmqaqwhae00036kp5cvavw4nt	cmq6k8y7e00003966gu1247p9	NEW_SUBMISSION	New assignment submission	A student submitted 'Foundation in Christ Assignment'	/instructor/courses/cmq6kbzmy00023966zjpl7hwu/assignments	f	2026-06-12 09:49:58.023
cmqaqytk400076kp5ardep5ti	cmq5lvptl0001fr2a3a4rykpf	ASSIGNMENT_GRADED	Your assignment has been graded	You scored 98/100 on 'Foundation in Christ Assignment'	/student/assignments/cmq6kmtk3000468q3yh1guczo	f	2026-06-12 09:51:47.236
cmqard7zm00096kp580qbw7wb	cmq5lvptl0001fr2a3a4rykpf	ASSIGNMENT_GRADED	Your assignment has been graded	You scored 99/100 on 'Foundation in Christ Assignment'	/student/assignments/cmq6kmtk3000468q3yh1guczo	f	2026-06-12 10:02:59.123
cmqb6pjhj00084kf3slv2wawj	cmq5lvptl0001fr2a3a4rykpf	COURSE_COMPLETED	🎉 You completed 'Foundations of Christian Faith'!	Your certificate is ready to download.	/student/certificates	f	2026-06-12 17:12:28.136
cmqb6pjhj00094kf3ooo72wpr	cmq6k8y7e00003966gu1247p9	STUDENT_COMPLETED	Joshua R Tharakan completed your course	'Foundations of Christian Faith' — congratulations to them!	/instructor/courses/cmq6kbzmy00023966zjpl7hwu/students	f	2026-06-12 17:12:28.136
cmqdmzrlq00069bd91j1trdzm	cmq6k8y7e00003966gu1247p9	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Introduction to Biblical Studies"	/instructor/courses	f	2026-06-14 10:23:51.423
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Payment" (id, "studentId", "courseId", amount, currency, "stripePaymentId", status, "isSponsored", "createdAt") FROM stdin;
\.


--
-- Data for Name: PayoutRequest; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."PayoutRequest" (id, "instructorId", amount, currency, status, "bankDetails", note, "adminNote", "requestedAt", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Program" (id, title, description, thumbnail, "thumbnailKey", duration, tags, status, "createdAt", "updatedAt") FROM stdin;
cmqdmxali00009bd9nmskius7	Master of Divinity (M.Div.)	The Master of Divinity (M.Div.) program is a comprehensive theological and ministerial training course designed to equip students with a strong foundation in Biblical studies, Christian doctrine, spiritual formation, pastoral ministry, preaching, missions, and leadership. Through structured coursework and practical ministry experience, students will be prepared to serve effectively in churches, missions, and Christian organizations while growing in their relationship with Christ and commitment to His Kingdom.	\N	\N	3 Years	[]	DRAFT	2026-06-14 10:21:56.071	2026-06-14 10:21:56.071
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Question" (id, "quizId", text, type, points, "order", "scriptureRef") FROM stdin;
cmq6ko7a6000b68q3p2ke5vhp	cmq6kn790000968q39rav5p6z	According to 2 Timothy 3:16, all Scripture is:	MCQ	1	0	\N
cmq6kp8ng000h68q3uq1s5qu4	cmq6kn790000968q39rav5p6z	Salvation is received through:	MCQ	1	1	\N
cmq6kq89x000n68q3o57f3you	cmq6kn790000968q39rav5p6z	Who raised Jesus from the dead?	MCQ	1	2	\N
cmq6ks1is000t68q37daiexcs	cmq6kn790000968q39rav5p6z	Which Person of the Trinity indwells believers?	MCQ	1	3	\N
cmq6kt8ea000z68q3gni8vvef	cmq6kn790000968q39rav5p6z	What is the primary purpose of prayer?	MCQ	1	4	\N
cmqglg27n000bm5119ulmu62d	cmqgle3gn0009m511kz5x0m7p	What does the term "Scripture" refer to?	MCQ	1	0	\N
cmqgli9jp000hm511z7om8g95	cmqgle3gn0009m511kz5x0m7p	According to 2 Timothy 3:16, all Scripture is:	MCQ	1	1	\N
cmqglkgpz000rm511s9b1leba	cmqgle3gn0009m511kz5x0m7p	Which doctrine teaches that the Bible is free from error in its original manuscripts?	MCQ	1	2	\N
cmqgllqwc000xm511j030ocyw	cmqgle3gn0009m511kz5x0m7p	Why is Scripture considered authoritative for Christians?	MCQ	1	3	\N
cmqglnn1l0013m511xpjjjmf3	cmqgle3gn0009m511kz5x0m7p	Which passage states that men spoke from God as they were carried along by the Holy Spirit?	MCQ	1	4	\N
cmqgna7co001tm511pzah5cf3	cmqgn88gq001rm511apoxbo67	What does the term canon mean?	MCQ	1	0	\N
cmqgnb91s001zm5115lohzzd2	cmqgn88gq001rm511apoxbo67	The Old Testament was written over a period of approximately:	MCQ	1	1	\N
cmqgnc8210025m511xgqd5zzg	cmqgn88gq001rm511apoxbo67	Which of the following is the first section of the Hebrew Scriptures?	MCQ	1	2	\N
cmqgnd3q5002bm511pepvokso	cmqgn88gq001rm511apoxbo67	How many books are in the New Testament?	MCQ	1	3	\N
cmqgne9lj002hm511xt0z4dk3	cmqgn88gq001rm511apoxbo67	Which book records the activities of the early Church?	MCQ	1	4	\N
\.


--
-- Data for Name: Quiz; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Quiz" (id, "lessonId", title, "passingScore", "timeLimit", "maxAttempts", "rubricId") FROM stdin;
cmq6kn790000968q39rav5p6z	cmq6kn78x000768q3sfkg7u4x	Foundations of Christian Faith – Module 1 Quiz	70	\N	3	\N
cmqgle3gn0009m511kz5x0m7p	cmqgle3gh0007m511qau6dz9f	Week 1: Quiz	70	300	2	\N
cmqgn88gq001rm511apoxbo67	cmqgn88gm001pm511l7izzmf0	Formation and Canon of the Bible	70	120	1	\N
\.


--
-- Data for Name: QuizAttempt; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."QuizAttempt" (id, "quizId", "studentId", score, passed, answers, "startedAt", "completedAt") FROM stdin;
cmq9gkhsx0001osesu9xk39o0	cmq6kn790000968q39rav5p6z	cmq5lvptl0001fr2a3a4rykpf	0	f	{}	2026-06-11 12:12:56.481	\N
cmq9j0xti0005osesom6oi8ux	cmq6kn790000968q39rav5p6z	cmq5lvptl0001fr2a3a4rykpf	100	t	{"cmq6ko7a6000b68q3p2ke5vhp":"cmq6ko7a6000d68q38rvwhpuc","cmq6kp8ng000h68q3uq1s5qu4":"cmq6kp8ng000k68q3je7utcy8","cmq6kq89x000n68q3o57f3you":"cmq6kq89x000q68q3fmdlu03b","cmq6ks1is000t68q37daiexcs":"cmq6ks1is000w68q34gnxi7ju","cmq6kt8ea000z68q3gni8vvef":"cmq6kt8ea001168q3qq2ce618"}	2026-06-11 13:21:42.966	2026-06-11 13:22:43.921
cmq9jaob10009osesrv12y6w7	cmq6kn790000968q39rav5p6z	cmq5lvptl0001fr2a3a4rykpf	100	t	{"cmq6ko7a6000b68q3p2ke5vhp":"cmq6ko7a6000d68q38rvwhpuc","cmq6kp8ng000h68q3uq1s5qu4":"cmq6kp8ng000k68q3je7utcy8","cmq6kq89x000n68q3o57f3you":"cmq6kq89x000q68q3fmdlu03b","cmq6ks1is000t68q37daiexcs":"cmq6ks1is000w68q34gnxi7ju","cmq6kt8ea000z68q3gni8vvef":"cmq6kt8ea001168q3qq2ce618"}	2026-06-11 13:29:17.197	2026-06-11 13:29:37.23
\.


--
-- Data for Name: ReadingMaterial; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ReadingMaterial" (id, "sectionId", title, description, "fileUrl", "fileKey", "fileType", "fileSize", "order", "createdAt") FROM stdin;
cmq6kgzh5000c3966brv9x6ip	cmq6kev3s000839666ss3xvs3	M1 - Material	\N	http://localhost:4000/uploads/reading-materials/cmq6kev3s000839666ss3xvs3/1781005132695-blog.pdf	reading-materials/cmq6kev3s000839666ss3xvs3/1781005132695-blog.pdf	pdf	57896	0	2026-06-09 11:38:52.698
cmqgjqy6l00017blexvx9cxet	cmqdphss400017np2xb8ukk5h	Nature And Authority of Scripture		https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqdphss400017np2xb8ukk5h/1781608577588-Intro-to-Modern-AI-Update-Jun-13.pdf	reading-materials/cmqdphss400017np2xb8ukk5h/1781608577588-Intro-to-Modern-AI-Update-Jun-13.pdf	pdf	1216993	0	2026-06-16 11:16:19.725
cmqgn1e5i001fm5119ndwhm2i	cmqdpt6hf00037np23mtd3d1l	Formation and Canon of the Bible	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqdpt6hf00037np23mtd3d1l/1781614104109-CWAY_Academy_LMS_Deployment_Strategy_Report-2.docx	reading-materials/cmqdpt6hf00037np23mtd3d1l/1781614104109-CWAY_Academy_LMS_Deployment_Strategy_Report-2.docx	docx	159462	0	2026-06-16 12:48:25.83
cmqgn1qp5001hm511mln3kkal	cmqdpt6hf00037np23mtd3d1l	Canon of the Bible	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqdpt6hf00037np23mtd3d1l/1781614121103-CWAY_Academy_LMS_Deployment_Strategy_Report-2.pdf	reading-materials/cmqdpt6hf00037np23mtd3d1l/1781614121103-CWAY_Academy_LMS_Deployment_Strategy_Report-2.pdf	pdf	61472	1	2026-06-16 12:48:42.089
\.


--
-- Data for Name: ReadingMaterialProgress; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ReadingMaterialProgress" (id, "enrollmentId", "readingMaterialId", "completedAt") FROM stdin;
cmq94tlzw0001z9ibweb3szt6	cmq6kun9s001768q3b9qotuny	cmq6kgzh5000c3966brv9x6ip	2026-06-16 08:08:06.803
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Review" (id, "courseId", "studentId", rating, comment, "isApproved", "createdAt") FROM stdin;
cmq529seb000myw0az4x28y4t	cmq529se60009yw0a6bboavqi	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.668
cmq529sec000pyw0a0u9yel6x	cmq529se60009yw0a6bboavqi	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.669
cmq529see000syw0akoig205j	cmq529se60009yw0a6bboavqi	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.671
cmq529sej0016yw0auzsrwx9c	cmq529sef000uyw0asydfxrtt	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.675
cmq529sek0018yw0a2ypn9817	cmq529sef000uyw0asydfxrtt	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.676
cmq529sek001ayw0a0t3amq7r	cmq529sef000uyw0asydfxrtt	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.677
cmq529sep001oyw0a0q88angn	cmq529sel001cyw0axu7kt68m	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.681
cmq529seq001qyw0a8i6sev1a	cmq529sel001cyw0axu7kt68m	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.682
cmq529seq001syw0a6fqmn2vd	cmq529sel001cyw0axu7kt68m	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.683
cmq529sev0026yw0ai2sp9zku	cmq529ser001uyw0akddrzifu	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.687
cmq529sev0028yw0a3xllkxcf	cmq529ser001uyw0akddrzifu	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.688
cmq529sew002ayw0ak74rh1em	cmq529ser001uyw0akddrzifu	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.689
cmq529sf0002oyw0a5lw0hpt8	cmq529sex002cyw0axh7kzf0g	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.693
cmq529sf1002qyw0a6933r9mr	cmq529sex002cyw0axh7kzf0g	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.693
cmq529sf2002syw0ay8is5h6d	cmq529sex002cyw0axh7kzf0g	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.694
cmq529sf60036yw0ajmvwahn6	cmq529sf2002uyw0a22cn8eek	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.699
cmq529sf70038yw0acihcvnus	cmq529sf2002uyw0a22cn8eek	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.699
cmq529sf8003ayw0abhg4pyrk	cmq529sf2002uyw0a22cn8eek	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.7
cmq529sfc003oyw0akgpuwg8y	cmq529sf8003cyw0am105p530	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.704
cmq529sfd003qyw0asmw7vn7i	cmq529sf8003cyw0am105p530	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.705
cmq529sfd003syw0a3b1uv1uf	cmq529sf8003cyw0am105p530	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.706
cmq529sfi0046yw0a3qnjaqrr	cmq529sfe003uyw0aqbv63sdb	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.71
cmq529sfi0048yw0a6jauqhyr	cmq529sfe003uyw0aqbv63sdb	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.711
cmq529sfj004ayw0awepr0aif	cmq529sfe003uyw0aqbv63sdb	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.712
cmq529sfo004oyw0a3prunf5u	cmq529sfk004cyw0arpojs1o0	cmq529sea000kyw0auqc281ez	5	Life-changing material! Extremely clear and scripturally focused.	t	2026-06-08 10:21:37.716
cmq529sfo004qyw0atfa4q68f	cmq529sfk004cyw0arpojs1o0	cmq529sec000nyw0avh6jy52e	4	Theological training at its finest. Highly recommended for leaders.	t	2026-06-08 10:21:37.717
cmq529sfp004syw0agnodeysg	cmq529sfk004cyw0arpojs1o0	cmq529see000qyw0aips4rit1	5	A rich resource for frontline ministry work. Challenging yet accessible.	t	2026-06-08 10:21:37.718
\.


--
-- Data for Name: Rubric; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Rubric" (id, "courseId", title, description, "totalPoints", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RubricCriteria; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."RubricCriteria" (id, "rubricId", title, description, "maxPoints", "order") FROM stdin;
\.


--
-- Data for Name: RubricLevel; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."RubricLevel" (id, "criteriaId", label, description, points, "order") FROM stdin;
\.


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Section" (id, "courseId", title, description, objectives, "weekNumber", "isPublished", "order") FROM stdin;
cmqdphss400017np2xb8ukk5h	cmqdmzhyv00029bd9do0u640t	Week 1: The Nature and Authority of Scripture	This week introduces the Bible as God's inspired and authoritative Word. Students will examine the doctrines of revelation, inspiration, inerrancy, and the purpose of Scripture, gaining an understanding of why the Bible is foundational for faith and practice.	[]	\N	f	0
cmqdpt6hf00037np23mtd3d1l	cmqdmzhyv00029bd9do0u640t	Week 2: Formation and Canon of the Bible	Students will explore how the books of the Old and New Testaments were written, preserved, and recognized as Scripture. Special attention will be given to the process of canonization and the historical transmission of the biblical text.	[]	\N	f	1
cmq529se7000byw0akp7m4rt8	cmq529se60009yw0a6bboavqi	Course Content	\N	[]	\N	f	1
cmq529seg000wyw0az781npe2	cmq529sef000uyw0asydfxrtt	Course Content	\N	[]	\N	f	1
cmq529sem001eyw0ac0v5gqxw	cmq529sel001cyw0axu7kt68m	Course Content	\N	[]	\N	f	1
cmq529ses001wyw0apsn6rnzw	cmq529ser001uyw0akddrzifu	Course Content	\N	[]	\N	f	1
cmq529sex002eyw0a5lzzk6a4	cmq529sex002cyw0axh7kzf0g	Course Content	\N	[]	\N	f	1
cmq529sf3002wyw0asq6rp12q	cmq529sf2002uyw0a22cn8eek	Course Content	\N	[]	\N	f	1
cmq529sf9003eyw0a4tta139w	cmq529sf8003cyw0am105p530	Course Content	\N	[]	\N	f	1
cmq529sff003wyw0aqzdcp4dn	cmq529sfe003uyw0aqbv63sdb	Course Content	\N	[]	\N	f	1
cmq529sfl004eyw0ab15rap6u	cmq529sfk004cyw0arpojs1o0	Course Content	\N	[]	\N	f	1
cmq6kev3s000839666ss3xvs3	cmq6kbzmy00023966zjpl7hwu	Introduction to the Bible	Learn about the inspiration, authority, and purpose of God's Word and why it is foundational for every believer.	[]	\N	f	0
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."SiteSettings" (id, "siteName", "logoUrl", tagline, "contactEmail", "contactWhatsApp", "primaryColor", "smtpConfig", "stripeConfig", "storageConfig", "updatedAt") FROM stdin;
cmq529sgj007fyw0aat94iuk2	CWAY Academy	\N	Coach. Challenge. Commission.	support@cwayacademy.com	+919663831220	#C9973A	\N	\N	\N	2026-06-08 10:21:37.748
\.


--
-- Data for Name: Sponsorship; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Sponsorship" (id, "sponsorName", "sponsorEmail", amount, currency, "stripePaymentId", status, message, "studentId", "courseId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Submission" (id, "assignmentId", "studentId", content, "fileUrl", "submittedAt", grade, feedback, "gradedAt", "isGraded") FROM stdin;
cmqaqwhaa00016kp5pt6571yl	cmq6kmtk3000468q3yh1guczo	cmq5lvptl0001fr2a3a4rykpf		/uploads/1781257798010-728309141-Karunya-University-URK23AI1047.pdf	2026-06-12 09:49:58.019	99		2026-06-12 10:02:59.119	t
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."User" (id, name, email, "passwordHash", role, avatar, bio, phone, church, location, "preferredLanguage", "isVerified", "isBanned", "payoutPercentage", "emailVerifyToken", "resetToken", "resetTokenExpiry", "googleId", "createdAt", "updatedAt", "socialLinks", title, credentials, "yearsExperience", expertise, "notificationPrefs") FROM stdin;
cmq529sdz0000yw0aab5xygv1	CWAY Admin	admin@cwayacademy.com	$2b$12$hwWv17.1EID.jzcqThMjxOsooyUQaWkBlARJ5PWqd8xx/snsqQLC6	ADMIN	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.655	2026-06-08 10:21:37.655	\N	\N	\N	\N	[]	{}
cmq529se10001yw0a1tp3cyo8	Dr. Reeju Tharakan	dr.reeju@cwayacademy.com	$2b$12$.kypmHyFd8UmiQPQMdu28OLxJGu0zcNd1PbPblXXRxkC1LtRYTzWq	INSTRUCTOR	\N	With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education. Lead Pastor of Immanuel AG Church in Dubai and President-Trustee of CWAY Missions.	\N	Immanuel AG Church, Dubai	Dubai, UAE	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.657	2026-06-08 10:21:37.657	\N	\N	\N	\N	[]	{}
cmq529se20002yw0ao5lyibq4	Pr. Robin Ninan	pr.robin@cwayacademy.com	$2b$12$.kypmHyFd8UmiQPQMdu28OLxJGu0zcNd1PbPblXXRxkC1LtRYTzWq	INSTRUCTOR	\N	Holding a Master of Divinity and extensive experience in leadership, management, and media. Secretary-Trustee of CWAY Missions Religious Trust, Bangalore.	\N	CWAY Missions	Bangalore, India	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.659	2026-06-08 10:21:37.659	\N	\N	\N	\N	[]	{}
cmq529sea000kyw0auqc281ez	Reviewer 1	reviewer1@cway.dev	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.667	2026-06-08 10:21:37.667	\N	\N	\N	\N	[]	{}
cmq529sec000nyw0avh6jy52e	Reviewer 2	reviewer2@cway.dev	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.668	2026-06-08 10:21:37.668	\N	\N	\N	\N	[]	{}
cmq529see000qyw0aips4rit1	Reviewer 3	reviewer3@cway.dev	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.67	2026-06-08 10:21:37.67	\N	\N	\N	\N	[]	{}
cmq529sfq004tyw0am8dqt9rt	Rahul Sharma	student1@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Grace Bible Church	Kerala	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.718	2026-06-08 10:21:37.718	\N	\N	\N	\N	[]	{}
cmq529sfq004uyw0achm89p64	Priya Nair	student2@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Bethel Fellowship	Tamil Nadu	TAMIL	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.719	2026-06-08 10:21:37.719	\N	\N	\N	\N	[]	{}
cmq529sfr004vyw0acq60bb9q	Samuel David	student3@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Emmanuel Assembly	Karnataka	TELUGU	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.72	2026-06-08 10:21:37.72	\N	\N	\N	\N	[]	{}
cmq529sfs004wyw0alpfc5tuh	Mary Thomas	student4@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Zion Chapel	Andhra Pradesh	MALAYALAM	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.72	2026-06-08 10:21:37.72	\N	\N	\N	\N	[]	{}
cmq529sfs004xyw0alxlmc22k	Amit Patel	student5@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Calvary Tabernacle	Maharashtra	KANNADA	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.721	2026-06-08 10:21:37.721	\N	\N	\N	\N	[]	{}
cmq529sft004yyw0aa0nk9jgq	Shalini Kumari	student6@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Hebron Assembly	Jharkhand	HINDI	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.722	2026-06-08 10:21:37.722	\N	\N	\N	\N	[]	{}
cmq529sfu004zyw0ap8jx1xvg	Ebenezer Paul	student7@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Trinity Covenant	Assam	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.722	2026-06-08 10:21:37.722	\N	\N	\N	\N	[]	{}
cmq529sfu0050yw0arcbyea6n	Rupali Das	student8@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Redeemer Assembly	West Bengal	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.723	2026-06-08 10:21:37.723	\N	\N	\N	\N	[]	{}
cmq529sfv0051yw0at2u3xime	John Wesley	student9@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Faith Mission	Uttar Pradesh	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.724	2026-06-08 10:21:37.724	\N	\N	\N	\N	[]	{}
cmq529sfw0052yw0a4ighduuq	Mercy Mathew	student10@test.com	$2b$12$E/WuWZMbmT99WjKxdUvKYeaOBl5wAfvctJtC31Q3isfnuvE96mN1C	STUDENT	\N	\N	\N	Hope Fellowship	Telangana	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 10:21:37.724	2026-06-08 10:21:37.724	\N	\N	\N	\N	[]	{}
cmq5lvptl0001fr2a3a4rykpf	Joshua R Tharakan	joshuartharakan98@gmail.com	$2b$12$CbUre5IuadFEl.WkPMhbp.Iup/dahKkWHypdqdVhdzVEHU/onxsue	STUDENT	\N	\N	\N	Crossway AG Church	Bengaluru	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-08 19:30:33.465	2026-06-08 19:30:33.465	\N	\N	\N	\N	[]	{}
cmq6k8y7e00003966gu1247p9	Joel R Tharakan	joelrtharakan@gmail.com	$2b$12$pG/s42/t2yHz91tH/ul4F.gOLVUVwzNc0QlnYnRwZzbnWgCGetmuC	INSTRUCTOR	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781617510234-cmq6k8y7e00003966gu1247p9.jpeg	I am currently pursuing a Bachelor of Technology (B.Tech) and have a strong passion for learning, innovation, and personal growth. Alongside my technical studies, I have a keen interest in Biblical Studies and theology, seeking to deepen my understanding of Scripture and its application to everyday life. I am committed to academic excellence, continuous development, and using my knowledge and skills to make a positive impact on society. \n\n	+91 6360238632	Crossway AG Church	BENGALURU	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-09 11:32:37.802	2026-06-16 13:45:19.381	\N	Mr.	B.Tech	1	[]	{}
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
edce18fe-2397-4e91-a054-e8c012145bd4	5a22a5f113524a60e8cc93a92d15072d8728bd8fd0a7c072d414f99c90952dba	2026-06-17 09:56:25.936779+00	20260617095518_init_postgres		\N	2026-06-17 09:56:25.936779+00	0
\.


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: Answer Answer_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceRecord AttendanceRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceSession AttendanceSession_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: CertificateTemplate CertificateTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."CertificateTemplate"
    ADD CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Certificate Certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CourseInvitation CourseInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."CourseInvitation"
    ADD CONSTRAINT "CourseInvitation_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: Curriculum Curriculum_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Curriculum"
    ADD CONSTRAINT "Curriculum_pkey" PRIMARY KEY (id);


--
-- Name: DiscussionReply DiscussionReply_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."DiscussionReply"
    ADD CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY (id);


--
-- Name: Discussion Discussion_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplate EmailTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: ExtensionRequest ExtensionRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_pkey" PRIMARY KEY (id);


--
-- Name: Extension Extension_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Extension"
    ADD CONSTRAINT "Extension_pkey" PRIMARY KEY (id);


--
-- Name: ForumPost ForumPost_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_pkey" PRIMARY KEY (id);


--
-- Name: ForumReply ForumReply_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ForumReply"
    ADD CONSTRAINT "ForumReply_pkey" PRIMARY KEY (id);


--
-- Name: Forum Forum_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Forum"
    ADD CONSTRAINT "Forum_pkey" PRIMARY KEY (id);


--
-- Name: LessonProgress LessonProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Note Note_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PayoutRequest PayoutRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: QuizAttempt QuizAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Quiz Quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY (id);


--
-- Name: ReadingMaterialProgress ReadingMaterialProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReadingMaterialProgress"
    ADD CONSTRAINT "ReadingMaterialProgress_pkey" PRIMARY KEY (id);


--
-- Name: ReadingMaterial ReadingMaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReadingMaterial"
    ADD CONSTRAINT "ReadingMaterial_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: RubricCriteria RubricCriteria_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."RubricCriteria"
    ADD CONSTRAINT "RubricCriteria_pkey" PRIMARY KEY (id);


--
-- Name: RubricLevel RubricLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."RubricLevel"
    ADD CONSTRAINT "RubricLevel_pkey" PRIMARY KEY (id);


--
-- Name: Rubric Rubric_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Rubric"
    ADD CONSTRAINT "Rubric_pkey" PRIMARY KEY (id);


--
-- Name: Section Section_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: Sponsorship Sponsorship_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Sponsorship"
    ADD CONSTRAINT "Sponsorship_pkey" PRIMARY KEY (id);


--
-- Name: Submission Submission_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Assignment_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Assignment_lessonId_key" ON public."Assignment" USING btree ("lessonId");


--
-- Name: AttendanceRecord_sessionId_studentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON public."AttendanceRecord" USING btree ("sessionId", "studentId");


--
-- Name: BlogPost_slug_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "BlogPost_slug_idx" ON public."BlogPost" USING btree (slug);


--
-- Name: BlogPost_slug_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "BlogPost_slug_key" ON public."BlogPost" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Certificate_studentId_courseId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Certificate_studentId_courseId_key" ON public."Certificate" USING btree ("studentId", "courseId");


--
-- Name: Certificate_uniqueCode_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Certificate_uniqueCode_key" ON public."Certificate" USING btree ("uniqueCode");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: CourseInvitation_courseId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "CourseInvitation_courseId_key" ON public."CourseInvitation" USING btree ("courseId");


--
-- Name: CourseInvitation_instructorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "CourseInvitation_instructorId_idx" ON public."CourseInvitation" USING btree ("instructorId");


--
-- Name: CourseInvitation_status_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "CourseInvitation_status_idx" ON public."CourseInvitation" USING btree (status);


--
-- Name: Course_instructorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_instructorId_idx" ON public."Course" USING btree ("instructorId");


--
-- Name: Course_programId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_programId_idx" ON public."Course" USING btree ("programId");


--
-- Name: Course_slug_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_slug_idx" ON public."Course" USING btree (slug);


--
-- Name: Course_slug_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Course_slug_key" ON public."Course" USING btree (slug);


--
-- Name: Course_status_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_status_idx" ON public."Course" USING btree (status);


--
-- Name: Curriculum_courseId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Curriculum_courseId_key" ON public."Curriculum" USING btree ("courseId");


--
-- Name: EmailTemplate_name_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "EmailTemplate_name_key" ON public."EmailTemplate" USING btree (name);


--
-- Name: Enrollment_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_courseId_idx" ON public."Enrollment" USING btree ("courseId");


--
-- Name: Enrollment_studentId_courseId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON public."Enrollment" USING btree ("studentId", "courseId");


--
-- Name: Enrollment_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_studentId_idx" ON public."Enrollment" USING btree ("studentId");


--
-- Name: ExtensionRequest_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ExtensionRequest_courseId_idx" ON public."ExtensionRequest" USING btree ("courseId");


--
-- Name: ExtensionRequest_itemId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ExtensionRequest_itemId_idx" ON public."ExtensionRequest" USING btree ("itemId");


--
-- Name: ExtensionRequest_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ExtensionRequest_studentId_idx" ON public."ExtensionRequest" USING btree ("studentId");


--
-- Name: Extension_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Extension_courseId_idx" ON public."Extension" USING btree ("courseId");


--
-- Name: Extension_itemId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Extension_itemId_idx" ON public."Extension" USING btree ("itemId");


--
-- Name: Extension_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Extension_studentId_idx" ON public."Extension" USING btree ("studentId");


--
-- Name: Extension_studentId_itemId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Extension_studentId_itemId_key" ON public."Extension" USING btree ("studentId", "itemId");


--
-- Name: ForumPost_forumId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ForumPost_forumId_idx" ON public."ForumPost" USING btree ("forumId");


--
-- Name: ForumReply_postId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ForumReply_postId_idx" ON public."ForumReply" USING btree ("postId");


--
-- Name: Forum_courseId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Forum_courseId_key" ON public."Forum" USING btree ("courseId");


--
-- Name: LessonProgress_enrollmentId_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON public."LessonProgress" USING btree ("enrollmentId", "lessonId");


--
-- Name: Lesson_sectionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Lesson_sectionId_idx" ON public."Lesson" USING btree ("sectionId");


--
-- Name: Message_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Message_senderId_receiverId_idx" ON public."Message" USING btree ("senderId", "receiverId");


--
-- Name: Note_studentId_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Note_studentId_lessonId_key" ON public."Note" USING btree ("studentId", "lessonId");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: Payment_stripePaymentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON public."Payment" USING btree ("stripePaymentId");


--
-- Name: PayoutRequest_instructorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "PayoutRequest_instructorId_idx" ON public."PayoutRequest" USING btree ("instructorId");


--
-- Name: Program_status_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Program_status_idx" ON public."Program" USING btree (status);


--
-- Name: Question_quizId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Question_quizId_idx" ON public."Question" USING btree ("quizId");


--
-- Name: QuizAttempt_quizId_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "QuizAttempt_quizId_studentId_idx" ON public."QuizAttempt" USING btree ("quizId", "studentId");


--
-- Name: Quiz_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Quiz_lessonId_key" ON public."Quiz" USING btree ("lessonId");


--
-- Name: ReadingMaterialProgress_enrollmentId_readingMaterialId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "ReadingMaterialProgress_enrollmentId_readingMaterialId_key" ON public."ReadingMaterialProgress" USING btree ("enrollmentId", "readingMaterialId");


--
-- Name: Review_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Review_courseId_idx" ON public."Review" USING btree ("courseId");


--
-- Name: Review_courseId_studentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Review_courseId_studentId_key" ON public."Review" USING btree ("courseId", "studentId");


--
-- Name: Section_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Section_courseId_idx" ON public."Section" USING btree ("courseId");


--
-- Name: Sponsorship_stripePaymentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Sponsorship_stripePaymentId_key" ON public."Sponsorship" USING btree ("stripePaymentId");


--
-- Name: Submission_assignmentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Submission_assignmentId_idx" ON public."Submission" USING btree ("assignmentId");


--
-- Name: Submission_assignmentId_studentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Submission_assignmentId_studentId_key" ON public."Submission" USING btree ("assignmentId", "studentId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Announcement Announcement_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Answer Answer_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Assignment Assignment_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Assignment Assignment_rubricId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES public."Rubric"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AttendanceRecord AttendanceRecord_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."AttendanceSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceRecord AttendanceRecord_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceSession AttendanceSession_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceSession AttendanceSession_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogPost BlogPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Certificate Certificate_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Certificate Certificate_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certificate Certificate_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."CertificateTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Coupon Coupon_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseInvitation CourseInvitation_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."CourseInvitation"
    ADD CONSTRAINT "CourseInvitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseInvitation CourseInvitation_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."CourseInvitation"
    ADD CONSTRAINT "CourseInvitation_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Course Course_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Curriculum Curriculum_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Curriculum"
    ADD CONSTRAINT "Curriculum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DiscussionReply DiscussionReply_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."DiscussionReply"
    ADD CONSTRAINT "DiscussionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DiscussionReply DiscussionReply_discussionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."DiscussionReply"
    ADD CONSTRAINT "DiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Discussion Discussion_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Enrollment Enrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Enrollment Enrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionRequest ExtensionRequest_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionRequest ExtensionRequest_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Extension Extension_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Extension"
    ADD CONSTRAINT "Extension_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Extension Extension_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Extension"
    ADD CONSTRAINT "Extension_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumPost ForumPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumPost ForumPost_forumId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES public."Forum"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ForumReply ForumReply_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ForumReply"
    ADD CONSTRAINT "ForumReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumReply ForumReply_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ForumReply"
    ADD CONSTRAINT "ForumReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."ForumPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Forum Forum_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Forum"
    ADD CONSTRAINT "Forum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LessonProgress LessonProgress_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LessonProgress LessonProgress_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."LessonProgress"
    ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Note Note_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Note Note_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PayoutRequest PayoutRequest_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuizAttempt QuizAttempt_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuizAttempt QuizAttempt_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quiz Quiz_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quiz Quiz_rubricId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES public."Rubric"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReadingMaterialProgress ReadingMaterialProgress_enrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReadingMaterialProgress"
    ADD CONSTRAINT "ReadingMaterialProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES public."Enrollment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingMaterialProgress ReadingMaterialProgress_readingMaterialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReadingMaterialProgress"
    ADD CONSTRAINT "ReadingMaterialProgress_readingMaterialId_fkey" FOREIGN KEY ("readingMaterialId") REFERENCES public."ReadingMaterial"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingMaterial ReadingMaterial_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReadingMaterial"
    ADD CONSTRAINT "ReadingMaterial_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RubricCriteria RubricCriteria_rubricId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."RubricCriteria"
    ADD CONSTRAINT "RubricCriteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES public."Rubric"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RubricLevel RubricLevel_criteriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."RubricLevel"
    ADD CONSTRAINT "RubricLevel_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES public."RubricCriteria"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rubric Rubric_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Rubric"
    ADD CONSTRAINT "Rubric_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Section Section_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sponsorship Sponsorship_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Sponsorship"
    ADD CONSTRAINT "Sponsorship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Submission Submission_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 6c8FrNy6YldaaVumap2m71sewAmuh509C4uqeMMdYGfhCx4UUloiW67jv0a4auw

