--
-- PostgreSQL database dump
--

\restrict lFJsk6eIGWyA31XMnLRTCeXxlA4BURpWzRf6FP5q1m3JHwEtCey3f5nE9Xt1bug

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivityLog; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."ActivityLog" (
    id text NOT NULL,
    "userId" text,
    "actorEmail" text,
    "actorName" text,
    "actorRole" text,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    description text,
    metadata text,
    "ipAddress" text,
    "userAgent" text,
    status text DEFAULT 'SUCCESS'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ActivityLog" OWNER TO cway;

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customAuthor" text
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
    "courseId" text,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uniqueCode" text NOT NULL,
    "downloadUrl" text,
    "templateId" text,
    "certificateNumber" text,
    "programId" text,
    type text DEFAULT 'COURSE'::text NOT NULL
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type text DEFAULT 'COURSE'::text NOT NULL
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
    "programId" text,
    "courseCode" text
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "applicationsClosed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Program" OWNER TO cway;

--
-- Name: ProgramApplication; Type: TABLE; Schema: public; Owner: cway
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "reference1Email" text,
    "reference1Type" text,
    "reference2Email" text,
    "reference2Type" text,
    "reference1Status" text DEFAULT 'PENDING'::text NOT NULL,
    "reference1Token" text,
    "reference2Status" text DEFAULT 'PENDING'::text NOT NULL,
    "reference2Token" text
);


ALTER TABLE public."ProgramApplication" OWNER TO cway;

--
-- Name: ProgramEnrollment; Type: TABLE; Schema: public; Owner: cway
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


ALTER TABLE public."ProgramEnrollment" OWNER TO cway;

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
-- Name: ReferenceForm; Type: TABLE; Schema: public; Owner: cway
--

CREATE TABLE public."ReferenceForm" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "referenceIndex" integer NOT NULL,
    type text NOT NULL,
    "yearsKnown" text NOT NULL,
    "capacityKnown" text,
    "churchEngagement" text,
    "spiritualInfluence" text,
    ratings text NOT NULL,
    "financialAbility" text,
    "financialHelp" text,
    comments text,
    "attentionAreas" text,
    "discussFurther" boolean DEFAULT false NOT NULL,
    recommendation text NOT NULL,
    "refereeName" text NOT NULL,
    "refereePosition" text,
    "churchName" text,
    denomination text,
    address text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    "signatureUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ReferenceForm" OWNER TO cway;

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
    "notificationPrefs" text DEFAULT '{}'::text NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "lastLogoutAt" timestamp(3) without time zone,
    "appActiveSeconds" integer DEFAULT 0 NOT NULL
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
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ActivityLog" (id, "userId", "actorEmail", "actorName", "actorRole", action, resource, "resourceId", description, metadata, "ipAddress", "userAgent", status, "createdAt") FROM stdin;
cmqyvgd0w0001gnn4a2f9vuad	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 07:03:52.305
cmqyyhthw0001pibtgg2qlxq6	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 08:28:59.157
cmqyyl5v50003pibt3idjg840	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 08:31:35.154
cmqyylvud0005pibtt5qvukl9	\N	joelrtharakan880@cwayacademy.com	\N	\N	LOGIN_FAILED	\N	\N	Failed login attempt for joelrtharakan880@cwayacademy.com	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	FAILED	2026-06-29 08:32:08.821
cmqyymb980007pibt035dyigt	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 08:32:28.796
cmqyz93qv0001zoayn9xbdi3t	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 08:50:12.151
cmqz5je1e0001ujuhen7y91y3	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 11:46:09.746
cmqz5jtxe0003ujuh4vbbcsd9	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 11:46:30.338
cmqz5yigq0001y9w1leb06qi4	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 11:57:55.323
cmqz5yk0w0003y9w1oq29tprz	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 11:57:57.344
cmqz5ysdw0005y9w1ml220ne5	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 11:58:08.181
cmqz68itk0001pt17zwwe3yii	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	invitations	\N	GET /api/v1/instructor/invitations → You do not have permission to perform this action	\N	::1	\N	FAILED	2026-06-29 12:05:42.345
cmqz68jln0003pt178brslxpn	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	invitations	\N	GET /api/v1/instructor/invitations → You do not have permission to perform this action	\N	::1	\N	FAILED	2026-06-29 12:05:43.355
cmqz68lch0005pt170bw23ysm	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	assignment	\N	GET /api/v1/instructor/assignments → You do not have permission to perform this action	\N	::1	\N	FAILED	2026-06-29 12:05:45.617
cmqz68m4l0007pt17k5jwcbrn	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	assignment	\N	GET /api/v1/instructor/assignments → You do not have permission to perform this action	\N	::1	\N	FAILED	2026-06-29 12:05:46.629
cmqz6e7bx0003gprg7nkj9t9w	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	ADMIN	CREATE	program	cmqz1e2fe001274im7vdmwo2z	Created program (cmqz1e2f…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 12:10:07.389
cmqz6z2450001taf8r0yv1mhy	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	ADMIN	DELETE	program	cmqz1e2fe001274im7vdmwo2z	Deleted program (cmqz1e2f…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 12:26:20.405
cmqz6zqsk0003taf8kwv3nf9q	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	ADMIN	DELETE	course	cmqz6e3rj0001gprgrbp14nkn	Deleted course (cmqz6e3r…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 12:26:52.388
cmqz709ej0005taf8ccnagglj	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	invitations	\N	GET /api/v1/instructor/invitations → You do not have permission to perform this action	\N	::1	\N	FAILED	2026-06-29 12:27:16.507
cmqz7b8tq0007taf8o157vilw	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	ERROR	program	\N	GET /api/v1/admin/programs → \nInvalid `prisma.program.findMany()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:1148:20\n\n  1145 if (search) where.title = { contains: search, mode: "insensitive" };\n  1146 \n  1147 const [programs, total] = await Promise.all([\n→ 1148   prisma.program.findMany(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-29 12:35:48.975
cmqz97w9e0001t1emffdd278f	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.28.187.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 13:29:11.954
cmqz9bkfr0003t1em8csx0zw0	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.29.109.134	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:32:03.256
cmqz9e97q0009taf8te7p8ii8	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	LOGOUT	\N	\N	registrar@cwayacademy.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:34:08.678
cmqz9euy60005t1em3djcwptm	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	10.24.127.129	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:34:36.846
cmqz9i64l000btaf8lap7d0b2	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:37:11.301
cmqz9m1yr000dtaf82qw773yi	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:40:12.531
cmqz9s8fh0007t1em6n7nrz6s	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.24.127.129	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-29 13:45:00.846
cmqza12xc000ftaf8goas0h5j	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:51:53.617
cmqza1why0009t1emdbpcaa4q	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.29.109.134	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:52:31.942
cmqza60q2000bt1emshs13g4h	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.29.109.134	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	SUCCESS	2026-06-29 13:55:44.042
cmqzabjsc000htaf8tc19gvkv	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	stats	\N	GET /api/v1/admin/stats → \nInvalid `prisma.certificate.count()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:47:24\n\n  44   _sum: { amount: true },\n  45   where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },\n  46 }),\n→ 47 prisma.certificate.count(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-29 14:00:02.028
cmqzabjsn000ltaf8w3ldjjlk	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	user	\N	GET /api/v1/admin/users?limit=8&sortBy=createdAt&sortOrder=desc → \nInvalid `prisma.user.count()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:287:17\n\n  284     _count: { select: { enrollments: true, coursesCreated: true } },\n  285   },\n  286 }),\n→ 287 prisma.user.count(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-29 14:00:02.04
cmqzabjsi000jtaf8zd5iqysm	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	revenue	\N	GET /api/v1/admin/analytics/revenue?period=12m → \nInvalid `prisma.payment.findMany()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:76:41\n\n  73 const period = (req.query.period as string) || "12m";\n  74 const months = period === "7d" ? 1 : period === "30d" ? 1 : 12;\n  75 \n→ 76 const payments = await prisma.payment.findMany(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-29 14:00:02.035
cmqzblgw1000ntaf8dli1j2lm	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	stats	\N	GET /api/v1/admin/stats → \nInvalid `prisma.user.count()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:36:17\n\n  33 ] = await Promise.all([\n  34   prisma.user.count(),\n  35   prisma.user.count({ where: { role: "STUDENT" } }),\n→ 36   prisma.user.count(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-29 14:35:44.449
cmr0i0b0h00018agkumqpqzk9	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 10:23:00.544
cmr0i0i1x00038agkf6bu4k01	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	analytics	\N	GET /api/v1/admin/analytics/courses → \nInvalid `prisma.course.findMany()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:148:19\n\n  145     courses: { select: { _count: { select: { enrollments: true } } } },\n  146   },\n  147 }),\n→ 148 prisma.course.findMany(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-30 10:23:09.669
cmr0i1ss60001v6grkcrj5cjt	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.27.43.242	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-30 10:24:10.23
cmr0k4ja50001e0lio9n7qr7k	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-30 11:22:17.117
cmr0kxcpk0022pqa66eojw8rj	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	duplicate	\N	POST /api/v1/admin/courses/cmqm3bas20005pm88e08zdgem/duplicate → \nInvalid `tx.courseInvitation.create()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:1641:31\n\n  1638   }\n  1639 });\n  1640 \n→ 1641 await tx.courseInvitation.create(\nTransaction API error: Transaction already closed: Could not perform operation.	\N	::1	\N	FAILED	2026-06-30 11:44:41.201
cmr0l1unb0045u0vtlnefkys3	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	ADMIN	ERROR	duplicate	\N	POST /api/v1/admin/courses/cmqm3bas20005pm88e08zdgem/duplicate → \nInvalid `prisma.course.create()` invocation:\n\n\nUnique constraint failed on the fields: (`slug`)	\N	::1	\N	FAILED	2026-06-30 11:48:11.055
cmr0ld2f10024u021g6w9fixp	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	ADMIN	CREATE	duplicate	\N	Created duplicate	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 11:56:54.782
cmr0lfa0m0026u021phe93vvm	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	ADMIN	DELETE	course	cmr0l16te0002u0vt6s4el43w	Deleted course (cmr0l16t…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 11:58:37.942
cmr0lvfkf0028u0217ib9ekn3	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:11:11.631
cmr0lvw6p002au021ns52zj7e	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	CREATE	invitations	cmr0ld0940022u0218zdufmur	Created invitations (cmr0ld09…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:11:33.169
cmr0mj5ot004gu021ghcltff7	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	ADMIN	CREATE	duplicate	\N	Created duplicate	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:29:38.574
cmr0mnru7004iu021d9na0hez	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	ERROR	stats	\N	GET /api/v1/admin/stats → \nInvalid `prisma.payment.aggregate()` invocation in\n/Users/joeltharakan/Documents/cway-academy/apps/api/src/controllers/admin.controller.ts:42:20\n\n  39 prisma.course.count({ where: { status: "PENDING" } }),\n  40 prisma.enrollment.count(),\n  41 prisma.enrollment.count({ where: { enrolledAt: { gte: startOfMonth } } }),\n→ 42 prisma.payment.aggregate(\nCan't reach database server at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`\n\nPlease make sure your database server is running at `dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com`:`5432`.	\N	::1	\N	FAILED	2026-06-30 12:33:13.904
cmr0nacak0007yukuuy9sekzq	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002hu021z50tv4wx	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:50:46.845
cmr0nacak0006yuku61naz32f	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002hu021z50tv4wx	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:50:46.845
cmr0nais3000eyukuqvilxwfc	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002hu021z50tv4wx	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:50:55.251
cmr0nais3000fyukurnkrmgo6	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002hu021z50tv4wx	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:50:55.251
cmr0najyy000hyukui7nsftpa	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002hu021z50tv4wx	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:50:56.794
cmr0naky7000jyuku0s85cbaj	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002hu021z50tv4wx	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:50:56.794
cmr0ner6f000ryukuj04v674j	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:12.759
cmr0ner6f000qyukuudqrm180	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:12.759
cmr0netlq000xyuku1fhonqn0	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:15.902
cmr0netlq000wyukukfncv6xv	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:15.902
cmr0neua50013yukusld3175x	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:16.781
cmr0neua50012yuku9ninxn5o	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:16.781
cmr0nezte0015yukuxlw3j7zg	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:23.955
cmr0nf07e0017yuku918vmgl7	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002iu021zuw3btc3	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 12:54:23.955
cmr0ntlgg001byukuvpnakyu3	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	QUIZ_ATTEMPT	quiz	cmr0mijpp002pu021f1uib6i9	Started quiz attempt (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:05:45.184
cmr0ntlsg001dyukujsr5l5f9	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	QUIZ_ATTEMPT	quiz	cmr0mijpp002pu021f1uib6i9	Started quiz attempt (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:05:45.184
cmr0ntmf5001fyukuxyqicawl	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	quiz	\N	POST /api/v1/student/quizzes/cmr0mijpp002pu021f1uib6i9/attempt → Maximum attempts reached	\N	::1	\N	FAILED	2026-06-30 13:05:46.433
cmr0nue4c001myukuwni2ofgw	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	QUIZ_SUBMIT	quiz	cmr0mijpp002pu021f1uib6i9	Submitted quiz (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:21.861
cmr7zdtpd000912ypen8tvx6f	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	LOGOUT	\N	\N	registrar@cwayacademy.com logged out	\N	10.27.23.132	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 16:03:48.001
cmr0nudr9001iyukualti40f4	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	QUIZ_SUBMIT	quiz	cmr0mijpp002pu021f1uib6i9	Submitted quiz (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:21.861
cmr0nudr9001jyukum2vvapuh	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	QUIZ_SUBMIT	quiz	cmr0mijpp002pu021f1uib6i9	Submitted quiz (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:21.861
cmr0nue4c001nyukukrdm7kfc	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	QUIZ_SUBMIT	quiz	cmr0mijpp002pu021f1uib6i9	Submitted quiz (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:21.861
cmr0nulv0001uyukuvs4e1t3b	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002nu0211hccv3yz	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:32.364
cmr0nulv0001vyukuu3lycw8v	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002nu0211hccv3yz	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:32.364
cmr0nulzy001xyukumc0ofqzo	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002nu0211hccv3yz	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:32.542
cmr0numbs001zyukucopanh10	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LESSON_COMPLETE	lesson	cmr0mijpp002nu0211hccv3yz	Completed lesson (cmr0mijp…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:06:32.542
cmr0od7hu0023yukuslqwdd4m	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	ERROR	enrollment	\N	POST /api/v1/student/enrollments → Course not found or not available	\N	::1	\N	FAILED	2026-06-30 13:21:00.21
cmr0ohxs6000378dtwpuwaack	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	ENROLL	enrollment	\N	Enrolled in course	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:24:40.902
cmr0oi04g000578dt05tbjiv0	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	ENROLL	enrollment	\N	Enrolled in course	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:24:40.902
cmr0oksxy0001w49vh5hu4egc	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:26:54.598
cmr0pewv30001ai9nqxytz5yp	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:50:19.359
cmr0phq9g0003ai9n2tysn7d1	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	DELETE	instructor	\N	Deleted instructor	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:52:30.772
cmr0pld8r0005ai9nxo9ylbd3	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	UPDATE	v1	\N	Updated v1	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:55:20.523
cmr0plllk0007ai9nsug1ucje	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	UPDATE	v1	\N	Updated v1	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 13:55:31.352
cmr0pwble0001eznpnhipzand	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	ERROR	enrollment	\N	POST /api/v1/student/enrollments → You are already enrolled in this course	\N	::1	\N	FAILED	2026-06-30 14:03:51.602
cmr0pzsi60003eznpobn1zemu	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:06:33.487
cmr0q6wa10005eznpbhua8rg7	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:12:04.969
cmr0q89je0007eznp09oa7pue	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	UPDATE	notification	\N	Updated notification	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:13:08.391
cmr0q89jo0009eznptg8x9i2s	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	UPDATE	notification	\N	Updated notification	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:13:08.391
cmr0q8acm000deznpafswvekb	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	UPDATE	notification	\N	Updated notification	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:13:09.862
cmr0q8acm000ceznpt6slft6t	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	UPDATE	notification	\N	Updated notification	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:13:09.862
cmr0q8pc8000feznp16qmcim5	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-06-30 14:13:29.288
cmr0qwvay0001tryok4leja5p	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-30 14:32:16.762
cmr0qxcor0003tryo2suhklt3	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-30 14:32:39.292
cmr0r0ase0005tryo90akuu6x	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-30 14:34:56.798
cmr0r2xkk00012p3ew2w37g62	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-06-30 14:36:59.636
cmr2ksi6q0001mga0uagcrwfx	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-01 21:16:27.792
cmr2lb0qg0001k9di3bryp4os	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.27.10.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-01 21:30:51.64
cmr2lc1830003k9di1n3m81jm	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.27.43.242	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-01 21:31:38.931
cmr2ldqeh0005k9difwmpvava	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	10.27.10.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-01 21:32:58.217
cmr375vnj000143xvyxmqikyk	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.27.43.242	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-02 07:42:43.327
cmr379kqo000343xvpgcifxay	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-02 07:45:35.809
cmr37bymf000543xvmljy3jre	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-02 07:47:27.111
cmr3cq7ts0001a13g71rp48je	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-02 10:18:30.247
cmr3ezoqe000112vvycntprz3	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.29.236.246	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-02 11:21:51.35
cmr3fww380001g6742nhuxi4b	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.24.131.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-02 11:47:40.532
cmr3g0jse0003g674xktzka3g	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	10.30.55.129	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-02 11:50:31.214
cmr3g3qzf0001p1fu2pwagpy6	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	10.29.236.246	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-02 11:53:00.508
cmr3g45ny0003p1fu7e290qjf	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.27.43.242	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15	SUCCESS	2026-07-02 11:53:19.534
cmr3nuxyi0001gsoql3mthk6n	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-02 15:30:06.57
cmr3nxpds0003gsoqutw2344c	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	10.29.236.246	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-02 15:32:15.425
cmr3ow4rb0001v1bkan66mwmn	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.29.236.246	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	SUCCESS	2026-07-02 15:59:01.655
cmr3owuu60003v1bkz3b8io2w	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	10.26.96.8	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	SUCCESS	2026-07-02 15:59:35.454
cmr3owuu80005v1bkgml5ug3f	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	\N	ADMIN	LOGOUT	\N	\N	admin@cwayacademy.com logged out	\N	10.27.43.242	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	SUCCESS	2026-07-02 15:59:35.456
cmr53jtd80001dv8ho16s1pdz	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	10.28.50.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-03 15:37:07.436
cmr53o95v0003dv8hl0w9kepq	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	LOGOUT	\N	\N	registrar@cwayacademy.com logged out	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-03 15:40:34.531
cmr53odv80005dv8h9li6mx22	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-03 15:40:40.628
cmr6ksfoy0001o0i3a4y1qqhz	cmqku2zbo00003u1qrtqtk0h8	admin@cwayacademy.com	CWAY Admin	ADMIN	LOGIN	\N	\N	admin@cwayacademy.com logged in	\N	10.27.43.242	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	SUCCESS	2026-07-04 16:27:28.858
cmr7yj37m00015qhtfybvussa	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.24.131.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 15:39:53.986
cmr7yj5k400035qht3ugznm8j	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	10.24.131.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 15:39:57.028
cmr7yjb5k00055qhtuail4bh4	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.24.131.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 15:40:04.281
cmr7yzush000112ypkwiotctl	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	10.27.10.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 15:52:56.225
cmr7yzz9v000312yp2wnib6u7	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	10.27.10.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 15:53:02.034
cmr7z4r7z000512ypjsjpd5nf	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	\N	REGISTRAR	LOGOUT	\N	\N	registrar@cwayacademy.com logged out	\N	10.31.186.135	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 15:56:44.879
cmr7zchl8000712ypzwl8mumh	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-05 16:02:45.235
cmr8y3oue0001pemp2vm49k0d	cmqz5i7660000tjftgvoo5j5v	registrar@cwayacademy.com	Main Registrar	REGISTRAR	LOGIN	\N	\N	registrar@cwayacademy.com logged in	\N	10.26.181.2	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-06 08:15:41.288
cmr8ybsfc0003pemprhykdm81	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.29.199.9	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 08:21:59.592
cmr92gjg50001svqjf88w46gd	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.28.50.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 10:17:39.701
cmr92v1go0003svqj8d9hc7qz	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.28.50.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-06 10:28:55.9
cmr9d4t51000112azm83760bp	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.29.199.9	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 15:16:27.763
cmr9d72wv00015ik2xurggvff	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 15:18:11.532
cmr9fd1ds0001zat3mg9506bn	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 16:18:48.658
cmr9femvq0001m5zv0xogzgdg	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.27.10.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 16:20:05.432
cmr9fge970003zat3vnk9gtgh	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 16:21:27.979
cmr9fgsis0005zat3c1v3ggnw	\N	dr.reeju@cwayacademy.com	\N	\N	LOGIN_FAILED	\N	\N	Failed login attempt for dr.reeju@cwayacademy.com	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	FAILED	2026-07-06 16:21:46.468
cmr9fh7lq0007zat3il9obo62	cmqku2zbu00013u1qbthq3afd	dr.reeju@cwayacademy.com	Dr. Reeju Tharakan	INSTRUCTOR	LOGIN	\N	\N	dr.reeju@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 16:22:06.014
cmr9j5jsy0001ptxiyx7fbyg2	cmqku2zbu00013u1qbthq3afd	dr.reeju@cwayacademy.com	Dr. Reeju Tharakan	INSTRUCTOR	LOGIN	\N	\N	dr.reeju@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 18:04:59.038
cmr9jy9ih0003ptxip75cp9gs	cmqku2zbu00013u1qbthq3afd	dr.reeju@cwayacademy.com	Dr. Reeju Tharakan	INSTRUCTOR	LOGIN	\N	\N	dr.reeju@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-06 18:27:20.025
cmr9jyfyr0005ptxirlz9utdl	cmqku2zbu00013u1qbthq3afd	dr.reeju@cwayacademy.com	\N	INSTRUCTOR	LOGOUT	\N	\N	dr.reeju@cwayacademy.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-06 18:27:28.468
cmr9jyxdf0007ptxic5i8i7un	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-06 18:27:50.929
cmr9k1un10009ptxi6xljcf77	cmqku2zbu00013u1qbthq3afd	dr.reeju@cwayacademy.com	Dr. Reeju Tharakan	INSTRUCTOR	LOGIN	\N	\N	dr.reeju@cwayacademy.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 18:30:07.454
cmr9kgrnq000bptxizryh92ex	cmqku2zbu00013u1qbthq3afd	dr.reeju@cwayacademy.com	Dr. Reeju Tharakan	INSTRUCTOR	GRADE	discussion	cmqpok9yq001bhrq8fcr78lwp	Graded submission (cmqpok9y…)	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 18:41:43.43
cmr9ks27z00015uib8hs5glb1	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.27.10.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-06 18:50:29.778
cmr9ks7v100035uibiucv90yi	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	ERROR	discussion	\N	GET /api/v1/forums/instructor/discussions → Can't find /api/v1/forums/instructor/discussions on this server!	\N	10.27.10.4	\N	FAILED	2026-07-06 18:50:37.646
cmr9ks8vm00055uibjn31ekts	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	ERROR	discussion	\N	GET /api/v1/forums/instructor/discussions → Can't find /api/v1/forums/instructor/discussions on this server!	\N	10.31.13.130	\N	FAILED	2026-07-06 18:50:38.963
cmr9kscog00075uibl5cn6o0y	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	ERROR	discussion	\N	GET /api/v1/forums/instructor/discussions → Can't find /api/v1/forums/instructor/discussions on this server!	\N	10.31.13.130	\N	FAILED	2026-07-06 18:50:43.888
cmr9ksdnq00095uibt48qzdv8	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	ERROR	discussion	\N	GET /api/v1/forums/instructor/discussions → Can't find /api/v1/forums/instructor/discussions on this server!	\N	10.24.131.6	\N	FAILED	2026-07-06 18:50:45.158
cmra5pq4h0001546kp1m19deq	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.24.131.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-07 04:36:33.281
cmra5qzad0003546k77lp4fhr	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	10.24.131.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-07 04:37:31.813
cmrf9kuny0001fxvm1khnyt3q	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.25.115.129	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-10 18:23:33.126
cmrf9lcna0003fxvm5726ccvb	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	10.30.31.209	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-10 18:23:58.535
cmrf9lh450005fxvmrrzcta3f	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.25.115.129	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-10 18:24:04.325
cmrgow0200001q7pghgzxz6q1	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	10.30.39.134	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-11 18:19:55.848
cmrgow4m80003q7pg7184xmzm	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	10.30.39.134	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-11 18:20:01.76
cmrgowd6c0005q7pg0jcjsdtp	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.29.197.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-11 18:20:12.851
cmrgowyxg0007q7pgguo6ton8	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	10.30.39.134	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-11 18:20:41.044
cmrmbbqub0001owbopiecoxr1	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	10.28.221.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-15 16:46:51.835
cmrmeom190003owbojssz9qul	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	10.30.114.133	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15	SUCCESS	2026-07-15 18:20:51.981
cmrno3fx80001qvynt3vd9khw	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-16 15:32:06.606
cmrno717w0003qvynopducpqr	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-16 15:34:54.188
cmrno7dip0005qvyny7lkj91j	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	testing testing testing	STUDENT	LOGIN	\N	\N	joelrtharakan880@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-16 15:35:10.126
cmrnoekrt0007qvynzaex06bh	cmqp6pnjo000010tomoljdyc4	joelrtharakan880@gmail.com	\N	STUDENT	LOGOUT	\N	\N	joelrtharakan880@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-16 15:40:46.121
cmrnoexam0009qvyndni0tmcx	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	Joel R Tharakan	INSTRUCTOR	LOGIN	\N	\N	joelrtharakan@gmail.com logged in	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-16 15:41:02.349
cmrnof3gk000bqvynisvrmw4k	cmql8quqk0000h58xt3rfj7uo	joelrtharakan@gmail.com	\N	INSTRUCTOR	LOGOUT	\N	\N	joelrtharakan@gmail.com logged out	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	SUCCESS	2026-07-16 15:41:10.341
\.


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Announcement" (id, "courseId", "sectionId", "authorId", title, content, "isPinned", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Answer; Type: TABLE DATA; Schema: public; Owner: cway
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
cmqvcd4jt000fam5kz7w0pdeq	cmqvcd4jt000eam5k8zfj016p	. Berith	f
cmqvcd4jt000gam5k0ajrj1qz	cmqvcd4jt000eam5k8zfj016p	Biblos	t
cmqvcd4jt000ham5ku799qr2g	cmqvcd4jt000eam5k8zfj016p	Testamentum	f
cmqvcd4jt000iam5k8dme57xi	cmqvcd4jt000eam5k8zfj016p	Canon	f
cmqvce4yi000lam5kt6sssaq2	cmqvce4yi000kam5kuerrzp0d	27	f
cmqvce4yi000mam5knkcx92si	cmqvce4yi000kam5kuerrzp0d	39	f
cmqvce4yi000nam5kavcj2wk8	cmqvce4yi000kam5kuerrzp0d	66	t
cmqvce4yi000oam5ki6lag7mj	cmqvce4yi000kam5kuerrzp0d	73	f
cmqvcfmgq000ram5k6mszckrg	cmqvcfmgq000qam5klj508hi6	Law	f
cmqvcfmgq000sam5kllnpllsa	cmqvcfmgq000qam5klj508hi6	Covenant	t
cmqvcfmgq000tam5kcnqz5tb4	cmqvcfmgq000qam5klj508hi6	Poetry	f
cmqvcfmgq000uam5kwvv07hxf	cmqvcfmgq000qam5klj508hi6	Prophets	f
cmqvchmht000xam5k6gt94aes	cmqvchmht000wam5kcycd7c4w	Because it is God’s primary means of communicating with humanity	t
cmqvchmht000yam5kko6dqmwc	cmqvchmht000wam5kcycd7c4w	Because it was written only by angels	f
cmqvchmht000zam5kj79932lh	cmqvchmht000wam5kcycd7c4w	Because it contains only history	f
cmqvchmht0010am5k0oalqadp	cmqvchmht000wam5kcycd7c4w	Because it was written in one language	f
cmqvcjl140013am5k2ra0r6v9	cmqvcjl140012am5kdm49ix3l	Singing	f
cmqvcjl140014am5kitli130m	cmqvcjl140012am5kdm49ix3l	Training in righteousness	t
cmqvcjl140015am5k67lk7v1p	cmqvcjl140012am5kdm49ix3l	BuildingWriting letters churches	f
cmqvcmn0i001cam5koelh6tbb	cmqvclscy0017am5k2j2l9pgn	Old and New	f
cmqvcmn0i001dam5k5k8wivnv	cmqvclscy0017am5k2j2l9pgn	 Law and Grace	f
cmqvcmn0i001eam5k1e0h6gx5	cmqvclscy0017am5k2j2l9pgn	Divine and Human	t
cmqvcmn0i001fam5kjaqfehww	cmqvclscy0017am5k2j2l9pgn	 Poetry and History	f
cmqvcoaa0001iam5kgdjlmd6z	cmqvcoaa0001ham5kofbgo1hh	Only the ideas of Scripture are inspired	f
cmqvcoaa0001jam5kr9phmh3d	cmqvcoaa0001ham5kofbgo1hh	The words of Scripture are God-inspired	t
cmqvcoaa0001kam5km1ghwc6r	cmqvcoaa0001ham5kofbgo1hh	Only the prophets were inspired	f
cmqvcoaa0001lam5ka70ivz13	cmqvcoaa0001ham5kofbgo1hh	Only the New Testament is inspired	f
cmqvcp4fi001oam5klq6ct1pj	cmqvcp4fi001nam5kw15eaiu5	12	f
cmqvcp4fi001pam5kbmmz9o7g	cmqvcp4fi001nam5kw15eaiu5	17	f
cmqvcp4fi001qam5kf1ng5ypg	cmqvcp4fi001nam5kw15eaiu5	40	t
cmqvcp4fi001ram5klh2qg38n	cmqvcp4fi001nam5kw15eaiu5	66	f
cmqvcqz7t001uam5ktrkvrp02	cmqvcqz7t001tam5kpvgsq4a9	Hebrew, Aramaic, and Greek	t
cmqvcqz7t001vam5kkmjpd580	cmqvcqz7t001tam5kpvgsq4a9	Latin, Greek, and English	f
cmqvcqz7t001wam5kho7emnyv	cmqvcqz7t001tam5kpvgsq4a9	Hebrew, Latin, and Arabic	f
cmqvcqz7t001xam5kpjtreso2	cmqvcqz7t001tam5kpvgsq4a9	Greek, English, and Aramaic	f
cmqvctcxy0020am5k0gk2ede4	cmqvctcxy001zam5kl1jfwm16	Book	f
cmqvctcxy0021am5k2ahkhurz	cmqvctcxy001zam5kl1jfwm16	Rule, standard, or measuring rod	t
cmqvctcxy0022am5kucrbi4g5	cmqvctcxy001zam5kl1jfwm16	Promise	f
cmqvctcxy0023am5kxev40tu2	cmqvctcxy001zam5kl1jfwm16	Teaching	f
cmqvhe45m000dkllc2coi9znk	cmqvhe45m000ckllcmicjri7p	The life of Jesus Christ	f
cmqvhe45m000ekllc4de82n7u	cmqvhe45m000ckllcmicjri7p	The structure and major themes of the Old Testament	t
cmqvhe45m000fkllcpb3g4xmu	cmqvhe45m000ckllcmicjri7p	The history of the early church	f
cmqvhe45m000gkllcblz365co	cmqvhe45m000ckllcmicjri7p	The letters of Paul	f
cmqvhgvh9000jkllcfxt7wf1q	cmqvhgvh9000ikllcad1yml64	To memorize every verse	f
cmqvhgvh9000kkllcmmmyabv7	cmqvhgvh9000ikllcad1yml64	To ignore the Old Testament	f
cmqvhgvh9000lkllczh24dvc5	cmqvhgvh9000ikllcad1yml64	To understand the Bible as a unified story	t
cmqvhgvh9000mkllcepvlocsa	cmqvhgvh9000ikllcad1yml64	To focus only on prophecy	f
cmqvhiw0i000pkllc4gmnes6w	cmqvhiw0h000okllclzxv5j3e	Moses	f
cmqvhiw0i000qkllcjmk52a9c	cmqvhiw0h000okllclzxv5j3e	David	f
cmqvhiw0i000rkllczstxmqlm	cmqvhiw0h000okllclzxv5j3e	Solomon	f
cmqvhiw0i000skllc6fa9tujr	cmqvhiw0h000okllclzxv5j3e	Jesus Christ	t
cmqvhk4fe000vkllc45dalunc	cmqvhk4fe000ukllc9mcqkbgi	Three	f
cmqvhk4fe000wkllc65ivgrsk	cmqvhk4fe000ukllc9mcqkbgi	Five	t
cmqvhk4fe000xkllc1ymlo2ry	cmqvhk4fe000ukllc9mcqkbgi	Four	f
cmqvhk4fe000ykllcr1eu08r7	cmqvhk4fe000ukllc9mcqkbgi	Seven	f
cmqvhlhrg0011kllcn25tm8pa	cmqvhlhrg0010kllc9u3w2yo8	Holy Book	f
cmqvhlhrg0012kllcyfg8vax2	cmqvhlhrg0010kllc9u3w2yo8	Five Books	t
cmqvhlhrg0013kllcfgstr6rf	cmqvhlhrg0010kllc9u3w2yo8	Book of Wisdom	f
cmqvhlhrg0014kllcrmziz5mq	cmqvhlhrg0010kllc9u3w2yo8	Prophetic Writing	f
cmqvhvmx90004whyt3s6gsph6	cmqvhvmx90003whyt2uvmtluo	David	f
cmqvhvmx90005whytbvp8xr34	cmqvhvmx90003whyt2uvmtluo	Solomon	f
cmqvhvmx90006whytgdxyktmv	cmqvhvmx90003whyt2uvmtluo	Moses	t
cmqvhvmx90007whyta6qhn6qa	cmqvhvmx90003whyt2uvmtluo	Samuel	f
cmqvhx5hg000awhytuw2rvn15	cmqvhx5hg0009whyt8po33oxo	Deliverance from Egypt	t
cmqvhx5hg000bwhyta8ypysyl	cmqvhx5hg0009whyt8po33oxo	Rebuilding Jerusalem’s wall	f
cmqvhx5hg000cwhyty520esou	cmqvhx5hg0009whyt8po33oxo	Wisdom for daily life	f
cmqvhx5hg000dwhyt4dawd66b	cmqvhx5hg0009whyt8po33oxo	Judgment on Nineveh	f
cmqvhyoey000gwhytoszi8wxw	cmqvhyoey000fwhytk0vfiyyr	Genesis	f
cmqvhyoey000hwhytp9y7lcmp	cmqvhyoey000fwhytk0vfiyyr	Leviticus	f
cmqvhyoey000iwhytxg5xx8o2	cmqvhyoey000fwhytk0vfiyyr	Numbers	t
cmqvhyoey000jwhyt23emlfvy	cmqvhyoey000fwhytk0vfiyyr	Joshua	f
cmqvi0emc000mwhytzps095ut	cmqvi0emc000lwhytmtdt7ybc	Jonah	f
cmqvi0emc000nwhyt5exqcte4	cmqvi0emc000lwhytmtdt7ybc	Habakkuk	t
cmqvi0emc000owhyteqjq2f98	cmqvi0emc000lwhytmtdt7ybc	Malachi 	f
cmqvi0emc000pwhyt6pog6rg9	cmqvi0emc000lwhytmtdt7ybc	Hosea	f
cmqvi1vzh000swhytts6knujl	cmqvi1vzh000rwhyt31ljmneg	Noahic Covenant	f
cmqvi1vzh000twhyth5z1snx2	cmqvi1vzh000rwhyt31ljmneg	Mosaic Covenant	f
cmqvi1vzh000uwhythy2wa8cy	cmqvi1vzh000rwhyt31ljmneg	Davidic Covenant 	f
cmqvi1vzh000vwhytvxt5wiys	cmqvi1vzh000rwhyt31ljmneg	New Covenant	t
cmqviehz5001dwhyto5mf5nxy	cmqviehz5001cwhyt52rdjegh	The creation of the world	f
cmqviehz5001ewhytr9th1jyr	cmqviehz5001cwhyt52rdjegh	The fulfillment of God’s promises in Jesus Christ 	t
cmqviehz5001fwhytn9f3wru4	cmqviehz5001cwhyt52rdjegh	The history of Israel’s kings	f
cmqviehz5001gwhyt0hs52b0i	cmqviehz5001cwhyt52rdjegh	The laws of Moses	f
cmqvifhlf001jwhytb39k7oy2	cmqvifhlf001iwhytqub3cr0w	Three	f
cmqvifhlf001kwhytuv5hy29v	cmqvifhlf001iwhytqub3cr0w	Four	f
cmqvifhlf001lwhytyp9575vp	cmqvifhlf001iwhytqub3cr0w	Five	t
cmqvifhlf001mwhytgayfoc84	cmqvifhlf001iwhytqub3cr0w	Six	f
cmqvigrx8001pwhytzp8ugrdo	cmqvigrx7001owhytrokxzr13	Matthew	t
cmqvigrx8001qwhytb0dz8pji	cmqvigrx7001owhytrokxzr13	Mark	f
cmqvigrx8001rwhyttty3g99h	cmqvigrx7001owhytrokxzr13	Luke	f
cmqvigrx8001swhytxkjvp5nr	cmqvigrx7001owhytrokxzr13	John	f
cmqvii36i001vwhytx067adqh	cmqvii36i001uwhyt35jidyes	Paul	f
cmqvii36i001wwhytoksx2isg	cmqvii36i001uwhyt35jidyes	Peter	f
cmqvii36i001xwhytyd5iudf7	cmqvii36i001uwhyt35jidyes	Luke	t
cmqvii36i001ywhytk9nsna3m	cmqvii36i001uwhyt35jidyes	John Mark	f
cmqvikmgq0021whytg7reubzh	cmqvikmgq0020whytf6sc5vih	The creation of the world	f
cmqvikmgq0022whytez49brne	cmqvikmgq0020whytf6sc5vih	The birth and mission of the Church	t
cmqvikmgq0023whytv9rlfxqi	cmqvikmgq0020whytf6sc5vih	The fall of Jerusalem	f
cmqvikmgq0024whytqawi3sjh	cmqvikmgq0020whytf6sc5vih	The life of Moses	f
cmqvimrj50027whytvq06ue5f	cmqvimrj50026whytrzc9yqd0	 Romans	t
cmqvimrj50028whytwisbx48o	cmqvimrj50026whytrzc9yqd0	Philemon 	f
cmqvimrj50029whytf2p6fm4v	cmqvimrj50026whytrzc9yqd0	Titus	f
cmqvimrj5002awhytr4ol3rug	cmqvimrj50026whytrzc9yqd0	Colossians	f
cmqvipok6002dwhytamt0ynki	cmqvipok6002cwhytp7ko8gml	Temple worship	f
cmqvipok6002ewhytmu39a6o4	cmqvipok6002cwhytp7ko8gml	Justification by faith and freedom in Christ	t
cmqvipok6002fwhytf8kv1gpg	cmqvipok6002cwhytp7ko8gml	The rebuilding of Jerusalem	f
cmqvipok6002gwhytkdi2vk2v	cmqvipok6002cwhytp7ko8gml	The final judgment	f
cmqviqua7002jwhytecwr2ibu	cmqviqua7002iwhytix57rhvi	James	t
cmqviqua7002kwhyt8eva4wb2	cmqviqua7002iwhytix57rhvi	Hebrews	f
cmqviqua7002lwhytnsq8j529	cmqviqua7002iwhytix57rhvi	Jude	f
cmqviqua7002mwhytflpjvs4u	cmqviqua7002iwhytix57rhvi	2 John	f
cmqvitzb7002pwhytj42utzs3	cmqvitzb7002owhytqunvojty	Christ is victorious, evil will be judged, and God will dwell with His people forever B. Israel’s wilderness journey	t
cmqvitzb7002qwhyt7i550eg9	cmqvitzb7002owhytqunvojty	Israel’s wilderness journey	f
cmqvitzb7002rwhytr4bxeoez	cmqvitzb7002owhytqunvojty	The life of King David	f
cmqvitzb7002swhytxeqgiwjj	cmqvitzb7002owhytqunvojty	The giving of the Law	f
cmqviw286002vwhyt8c9f3qwt	cmqviw286002uwhytb90rd1ed	Moses	f
cmqviw286002wwhytphrgkmfe	cmqviw286002uwhytb90rd1ed	Elijah	f
cmqviw286002xwhyt2zegrytk	cmqviw286002uwhytb90rd1ed	David	f
cmqviw286002ywhyt6dox8xgn	cmqviw286002uwhytb90rd1ed	Jesus Christ	t
cmqw3sgph000hu8gj9iycxhb6	cmqw3sgph000gu8gj4eq996bf	Audience’s Inducted Meaning	f
cmqw3sgph000iu8gjpw3m1j2l	cmqw3sgph000gu8gj4eq996bf	Author’s Intended Meaning	t
cmqw3sgph000ju8gjfwpprv9d	cmqw3sgph000gu8gj4eq996bf	Ancient-Inspired Message	f
cmqw3sgph000ku8gj3yyegb12	cmqw3sgph000gu8gj4eq996bf	Accurate Inner Meaning	f
cmqw3ts09000nu8gjrmobvvsb	cmqw3ts09000mu8gj8mvdrxxw	To find personal opinions	f
cmqw3ts09000ou8gjmr0vpj7o	cmqw3ts09000mu8gj8mvdrxxw	To memorize all passages 	f
cmqw3ts09000pu8gjrmpod982	cmqw3ts09000mu8gj8mvdrxxw	To discover the original intended meaning of the text	t
cmqw3ts09000qu8gjll4mqf20	cmqw3ts09000mu8gj8mvdrxxw	To avoid reading difficult books	f
cmqw3v39g000tu8gj322nqah1	cmqw3v39g000su8gjwbxvpnum	Only the verse before and after 	t
cmqw3v39g000uu8gj2w1r62qe	cmqw3v39g000su8gjwbxvpnum	Only grammar and punctuation	f
cmqw3v39g000vu8gjhusapeup	cmqw3v39g000su8gjwbxvpnum	Only modern application	f
cmqw3v39g000wu8gj44klbwpl	cmqw3v39g000su8gjwbxvpnum	Original author, recipients, historical setting, and purpose 	f
cmqw3wh3b000zu8gj5gc2fz3d	cmqw3wh3b000yu8gjp30mocsj	Genesis	f
cmqw3wh3b0010u8gjyxrm1o97	cmqw3wh3b000yu8gjp30mocsj	Psalms 	f
cmqw3wh3b0011u8gj1nsrzajj	cmqw3wh3b000yu8gjp30mocsj	Revelation	t
cmqw3wh3b0012u8gj0nf2ud8h	cmqw3wh3b000yu8gjp30mocsj	Romans	f
cmqw3xkql0015u8gjy2wn1uf7	cmqw3xkql0014u8gj32mgqghv	A story about events	t
cmqw3xkql0016u8gj4u2y0568	cmqw3xkql0014u8gj32mgqghv	A list of commands 	f
cmqw3xkql0017u8gj0bbumov8	cmqw3xkql0014u8gj32mgqghv	A song of praise 	f
cmqw3xkql0018u8gjxvsgzxp3	cmqw3xkql0014u8gj32mgqghv	A prophetic warning	f
cmqw459u2001bu8gjc1uv42px	cmqw459u2001au8gj60uc2688	Law 	f
cmqw459u2001cu8gjm7flayue	cmqw459u2001au8gj60uc2688	Narrative	t
cmqw459u2001du8gjvt7mdk9p	cmqw459u2001au8gj60uc2688	Poetry	f
cmqw459u2001eu8gj4b3cfxpv	cmqw459u2001au8gj60uc2688	Epistle	f
cmqw468mg001hu8gjd8dtg59u	cmqw468mg001gu8gj4ist49yc	Moses	f
cmqw468mg001iu8gjte4cug72	cmqw468mg001gu8gj4ist49yc	David	f
cmqw468mg001ju8gjo3aupl3u	cmqw468mg001gu8gj4ist49yc	Paul 	f
cmqw468mg001ku8gjvcbem0mg	cmqw468mg001gu8gj4ist49yc	God	t
cmqw47ai4001nu8gjn9nq77ra	cmqw47ai4001mu8gj0c0e80eh	Pattern of sounds 	f
cmqw47ai4001ou8gj904zdbvu	cmqw47ai4001mu8gj0c0e80eh	Pattern of numbers 	f
cmqw47ai4001pu8gjuaqndg2u	cmqw47ai4001mu8gj0c0e80eh	Pattern of thoughts	t
cmqw47ai4001qu8gjk15uqngb	cmqw47ai4001mu8gj0c0e80eh	Pattern of dates	f
cmqw48iey001tu8gjhsufeshc	cmqw48iey001su8gjfy26w0zg	Antithetic parallelism	f
cmqw48iey001uu8gjxyd8sv4s	cmqw48iey001su8gjfy26w0zg	Synthetic parallelism	f
cmqw48iey001vu8gjocyooikt	cmqw48iey001su8gjfy26w0zg	Synonymous parallelism 	t
cmqw48iey001wu8gj9qgyfd4x	cmqw48iey001su8gjfy26w0zg	Historical parallelism	f
cmqw4a765001zu8gjwnkbf8ce	cmqw4a765001yu8gj4muj4nu1	A direct law from Moses	f
cmqw4a7650020u8gjvk4hzzwb	cmqw4a765001yu8gj4muj4nu1	A story told to convey moral or spiritual truth	t
cmqw4a7650021u8gjwidokxbx	cmqw4a765001yu8gj4muj4nu1	A historical record of kings	f
cmqw4a7650022u8gjri1hs7uj	cmqw4a765001yu8gj4muj4nu1	A poetic song of worship	f
cmqw4x0hy002mu8gjngxkno0c	cmqw4x0hy002lu8gjp7shxgg7	Only to increase human knowledge	f
cmr0mijpp002ru02150g78y8k	cmr0mijpp002qu021ljqkyre8	The Crucifixion	f
cmqw4x0hz002nu8gjo4wq5n0m	cmqw4x0hy002lu8gjp7shxgg7	To help God’s people know, trust, worship, obey, serve, and witness	t
cmqw4x0hz002ou8gj4frvk8pv	cmqw4x0hy002lu8gjp7shxgg7	To provide history only	f
cmqw4x0hz002pu8gjp5ahv4pg	cmqw4x0hy002lu8gjp7shxgg7	To replace church leadership	f
cmqw4xriu002su8gjqdtoqsb5	cmqw4xriu002ru8gjwijudq9m	Hearers only	f
cmqw4xriu002tu8gjycu0aw65	cmqw4xriu002ru8gjwijudq9m	Readers only	f
cmqw4xriu002uu8gjfd4p78pk	cmqw4xriu002ru8gjwijudq9m	Doers of the Word 	t
cmqw4xriu002vu8gjb5qna3iq	cmqw4xriu002ru8gjwijudq9m	Teachers only	f
cmr0mijpp002su021slbsx3fa	cmr0mijpp002qu021ljqkyre8	The Resurrection	f
cmr0mijpp002tu0219fzhpxe1	cmr0mijpp002qu021ljqkyre8	Pentecost	t
cmr0mijpp002uu021jx3709lk	cmr0mijpp002qu021ljqkyre8	The Council of Nicaea	f
cmr0mijpp002wu0214t8ym9s2	cmr0mijpp002vu0214lyfja8k	Paul	f
cmqw4yvww0032u8gjtbj3ie7r	cmqw4ypdn002xu8gjw2eetu4r	Memorizing verses without action	f
cmqw4yvww0033u8gjrlxcsxa2	cmqw4ypdn002xu8gjw2eetu4r	Bringing the truth of Scripture into real life	t
cmqw4yvww0034u8gjqqgy42y8	cmqw4ypdn002xu8gjw2eetu4r	Reading only the New Testament 	f
cmqw4yvww0035u8gjky2050b0	cmqw4ypdn002xu8gjw2eetu4r	Studying without obedience	f
cmqw5012b0038u8gjcsq2er4o	cmqw5012b0037u8gj4yu1yjio	Self-improvement 	t
cmqw5012b0039u8gjca8c4txa	cmqw5012b0037u8gj4yu1yjio	Winning arguments	f
cmqw5012b003au8gjeyijrqas	cmqw5012b0037u8gj4yu1yjio	Knowing and responding to God	f
cmqw5012b003bu8gj8qjkkrsj	cmqw5012b0037u8gj4yu1yjio	Becoming famous in ministry	f
cmqw50zy9003eu8gj6aou8m6p	cmqw50zy9003du8gj1aiuuvbk	Church programs	f
cmqw50zy9003fu8gjxi4722rn	cmqw50zy9003du8gj1aiuuvbk	Financial plans	f
cmqw50zy9003gu8gjfwoejg3s	cmqw50zy9003du8gj1aiuuvbk	Thoughts and intentions of the heart	t
cmqw50zy9003hu8gj0uw8lbfm	cmqw50zy9003du8gj1aiuuvbk	Historical dates	f
cmqw51vih003ku8gjwtqu36gz	cmqw51vih003ju8gj85r7ltgq	Culture	f
cmqw51vih003lu8gj1m93eop9	cmqw51vih003ju8gj85r7ltgq	Personal opinion	f
cmqw51vih003mu8gj949ysh06	cmqw51vih003ju8gj85r7ltgq	Christ and the gospel	t
cmqw51vih003nu8gjjlzgheys	cmqw51vih003ju8gj85r7ltgq	Human success	f
cmqw533vp003qu8gj1cmopxdx	cmqw533vp003pu8gj28t7mka4	Entertainment 	f
cmqw533vp003ru8gj8b4xlljk	cmqw533vp003pu8gj28t7mka4	Training in righteousness	t
cmqw533vp003su8gjhxh95ox7	cmqw533vp003pu8gj28t7mka4	Political power	f
cmqw533vp003tu8gjpbnavue6	cmqw533vp003pu8gj28t7mka4	Public speaking	f
cmqw544a1003wu8gj464lesqo	cmqw544a1003vu8gj4u9f2xww	Correct interpretation	t
cmqw544a1003xu8gjefvzlbza	cmqw544a1003vu8gj4u9f2xww	Personal imagination	f
cmqw544a1003yu8gje4jbuima	cmqw544a1003vu8gj4u9f2xww	Emotional reaction only	f
cmqw544a1003zu8gjoyvc11sj	cmqw544a1003vu8gj4u9f2xww	Popular tradition	f
cmqw555zd0042u8gje2r2qinv	cmqw555zd0041u8gjkebnre0x	Entertainment only	f
cmqw555zd0043u8gjhbukkqxx	cmqw555zd0041u8gjkebnre0x	Use of time	t
cmqw555zd0044u8gjr235n3gz	cmqw555zd0041u8gjkebnre0x	Fashion 	f
cmqw555zd0045u8gj8p22co1e	cmqw555zd0041u8gjkebnre0x	Sports	f
cmqw57jql0048u8gjuw84o3l4	cmqw57jql0047u8gjnudlvjea	Above Scripture	f
cmqw57jql0049u8gjwarzhe06	cmqw57jql0047u8gjnudlvjea	Free to ignore Scripture	f
cmqw57jql004au8gjca0sz8f3	cmqw57jql0047u8gjnudlvjea	Required only to inspire people	f
cmqw57jql004bu8gjgszhathk	cmqw57jql0047u8gjnudlvjea	Under Scripture	t
cmr0mijpp002xu02129x39crv	cmr0mijpp002vu0214lyfja8k	Peter	f
cmr0mijpp002yu0219mzruz8d	cmr0mijpp002vu0214lyfja8k	Stephen	t
cmr0mijpp002zu021gcmo00qh	cmr0mijpp002vu0214lyfja8k	James	f
cmr0mijpp0031u021jd3ng170	cmr0mijpp0030u021lvykhdno	Nero	f
cmr0mijpp0032u021iynykufl	cmr0mijpp0030u021lvykhdno	Constantine	t
cmr0mijpp0033u0210abo4jvi	cmr0mijpp0030u021lvykhdno	Diocletian	f
cmr0mijpp0034u021ywwe6gj6	cmr0mijpp0030u021lvykhdno	Augustus	f
cmr0mijpp0036u0217f754bc8	cmr0mijpp0035u021bg7rmak2	Council of Trent	f
cmr0mijpp0037u0211wp6uvk4	cmr0mijpp0035u021bg7rmak2	Council of Chalcedon	f
cmr0mijpp0038u021wvbgc93y	cmr0mijpp0035u021bg7rmak2	Council of Nicaea	t
cmr0mijpp0039u021qrirg5x0	cmr0mijpp0035u021bg7rmak2	Council of Jerusalem	f
cmr0mijpp003bu021o71vro1n	cmr0mijpp003au021sk07wvcr	Augustine	f
cmr0mijpp003cu021plmdei2r	cmr0mijpp003au021sk07wvcr	Jerome	f
cmr0mijpp003du021gqsvcz8v	cmr0mijpp003au021sk07wvcr	Benedict of Nursia	t
cmr0mijpp003eu021bo7qlbll	cmr0mijpp003au021sk07wvcr	Athanasius	f
cmr0mijpq003pu021sdb0dvx4	cmr0mijpq003ou021850j4z41	John Calvin	f
cmr0mijpq003qu021scnhdjkf	cmr0mijpq003ou021850j4z41	Martin Luther	t
cmr0mijpq003ru021jgvwfyaa	cmr0mijpq003ou021850j4z41	John Wesley	f
cmr0mijpq003su021glup3xu7	cmr0mijpq003ou021850j4z41	Ulrich Zwingli	f
cmr0mijpq003uu02165j7qkkg	cmr0mijpq003tu02190qg1qcd	Augsburg Confession	f
cmr0mijpq003vu021xgj0x005	cmr0mijpq003tu02190qg1qcd	Institutes of the Christian Religion	f
cmr0mijpq003wu021jm8udf4z	cmr0mijpq003tu02190qg1qcd	Ninety-Five Theses	t
cmr0mijpq003xu021fmi25fpk	cmr0mijpq003tu02190qg1qcd	Westminster Confession	f
cmr0mijpr003zu021z20e9nxo	cmr0mijpr003yu021e85c40v3	Sola Scriptura	f
cmr0mijpr0040u02133j1rdub	cmr0mijpr003yu021e85c40v3	Sola Gratia	f
cmr0mijpr0041u021spm3bsg3	cmr0mijpr003yu021e85c40v3	Solus Christus	f
cmr0mijpr0042u02119mt8s4h	cmr0mijpr003yu021e85c40v3	Sola Fide	t
cmr0mijpr0044u021j2utztue	cmr0mijpr0043u021tddwddh8	John Calvin	t
cmr0mijpr0045u0214sz9lr52	cmr0mijpr0043u021tddwddh8	Martin Luther	f
cmr0mijpr0046u021v37lc3in	cmr0mijpr0043u021tddwddh8	John Knox	f
cmr0mijpr0047u021r9vdwdjx	cmr0mijpr0043u021tddwddh8	John Wesley	f
cmr0mijpr0049u021b3i4fz7b	cmr0mijpr0048u021ot0xjvmp	Renaissance	f
cmr0mijpr004au0214210nvn3	cmr0mijpr0048u021ot0xjvmp	Crusades	f
cmr0mijpr004bu021ftzgscri	cmr0mijpr0048u021ot0xjvmp	Missionary Movement	t
cmr0mijpr004cu021w3962jun	cmr0mijpr0048u021ot0xjvmp	Monastic Movement	f
cmqz11bmv000t74imw55vydtm	cmqz11bmu000s74imuzmkh5dt	Answer 1	f
cmqz11bmv000u74im1a9oicwc	cmqz11bmu000s74imuzmkh5dt	Answer 2	t
cmqz11bmv000v74im667wj561	cmqz11bmu000s74imuzmkh5dt	Answer 3	f
cmqz11ys5000y74imp1a6dv4q	cmqz11ys5000x74img075z3nm	Answer a	f
cmqz11ys5000z74imid4e5h73	cmqz11ys5000x74img075z3nm	Answer b	f
cmqz11ys5001074ime1zujyb3	cmqz11ys5000x74img075z3nm	Answer c	t
cmr0lcfdp000fu021vczewrfv	cmr0lcfdp000eu021cw7kcqpf	Romans 12:1–2	f
cmr0lcfdp000gu021uz30zyqq	cmr0lcfdp000eu021cw7kcqpf	1 Timothy 3:1–7	t
cmr0lcfdp000hu02157r8ridc	cmr0lcfdp000eu021cw7kcqpf	Psalm 23	f
cmr0lcfdp000iu0215brrpa7m	cmr0lcfdp000eu021cw7kcqpf	Revelation 21	f
cmr0lcfdp000ku021d2rr8d9z	cmr0lcfdp000ju021h8odhl18	Vine	f
cmr0lcfdp000lu021zu3p43j1	cmr0lcfdp000ju021h8odhl18	Bread of Life	f
cmr0lcfdp000mu021zcc9dksj	cmr0lcfdp000ju021h8odhl18	Good Shepherd	t
cmr0lcfdp000nu021445klhve	cmr0lcfdp000ju021h8odhl18	Living Water	f
cmr0lcfdp000pu021ercbl6cr	cmr0lcfdp000ou021f63x551z	Under compulsion	f
cmr0lcfdp000qu021ktn0tvs6	cmr0lcfdp000ou021f63x551z	Willingly and eagerly	t
cmr0lcfdp000ru021nshn9mb8	cmr0lcfdp000ou021f63x551z	For financial gain	f
cmr0lcfdp000su02169qf2lni	cmr0lcfdp000ou021f63x551z	By force	f
cmr0lcfdp000uu021kdwra0b4	cmr0lcfdp000tu0216fmcmsod	King Saul	f
cmr0lcfdp000vu0219k2jhnba	cmr0lcfdp000tu0216fmcmsod	Jesus Christ	t
cmr0lcfdp000wu0210i6zarm6	cmr0lcfdp000tu0216fmcmsod	Pilate	f
cmr0lcfdp000xu021afx2zdu7	cmr0lcfdp000tu0216fmcmsod	Herod	f
cmr0lcfdp000zu021ywl6ed9e	cmr0lcfdp000yu021s32yqipf	Wealthy	f
cmr0lcfdp0010u0217jpcnoqk	cmr0lcfdp000yu021s32yqipf	Blameless	t
cmr0lcfdp0011u021ga4cr25w	cmr0lcfdp000yu021s32yqipf	Famous	f
cmr0lcfdp0012u021k5up4trb	cmr0lcfdp000yu021s32yqipf	Powerful	f
cmr0lcfdq001du021k8hueoc6	cmr0lcfdq001cu021967olkej	Matthew 28:18–20	t
cmr0lcfdq001eu021vgsibr8d	cmr0lcfdq001cu021967olkej	Psalm 23	f
cmr0lcfdq001fu0213k7ud2lw	cmr0lcfdq001cu021967olkej	Genesis 1	f
cmr0lcfdq001gu021pafghca3	cmr0lcfdq001cu021967olkej	Revelation 22	f
cmr0lcfdq001iu021ioxcoevg	cmr0lcfdq001hu021r4s1n14t	Build kingdoms	f
cmr0lcfdq001ju021ya9jbe8e	cmr0lcfdq001hu021r4s1n14t	Equip the saints for ministry	t
cmr0lcfdq001ku021qgjaw7sc	cmr0lcfdq001hu021r4s1n14t	Rule nations	f
cmr0lcfdq001lu021xe2b6ko2	cmr0lcfdq001hu021r4s1n14t	Gain wealth	f
cmr0lcfdq001nu021p54ukwro	cmr0lcfdq001mu021yudsxk5a	Ignore false teachers	f
cmr0lcfdq001ou021t4hlsthe	cmr0lcfdq001mu021yudsxk5a	Shepherd the church of God	t
cmr0lcfdq001pu0219og7cnhr	cmr0lcfdq001mu021yudsxk5a	Build temples	f
cmr0lcfdq001qu021u3lwueqi	cmr0lcfdq001mu021yudsxk5a	Seek political power	f
cmr0lcfdq001su021h1dve9n7	cmr0lcfdq001ru021691qu1qb	Pride	f
cmr0lcfdq001tu021lh10yxp5	cmr0lcfdq001ru021691qu1qb	Humility	t
cmr0lcfdq001uu021esy7adxs	cmr0lcfdq001ru021691qu1qb	Ambition	f
cmr0lcfdq001vu0211k7ipdwg	cmr0lcfdq001ru021691qu1qb	Competition	f
cmr0lcfdq001xu021soji43id	cmr0lcfdq001wu0212kkiiaxu	Authority	f
cmr0lcfdq001yu021u8axn27z	cmr0lcfdq001wu0212kkiiaxu	Wealth	f
cmr0lcfdq001zu021628iu5fy	cmr0lcfdq001wu0212kkiiaxu	Service	t
cmr0lcfdq0020u021vj5uye3a	cmr0lcfdq001wu0212kkiiaxu	Popularity	f
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Assignment" (id, "lessonId", title, description, "dueDate", "maxScore", "attachmentUrl", "rubricId") FROM stdin;
cmqm80ohd000e676p6czu0aux	cmqm80ohb000c676pmvmgotrk	Historical Reflection Essay (700–1,000 words)	"How did the witness and perseverance of the early Christians contribute to the growth and preservation of the Church?"	2026-06-21 03:00:00	100	\N	\N
cmqm88xou000r676pqmmgppo8	cmqm88xop000p676peegc2hlt	Church History Timeline Project (1,000–1,500 words)	Create a timeline highlighting significant events in church history and write a reflection explaining how these events continue to influence Christianity and ministry today.	2026-06-21 09:00:00	25	\N	\N
cmqmab2yh001bfjtathv2kork	cmqmab2yd0019fjtan1gr22cr	Reflection Paper (700–1,000 words)	"Describe the biblical qualifications and responsibilities of a pastor and explain how Jesus Christ serves as the perfect model of servant leadership."	2026-06-21 12:00:00	25	\N	\N
cmqmaunv7002lfjtayb3y966e	cmqmaunv0002jfjtabouyu5z4	Ministry Development Project (1,000–1,500 words)	Prepare a ministry plan for a local church including:\n\nVision Statement\nMission Statement\nLeadership Structure\nDiscipleship Strategy\nPastoral Care Plan\nEvangelism and Outreach Goals	2026-06-21 16:30:00	25	\N	\N
cmqw5g1qp004ku8gjbqs1bs9i	cmqw5g1qd004iu8gj9x3zd76l	Reflection Paper	Reflect on what you have learned from all five modules of Understanding the Bible. How has your understanding of the Bible as God’s inspired Word, the message of the Old and New Testaments, the importance of proper interpretation, and the need for faithful application changed the way you read, trust, obey, and teach Scripture in Christian life, ministry, and leadership?	\N	100	\N	\N
cmqz0ywng000g74ime4re7ant	cmqz0ywnd000e74imbvn7t41k	Course 1 Assignment	Complete in 2 days	\N	100	\N	\N
cmqz0zkce000l74imatlpoedf	cmqz0zkcc000j74img404edn1	Course 2 Assignment	Finish in 1 week	\N	100	\N	\N
cmr0lcfdo000au0216lzowdyx	cmr0lcfdo0008u021echfpetp	Reflection Paper (700–1,000 words)	"Describe the biblical qualifications and responsibilities of a pastor and explain how Jesus Christ serves as the perfect model of servant leadership."	2026-06-21 12:00:00	25	\N	\N
cmr0lcfdp0017u021ougupx9z	cmr0lcfdp0015u021jwkewuvj	Ministry Development Project (1,000–1,500 words)	Prepare a ministry plan for a local church including:\n\nVision Statement\nMission Statement\nLeadership Structure\nDiscipleship Strategy\nPastoral Care Plan\nEvangelism and Outreach Goals	2026-06-21 16:30:00	25	\N	\N
cmr0mijpp002mu021y986ajsi	cmr0mijpp002ku0212m81u0ei	Historical Reflection Essay (700–1,000 words)	"How did the witness and perseverance of the early Christians contribute to the growth and preservation of the Church?"	2026-06-21 03:00:00	100	\N	\N
cmr0mijpq003iu02101r8gytf	cmr0mijpq003gu021wg5oq21e	Church History Timeline Project (1,000–1,500 words)	Create a timeline highlighting significant events in church history and write a reflection explaining how these events continue to influence Christianity and ministry today.	2026-06-21 09:00:00	25	\N	\N
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

COPY public."BlogPost" (id, title, slug, excerpt, content, "coverImage", "coverKey", "authorId", "isPublished", "readingTime", "createdAt", "updatedAt", "customAuthor") FROM stdin;
cmqku2zfu007l3u1qoqezuhts	Obedience to the Will of God — The Garrs	obedience-will-of-god-the-garrs	Alfred and Lillian Garr were model missionaries who obeyed God's will to bring the Pentecostal message to India in 1906.	<p>The story of the Garrs is one of absolute obedience. Leaving their comforts behind, they traveled to Calcutta and established early assemblies, demonstrating dynamic spiritual leadership.</p>	\N	\N	cmqku2zbu00013u1qbthq3afd	t	8	2026-06-19 11:16:42.091	2026-06-19 11:16:42.091	\N
cmqku2zft007h3u1qbu9v4vdu	Arulappan: A Pioneer of Indigenous Leadership Training in India	arulappan-pioneer-indigenous-leadership	John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India.	<p>John Christian Arulappan represents a powerful movement in early indigenous missions. His dedication to raises local leaders without relying on Western patterns paved the way for modern training ministries in rural India.</p>	\N	\N	cmqku2zbu00013u1qbthq3afd	t	6	2026-06-19 11:16:42.089	2026-06-19 11:16:42.089	\N
cmqku2zfu007j3u1qtf384kx1	"They Will Not Go, I Must" — The Legacy of Mary Chapman	legacy-of-mary-chapman	Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India.	<p>Mary Chapman arrived in India at an age when most people prepare to retire. Her courage to establish ministries and serve rural populations stands as a monuments of faith and leadership.</p>	\N	\N	cmqku2zbu00013u1qbthq3afd	t	7	2026-06-19 11:16:42.09	2026-06-19 11:16:42.09	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Category" (id, name, slug, icon, "order", "parentId", "createdAt") FROM stdin;
cmqku2zc000033u1q4jxxz6rm	Biblical Studies	biblical-studies	book-open	0	\N	2026-06-19 11:16:41.952
cmqku2zc200043u1qepizf3ax	Theology	theology	flame	0	\N	2026-06-19 11:16:41.955
cmqku2zc400053u1q598m2y8t	Ministry & Leadership	ministry-leadership	users	0	\N	2026-06-19 11:16:41.956
cmqku2zc500063u1qa0r9egdz	Church History	church-history	building-church	0	\N	2026-06-19 11:16:41.958
cmqku2zc600073u1q20sr90j1	Spiritual Formation	spiritual-formation	heart	0	\N	2026-06-19 11:16:41.959
\.


--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Certificate" (id, "studentId", "courseId", "issuedAt", "uniqueCode", "downloadUrl", "templateId", "certificateNumber", "programId", type) FROM stdin;
cmqqodph30002hgfe6hp2ctdf	cmqp6pnjo000010tomoljdyc4	\N	2026-06-23 13:23:41.752	cmqqodph30003hgfexjf2ckiq	\N	\N	CA/2606/50162	cmqdmxali00009bd9nmskius7	PROGRAM
\.


--
-- Data for Name: CertificateTemplate; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."CertificateTemplate" (id, name, "htmlTemplate", "isDefault", "logoUrl", "signatorySignatureUrl", "borderStyle", "createdAt", type) FROM stdin;
cmr0s39sf0000yvzujmqfjrwn	Default Course Certificate	<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style>\n  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');\n\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n\n  body {\n    width: 297mm; height: 210mm;\n    background: #0C1527;\n    font-family: 'Inter', sans-serif;\n    display: flex; align-items: center; justify-content: center;\n  }\n\n  .cert-frame { width: 289mm; height: 202mm; position: relative; overflow: hidden; }\n  .border-outer { position: absolute; inset: 0; background: #0C1527; }\n\n  /* Gold corner accents */\n  .corner { position: absolute; width: 80px; height: 80px; }\n  .corner-tl { top: 8mm; left: 8mm; border-top: 3px solid #C9973A; border-left: 3px solid #C9973A; }\n  .corner-tr { top: 8mm; right: 8mm; border-top: 3px solid #C9973A; border-right: 3px solid #C9973A; }\n  .corner-bl { bottom: 8mm; left: 8mm; border-bottom: 3px solid #C9973A; border-left: 3px solid #C9973A; }\n  .corner-br { bottom: 8mm; right: 8mm; border-bottom: 3px solid #C9973A; border-right: 3px solid #C9973A; }\n\n  .edge-deco { position: absolute; background: #C9973A; }\n  .edge-top    { top: 8mm;    left: 90px; right: 90px; height: 1.5px; }\n  .edge-bottom { bottom: 8mm; left: 90px; right: 90px; height: 1.5px; }\n  .edge-left   { left: 8mm;   top: 90px;  bottom: 90px; width: 1.5px; }\n  .edge-right  { right: 8mm;  top: 90px;  bottom: 90px; width: 1.5px; }\n\n  .gold-bar { position: absolute; background: linear-gradient(to right, #C9973A, #E8C57A, #C9973A); }\n  .gold-bar-top    { top: 0; left: 0; right: 0; height: 4px; }\n  .gold-bar-bottom { bottom: 0; left: 0; right: 0; height: 4px; }\n\n  /* Cream inner content area */\n  .cert-inner {\n    position: absolute;\n    top: 14mm; left: 14mm; right: 14mm; bottom: 14mm;\n    background: #FDFAF4;\n    display: flex; flex-direction: column;\n    align-items: center; justify-content: center;\n    padding: 22px 44px;\n    gap: 0;\n  }\n\n  .inner-border {\n    position: absolute;\n    top: 8px; left: 8px; right: 8px; bottom: 8px;\n    border: 1px solid #C9973A;\n    pointer-events: none;\n    opacity: 0.3;\n  }\n  .inner-corner { position: absolute; width: 20px; height: 20px; border: 1.5px solid #C9973A; }\n  .inner-corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }\n  .inner-corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }\n  .inner-corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }\n  .inner-corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }\n\n  /* ── CWAY ACADEMY title matches the uploaded branding image ── */\n  .org-title {\n    font-family: 'Cinzel', serif;\n    font-size: 36px;\n    font-weight: 700;\n    letter-spacing: 0.08em;\n    margin-bottom: 2px;\n  }\n  .org-title .cway   { color: #1A261D; }\n  .org-title .academy { color: #C9973A; letter-spacing: 0.18em; font-weight: 400; }\n\n  .org-subtitle {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 9px; letter-spacing: 0.28em;\n    text-transform: uppercase; color: #8A9E8C;\n    margin-bottom: 14px;\n  }\n\n  /* ── CERTIFICATE / PROGRAM title ── */\n  .cert-title {\n    font-family: 'Cinzel', serif;\n    font-size: 34px; font-weight: 700;\n    color: #1A261D;\n    letter-spacing: 0.08em;\n    margin-bottom: 0px;\n  }\n\n  .cert-subtitle {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 10px; letter-spacing: 0.28em;\n    text-transform: uppercase;\n    color: #C9973A;\n    margin-bottom: 16px;\n    display: flex; align-items: center; gap: 10px;\n  }\n  .cert-subtitle::before, .cert-subtitle::after {\n    content: ''; width: 55px; height: 1.5px; background: #C9973A;\n  }\n\n  .presented-to {\n    font-family: 'Playfair Display', serif;\n    font-size: 16px; font-style: italic;\n    color: #666; margin-bottom: 8px;\n  }\n\n  .student-name {\n    font-family: 'Great Vibes', cursive;\n    font-size: 56px; font-weight: 400;\n    color: #C9973A; letter-spacing: 0.02em;\n    border-bottom: 2px solid #C9973A;\n    padding-bottom: 4px; margin-bottom: 16px;\n    min-width: 380px; text-align: center;\n  }\n\n  .cert-body {\n    font-family: 'Playfair Display', serif;\n    font-size: 15px; font-style: italic;\n    color: #444; text-align: center;\n    line-height: 1.6; max-width: 560px;\n    margin-bottom: 0px;\n  }\n\n  .top-section {\n    flex-grow: 1; display: flex; flex-direction: column;\n    justify-content: center; align-items: center; width: 100%;\n  }\n\n  /* ── Bottom Section (pushed to bottom) ── */\n  .bottom-section {\n    width: 100%;\n  }\n\n  /* ── Signatories ── */\n  .signatories {\n    width: 100%; display: flex;\n    justify-content: space-between;\n    align-items: flex-start;\n    padding: 0 16px; margin-top: 0px;\n  }\n  .signatory { text-align: center; min-width: 170px; }\n  .sig-line { width: 150px; height: 1px; background: #333; margin: 0 auto 6px; }\n  .sig-name {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 12px; color: #0C1527;\n    font-weight: 700; margin-bottom: 2px;\n  }\n  .sig-title {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 9px; color: #C9973A; letter-spacing: 0.03em;\n  }\n\n  /* ── Seal ── */\n  .seal-section {\n    text-align: center; display: flex; flex-direction: column;\n    align-items: center; margin-top: 14px;\n  }\n  .seal {\n    width: 52px; height: 52px; border-radius: 50%;\n    border: 2px solid #0C1527;\n    display: flex; align-items: center; justify-content: center;\n    background: white; margin-bottom: 8px;\n  }\n  .seal img { width: 38px; height: 38px; object-fit: contain; }\n  .cert-number {\n    font-family: 'Montserrat', sans-serif; font-size: 10px; color: #555;\n    letter-spacing: 0.03em; margin-bottom: 2px;\n  }\n  .reg-info {\n    font-family: 'Inter', sans-serif; font-size: 8px; color: #888;\n    letter-spacing: 0.02em;\n  }\n</style>\n</head>\n<body>\n  <div class="cert-frame">\n    <div class="border-outer"></div>\n    <div class="gold-bar gold-bar-top"></div>\n    <div class="gold-bar gold-bar-bottom"></div>\n    <div class="corner corner-tl"></div>\n    <div class="corner corner-tr"></div>\n    <div class="corner corner-bl"></div>\n    <div class="corner corner-br"></div>\n    <div class="edge-deco edge-top"></div>\n    <div class="edge-deco edge-bottom"></div>\n    <div class="edge-deco edge-left"></div>\n    <div class="edge-deco edge-right"></div>\n\n    <div class="cert-inner">\n      <div class="inner-border"></div>\n      <div class="inner-corner inner-corner-tl"></div>\n      <div class="inner-corner inner-corner-tr"></div>\n      <div class="inner-corner inner-corner-bl"></div>\n      <div class="inner-corner inner-corner-br"></div>\n\n      \n      <div class="top-section">\n        <!-- HEADER -->\n        <div class="org-title"><span class="cway">CWAY</span> <span class="academy">ACADEMY</span></div>\n        <div class="org-subtitle">Coach, Challenge, and Commission</div>\n\n        <div class="cert-title">CERTIFICATE</div>\n        <div class="cert-subtitle">OF COMPLETION</div>\n\n        <div class="presented-to">presented to:</div>\n        <div class="student-name">{{studentName}}</div>\n\n        <div class="cert-body">\n          for successfully completing the course titled\n          "{{courseName}}," conducted by CWAY Academy.\n          Completed on {{completionDate}}.\n        </div>\n      </div>\n\n      <div class="bottom-section">\n        <!-- SIGNATORIES -->\n        <div class="signatories">\n          <div class="signatory">\n            <div class="sig-line"></div>\n            <div class="sig-name">Dr. Reeju Tharakan</div>\n            <div class="sig-title">Executive Director</div>\n          </div>\n          <div class="signatory">\n            <div class="sig-line"></div>\n            <div class="sig-name">Pr. Robin Ninan</div>\n            <div class="sig-title">Director of Academics</div>\n          </div>\n          <div class="signatory">\n            <div class="sig-line"></div>\n            <div class="sig-name">Evg. Finny Philip Varghese</div>\n            <div class="sig-title">Administrative Director</div>\n          </div>\n        </div>\n\n        <!-- SEAL & CERT NUMBER -->\n        <div class="seal-section">\n          <div class="seal">\n            <img src="{{logoUrl}}" alt="Seal">\n          </div>\n          <div class="cert-number">Certificate Number: {{certificateNumber}}</div>\n          <div class="reg-info">a project under CWAY MISSIONS Regn # HLS-4-00219-2023-24</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>	t	https://cwayacademy.netlify.app/logo.png?v=3	\N	\N	2026-06-30 15:05:15.087	COURSE
cmr0s3ago0001yvzuauu4kkvq	Default Program Certificate	<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style>\n  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');\n\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n\n  body {\n    width: 297mm; height: 210mm;\n    background: #0C1527;\n    font-family: 'Inter', sans-serif;\n    display: flex; align-items: center; justify-content: center;\n  }\n\n  .cert-frame { width: 289mm; height: 202mm; position: relative; overflow: hidden; }\n  .border-outer { position: absolute; inset: 0; background: #0C1527; }\n\n  /* Gold corner accents */\n  .corner { position: absolute; width: 80px; height: 80px; }\n  .corner-tl { top: 8mm; left: 8mm; border-top: 3px solid #C9973A; border-left: 3px solid #C9973A; }\n  .corner-tr { top: 8mm; right: 8mm; border-top: 3px solid #C9973A; border-right: 3px solid #C9973A; }\n  .corner-bl { bottom: 8mm; left: 8mm; border-bottom: 3px solid #C9973A; border-left: 3px solid #C9973A; }\n  .corner-br { bottom: 8mm; right: 8mm; border-bottom: 3px solid #C9973A; border-right: 3px solid #C9973A; }\n\n  .edge-deco { position: absolute; background: #C9973A; }\n  .edge-top    { top: 8mm;    left: 90px; right: 90px; height: 1.5px; }\n  .edge-bottom { bottom: 8mm; left: 90px; right: 90px; height: 1.5px; }\n  .edge-left   { left: 8mm;   top: 90px;  bottom: 90px; width: 1.5px; }\n  .edge-right  { right: 8mm;  top: 90px;  bottom: 90px; width: 1.5px; }\n\n  .gold-bar { position: absolute; background: linear-gradient(to right, #C9973A, #E8C57A, #C9973A); }\n  .gold-bar-top    { top: 0; left: 0; right: 0; height: 4px; }\n  .gold-bar-bottom { bottom: 0; left: 0; right: 0; height: 4px; }\n\n  /* Cream inner content area */\n  .cert-inner {\n    position: absolute;\n    top: 14mm; left: 14mm; right: 14mm; bottom: 14mm;\n    background: #FDFAF4;\n    display: flex; flex-direction: column;\n    align-items: center; justify-content: center;\n    padding: 22px 44px;\n    gap: 0;\n  }\n\n  .inner-border {\n    position: absolute;\n    top: 8px; left: 8px; right: 8px; bottom: 8px;\n    border: 1px solid #C9973A;\n    pointer-events: none;\n    opacity: 0.3;\n  }\n  .inner-corner { position: absolute; width: 20px; height: 20px; border: 1.5px solid #C9973A; }\n  .inner-corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }\n  .inner-corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }\n  .inner-corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }\n  .inner-corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }\n\n  /* ── CWAY ACADEMY title matches the uploaded branding image ── */\n  .org-title {\n    font-family: 'Cinzel', serif;\n    font-size: 36px;\n    font-weight: 700;\n    letter-spacing: 0.08em;\n    margin-bottom: 2px;\n  }\n  .org-title .cway   { color: #1A261D; }\n  .org-title .academy { color: #C9973A; letter-spacing: 0.18em; font-weight: 400; }\n\n  .org-subtitle {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 9px; letter-spacing: 0.28em;\n    text-transform: uppercase; color: #8A9E8C;\n    margin-bottom: 14px;\n  }\n\n  /* ── CERTIFICATE / PROGRAM title ── */\n  .cert-title {\n    font-family: 'Cinzel', serif;\n    font-size: 34px; font-weight: 700;\n    color: #1A261D;\n    letter-spacing: 0.08em;\n    margin-bottom: 0px;\n  }\n\n  .cert-subtitle {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 10px; letter-spacing: 0.28em;\n    text-transform: uppercase;\n    color: #C9973A;\n    margin-bottom: 16px;\n    display: flex; align-items: center; gap: 10px;\n  }\n  .cert-subtitle::before, .cert-subtitle::after {\n    content: ''; width: 55px; height: 1.5px; background: #C9973A;\n  }\n\n  .presented-to {\n    font-family: 'Playfair Display', serif;\n    font-size: 16px; font-style: italic;\n    color: #666; margin-bottom: 8px;\n  }\n\n  .student-name {\n    font-family: 'Great Vibes', cursive;\n    font-size: 56px; font-weight: 400;\n    color: #C9973A; letter-spacing: 0.02em;\n    border-bottom: 2px solid #C9973A;\n    padding-bottom: 4px; margin-bottom: 16px;\n    min-width: 380px; text-align: center;\n  }\n\n  .cert-body {\n    font-family: 'Playfair Display', serif;\n    font-size: 15px; font-style: italic;\n    color: #444; text-align: center;\n    line-height: 1.6; max-width: 560px;\n    margin-bottom: 0px;\n  }\n\n  .top-section {\n    flex-grow: 1; display: flex; flex-direction: column;\n    justify-content: center; align-items: center; width: 100%;\n  }\n\n  /* ── Bottom Section (pushed to bottom) ── */\n  .bottom-section {\n    width: 100%;\n  }\n\n  /* ── Signatories ── */\n  .signatories {\n    width: 100%; display: flex;\n    justify-content: space-between;\n    align-items: flex-start;\n    padding: 0 16px; margin-top: 0px;\n  }\n  .signatory { text-align: center; min-width: 170px; }\n  .sig-line { width: 150px; height: 1px; background: #333; margin: 0 auto 6px; }\n  .sig-name {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 12px; color: #0C1527;\n    font-weight: 700; margin-bottom: 2px;\n  }\n  .sig-title {\n    font-family: 'Montserrat', sans-serif;\n    font-size: 9px; color: #C9973A; letter-spacing: 0.03em;\n  }\n\n  /* ── Seal ── */\n  .seal-section {\n    text-align: center; display: flex; flex-direction: column;\n    align-items: center; margin-top: 14px;\n  }\n  .seal {\n    width: 52px; height: 52px; border-radius: 50%;\n    border: 2px solid #0C1527;\n    display: flex; align-items: center; justify-content: center;\n    background: white; margin-bottom: 8px;\n  }\n  .seal img { width: 38px; height: 38px; object-fit: contain; }\n  .cert-number {\n    font-family: 'Montserrat', sans-serif; font-size: 10px; color: #555;\n    letter-spacing: 0.03em; margin-bottom: 2px;\n  }\n  .reg-info {\n    font-family: 'Inter', sans-serif; font-size: 8px; color: #888;\n    letter-spacing: 0.02em;\n  }\n</style>\n</head>\n<body>\n  <div class="cert-frame">\n    <div class="border-outer"></div>\n    <div class="gold-bar gold-bar-top"></div>\n    <div class="gold-bar gold-bar-bottom"></div>\n    <div class="corner corner-tl"></div>\n    <div class="corner corner-tr"></div>\n    <div class="corner corner-bl"></div>\n    <div class="corner corner-br"></div>\n    <div class="edge-deco edge-top"></div>\n    <div class="edge-deco edge-bottom"></div>\n    <div class="edge-deco edge-left"></div>\n    <div class="edge-deco edge-right"></div>\n\n    <div class="cert-inner">\n      <div class="inner-border"></div>\n      <div class="inner-corner inner-corner-tl"></div>\n      <div class="inner-corner inner-corner-tr"></div>\n      <div class="inner-corner inner-corner-bl"></div>\n      <div class="inner-corner inner-corner-br"></div>\n\n      \n      <div class="top-section">\n        <!-- HEADER -->\n        <div class="org-title"><span class="cway">CWAY</span> <span class="academy">ACADEMY</span></div>\n        <div class="org-subtitle">Coach, Challenge, and Commission</div>\n\n        <div class="cert-title">PROGRAM</div>\n        <div class="cert-subtitle">CERTIFICATE OF COMPLETION</div>\n\n        <div class="presented-to">presented to:</div>\n        <div class="student-name">{{studentName}}</div>\n\n        <div class="cert-body">\n          for fulfilling all the requirements of the program\n          titled "{{courseName}}," conducted by CWAY Academy.\n          Completed on {{completionDate}}.\n        </div>\n      </div>\n\n      <div class="bottom-section">\n        <!-- SIGNATORIES -->\n        <div class="signatories">\n          <div class="signatory">\n            <div class="sig-line"></div>\n            <div class="sig-name">Dr. Reeju Tharakan</div>\n            <div class="sig-title">Executive Director</div>\n          </div>\n          <div class="signatory">\n            <div class="sig-line"></div>\n            <div class="sig-name">Pr. Robin Ninan</div>\n            <div class="sig-title">Director of Academics</div>\n          </div>\n          <div class="signatory">\n            <div class="sig-line"></div>\n            <div class="sig-name">Evg. Finny Philip Varghese</div>\n            <div class="sig-title">Administrative Director</div>\n          </div>\n        </div>\n\n        <!-- SEAL & CERT NUMBER -->\n        <div class="seal-section">\n          <div class="seal">\n            <img src="{{logoUrl}}" alt="Seal">\n          </div>\n          <div class="cert-number">Certificate Number: {{certificateNumber}}</div>\n          <div class="reg-info">a project under CWAY MISSIONS Regn # HLS-4-00219-2023-24</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>	t	https://cwayacademy.netlify.app/logo.png?v=3	\N	\N	2026-06-30 15:05:15.961	PROGRAM
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Coupon" (id, code, discount, type, "maxUses", "usedCount", "expiresAt", "courseId", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Course" (id, title, slug, subtitle, description, thumbnail, "promoVideoUrl", price, currency, status, level, language, "moduleNumber", "weeksDuration", "totalLectures", "totalDuration", "scriptureRef", "isFeatured", "isFree", requirements, outcomes, "targetAudience", "welcomeMessage", "congratsMessage", tags, "rejectionReason", "instructorId", "categoryId", "createdAt", "updatedAt", "invitationStatus", "programId", "courseCode") FROM stdin;
cmqm3bas20005pm88e08zdgem	Pastoral Theology and Christian Leadership	pastoral-theology-and-christian-leadership-1		This course examines the biblical foundations and practical aspects of pastoral ministry and leadership. Emphasis is placed on shepherding, discipleship, counseling, administration, and servant leadership in the church.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781955105749-cmqm3bas20005pm88e08zdgem-1781955105749.png	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmql8quqk0000h58xt3rfj7uo	cmqku2zc200043u1qepizf3ax	2026-06-20 08:22:52.754	2026-06-22 13:44:35.477	ACCEPTED	cmqdmxali00009bd9nmskius7	MDIV 501
cmqm4xmwo0005fzym9rhv5byg	Church History and Historical Theology	church-history-and-historical-theology-1		This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781954512817-cmqm4xmwo0005fzym9rhv5byg-1781954512817.png	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmqku2zbu00013u1qbthq3afd	cmqku2zc500063u1qa0r9egdz	2026-06-20 09:08:14.52	2026-06-26 16:01:54.4	ACCEPTED	cmqdmxali00009bd9nmskius7	MDIV 502
cmqurk9xx0003cncwyp5wnvhs	Understanding the Bible	understanding-the-bible-1782468231763	\N	This course provides a general overview of the Bible’s content and theology. It will survey each book of the Bible and key theological themes, giving a big-picture view of the Bible. This course is designed to give a strong foundation in understanding the Bible. It introduces the Bible as the inspired Word of God, explains its formation, teaches how to interpret Scripture correctly, and helps students understand how to apply it in Christian life and ministry.\nThe goal is not only to gain information about the Bible, but to grow in love for God’s Word and to become faithful readers and doers of Scripture.\n	\N	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]	\N	\N	[]	\N	cmquqt72f0000cncw4qq1gp70	\N	2026-06-26 10:03:51.765	2026-06-27 10:18:57.09	ACCEPTED	cmqureafd0001cncw89x31uvr	CTH001
cmqz0ph7p000174imnri1fnic	Trial 1	trial-1-1782725455715	\N	CWT01 Description	\N	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]	\N	\N	[]	\N	cmqku2zbo00003u1qrtqtk0h8	\N	2026-06-29 09:30:55.716	2026-06-29 09:57:09.366	UNASSIGNED	cmqureafd0001cncw89x31uvr	CWT01
cmr0mijpo002du0214hzcic1f	Church History and Historical Theology (Copy)	church-history-and-historical-theology-copy-f7368e		This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781954512817-cmqm4xmwo0005fzym9rhv5byg-1781954512817.png	\N	0	INR	DRAFT	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmqku2zbu00013u1qbthq3afd	cmqku2zc500063u1qa0r9egdz	2026-06-30 12:29:09.665	2026-06-30 12:29:09.665	PENDING	cmqz1e2fe001274im7vdmwo2z	\N
cmr0lcfdn0002u0217dg9nqqb	Pastoral Theology and Christian Leadership	pastoral-theology-and-christian-leadership		This course examines the biblical foundations and practical aspects of pastoral ministry and leadership. Emphasis is placed on shepherding, discipleship, counseling, administration, and servant leadership in the church.	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/thumbnails/1781955105749-cmqm3bas20005pm88e08zdgem-1781955105749.png	\N	0	INR	PUBLISHED	BEGINNER	ENGLISH	\N	6	0	0	\N	f	t	[]	[]	[]			[]	\N	cmql8quqk0000h58xt3rfj7uo	cmqku2zc200043u1qepizf3ax	2026-06-30 11:56:24.368	2026-06-30 13:55:29.322	ACCEPTED	\N	\N
\.


--
-- Data for Name: CourseInvitation; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."CourseInvitation" (id, "courseId", "instructorId", "adminNote", status, "createdAt", "updatedAt") FROM stdin;
cmqm3tuv10001fzymvbwtj1zw	cmqm3bas20005pm88e08zdgem	cmql8quqk0000h58xt3rfj7uo	Join The Course	ACCEPTED	2026-06-20 08:37:18.589	2026-06-20 08:40:29.417
cmqm4y6500007fzymr0e9z2zx	cmqm4xmwo0005fzym9rhv5byg	cmqku2zbu00013u1qbthq3afd	Join the Course	ACCEPTED	2026-06-20 09:08:39.444	2026-06-20 09:09:55.582
cmqurlfyy0005cncwjxj1qgz3	cmqurk9xx0003cncwyp5wnvhs	cmquqt72f0000cncw4qq1gp70	Please create and update the course. Thank you!	ACCEPTED	2026-06-26 10:04:46.234	2026-06-26 10:06:21.605
cmr0ld0940022u0218zdufmur	cmr0lcfdn0002u0217dg9nqqb	cmql8quqk0000h58xt3rfj7uo	\N	ACCEPTED	2026-06-30 11:56:24.368	2026-06-30 12:11:30.042
cmr0mj3ms004eu021wed70rs1	cmr0mijpo002du0214hzcic1f	cmqku2zbu00013u1qbthq3afd	\N	PENDING	2026-06-30 12:29:09.665	2026-06-30 12:29:09.665
\.


--
-- Data for Name: Curriculum; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Curriculum" (id, "courseId", overview, objectives, "weeklyPlan", "assessmentPlan", "updatedAt") FROM stdin;
cmqm60fxq0001yakbrdzo19v2	cmqm4xmwo0005fzym9rhv5byg	This course surveys the history of Christianity from the apostolic era to the modern church. Students will explore major movements, theological developments, councils, reformations, and influential Christian leaders that have shaped the church throughout history.	["Trace the major periods of church history.","Understand significant theological developments.","Identify key figures and movements in Christianity.","Evaluate the impact of historical events on the contemporary church.","Apply lessons from church history to present-day ministry."]	[]	\N	2026-06-20 09:38:25.07
cmqm63aq60003yakbot2u9ifc	cmqm3bas20005pm88e08zdgem	This course explores the biblical and theological foundations of pastoral ministry and Christian leadership. Students will examine the role of the pastor as a shepherd, servant, and leader while developing practical skills in pastoral care, discipleship, counseling, and church administration.	["Understand the biblical role of a pastor.","Demonstrate principles of servant leadership.","Apply pastoral care and counseling techniques.","Develop strategies for discipleship and church growth.","Lead congregations with integrity and spiritual maturity."]	[]	\N	2026-06-20 09:42:24.336
cmqurz94n0009cncwaf059j1h	cmqurk9xx0003cncwyp5wnvhs	This course provides a general overview of the Bible’s content and theology. It will survey each book of the Bible and key theological themes, giving a big-picture view of the Bible. This course is designed to give a strong foundation in understanding the Bible. It introduces the Bible as the inspired Word of God, explains its formation, teaches how to interpret Scripture correctly, and helps students understand how to apply it in Christian life and ministry.\nThe goal is not only to gain information about the Bible, but to grow in love for God’s Word and to become faithful readers and doers of Scripture.\n	["Explain what the Bible is and understand why Christians call the Bible the Word of God. ","Understand key terms such as revelation, inspiration, canon, covenant, gospel, and interpretation.","Explain the main message of the Bible. ","Read the Bible with context and care. ","Recognize different types of biblical writings. ","Apply Scripture to personal life, family, church, and ministry. "]	[]	\N	2026-06-26 10:15:30.551
cmr0lcfdn0004u021lyeb7zxb	cmr0lcfdn0002u0217dg9nqqb	\N	[]	[]	\N	2026-06-30 11:56:24.368
cmr0mijpo002fu021jclyjk7v	cmr0mijpo002du0214hzcic1f	\N	[]	[]	\N	2026-06-30 12:29:09.665
\.


--
-- Data for Name: Discussion; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Discussion" (id, "courseId", "sectionId", "lessonId", "authorId", title, content, "isPinned", "isLocked", score, feedback, "createdAt") FROM stdin;
cmqp8ew8n000fmjfl9din2yar	cmqm3bas20005pm88e08zdgem	cmqma3dhl0010fjta6rse61y7	cmqmag2e2001dfjtatsq6s9pj	cmqp6pnjo000010tomoljdyc4	Discussion	vfgfgfgfgfdgfdgfdgfdgfdgrrrt	f	f	24		2026-06-22 13:08:57.144
cmqp8j32h000vmjfliypspdht	cmqm3bas20005pm88e08zdgem	cmqma4r8j0012fjtawds1ajg0	cmqmb15gu003mfjtagdy38md2	cmqp6pnjo000010tomoljdyc4	Discussion	bnbv,mb	f	f	24		2026-06-22 13:12:12.617
cmqpod4s9000nhrq8qukf3o00	cmqm4xmwo0005fzym9rhv5byg	cmqm7o0px0001676p3m8poipq	cmqm830ov000g676pi9q80t1h	cmqp6pnjo000010tomoljdyc4	Discussion	fhhfhfhf	f	f	\N	\N	2026-06-22 20:35:28.762
cmqpok9yq001bhrq8fcr78lwp	cmqm4xmwo0005fzym9rhv5byg	cmqm84hxm000i676p1tz73xr2	cmqm8b1ct000t676pealzxzcv	cmqp6pnjo000010tomoljdyc4	Discussion	hfhgmhk,j	f	f	88		2026-06-22 20:41:02.066
\.


--
-- Data for Name: DiscussionReply; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."DiscussionReply" (id, "discussionId", "authorId", content, "isInstructor", "createdAt") FROM stdin;
cmqp8fph4000jmjfl6ofrfnhw	cmqp8ew8n000fmjfl9din2yar	cmqp6pnjo000010tomoljdyc4	gflkglkfjgl	f	2026-06-22 13:09:35.032
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
cmqp9xtcr000xai5scf4hdpcc	cmqp6pnjo000010tomoljdyc4	cmqm4xmwo0005fzym9rhv5byg	2026-06-22 13:51:39.484	2026-06-22 20:41:02.819	100	COMPLETED	\N	\N
cmqp6pov8000410toqzo6alhn	cmqp6pnjo000010tomoljdyc4	cmqm3bas20005pm88e08zdgem	2026-06-22 12:21:21.572	2026-06-22 13:51:39.47	100	COMPLETED	\N	\N
cmr0n9efo0001yukuok57bu2a	cmqz5i7660000tjftgvoo5j5v	cmr0mijpo002du0214hzcic1f	2026-06-30 12:50:02.965	\N	33.33333333333333	ACTIVE	\N	\N
cmr0o8oft0021yukuv2tdjd0l	cmql8quqk0000h58xt3rfj7uo	cmr0lcfdn0002u0217dg9nqqb	2026-06-30 13:17:28.889	\N	0	ACTIVE	\N	\N
\.


--
-- Data for Name: Extension; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Extension" (id, "studentId", "itemId", "itemType", "courseId", "extendedDate", "createdAt", "updatedAt") FROM stdin;
cmqp88pyx000dmjflrrt2xjd8	cmqp6pnjo000010tomoljdyc4	cmqmab2yh001bfjtathv2kork	ASSIGNMENT	cmqm3bas20005pm88e08zdgem	2026-06-23 00:00:00	2026-06-22 13:04:09.081	2026-06-22 13:04:09.081
cmqp9xb70000pai5sgu54rxw0	cmqp6pnjo000010tomoljdyc4	cmqmaunv7002lfjtayb3y966e	ASSIGNMENT	cmqm3bas20005pm88e08zdgem	2026-06-23 00:00:00	2026-06-22 13:51:15.948	2026-06-22 13:51:15.948
cmqpoaa3k000fhrq8g3wp2y3m	cmqp6pnjo000010tomoljdyc4	cmqm80ohd000e676p6czu0aux	ASSIGNMENT	cmqm4xmwo0005fzym9rhv5byg	2026-06-24 00:00:00	2026-06-22 20:33:15.68	2026-06-22 20:33:15.68
cmqpoiy2o0013hrq8wranpw70	cmqp6pnjo000010tomoljdyc4	cmqm88xou000r676pqmmgppo8	ASSIGNMENT	cmqm4xmwo0005fzym9rhv5byg	2026-06-24 00:00:00	2026-06-22 20:40:00.001	2026-06-22 20:40:00.001
\.


--
-- Data for Name: ExtensionRequest; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ExtensionRequest" (id, "studentId", "itemId", "itemType", "courseId", reason, status, "requestedDate", "createdAt", "updatedAt") FROM stdin;
cmqp84x6r000bmjfloab0hhfc	cmqp6pnjo000010tomoljdyc4	cmqmab2yh001bfjtathv2kork	ASSIGNMENT	cmqm3bas20005pm88e08zdgem	need extension	APPROVED	2026-06-23 00:00:00	2026-06-22 13:01:11.812	2026-06-22 13:04:09.073
cmqp8ik4t000tmjflwd4sasqz	cmqp6pnjo000010tomoljdyc4	cmqmaunv7002lfjtayb3y966e	ASSIGNMENT	cmqm3bas20005pm88e08zdgem	dfddf	APPROVED	2026-06-23 00:00:00	2026-06-22 13:11:48.078	2026-06-22 13:51:15.944
cmqpo7vfo000dhrq80jykt2go	cmqp6pnjo000010tomoljdyc4	cmqm80ohd000e676p6czu0aux	ASSIGNMENT	cmqm4xmwo0005fzym9rhv5byg	hbhhbh	APPROVED	\N	2026-06-22 20:31:23.365	2026-06-22 20:33:15.674
cmqpoibci0011hrq8uovv5kvw	cmqp6pnjo000010tomoljdyc4	cmqm88xou000r676pqmmgppo8	ASSIGNMENT	cmqm4xmwo0005fzym9rhv5byg	high	APPROVED	2026-06-24 00:00:00	2026-06-22 20:39:30.547	2026-06-22 20:39:59.996
\.


--
-- Data for Name: Forum; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Forum" (id, "courseId") FROM stdin;
cmr0lcfdn0003u021wj2bufgj	cmr0lcfdn0002u0217dg9nqqb
cmr0mijpo002eu021x7iunhep	cmr0mijpo002du0214hzcic1f
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
cmqmab2yd0019fjtan1gr22cr	cmqma3dhl0010fjta6rse61y7	Reflection Paper (700–1,000 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmqw59kry004du8gjm66t9mfh	cmqw4cfhv0026u8gjymtncomp	Week 5 - Learning Forum	FORUM	Module 5 teaches that understanding the Bible must lead to obedience and real-life application in personal life, family, church, ministry, and leadership. Why is it not enough for a believer or leader to only know Scripture, and how should God’s Word shape daily actions, decisions, relationships, and ministry? 	\N	0	3	f	f	\N	10	\N
cmqmav4yw002ofjta6c5ocmpl	cmqma4r8j0012fjtawds1ajg0	Week 2 Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
cmqmagxos001gfjtatxn5zxo5	cmqma3dhl0010fjta6rse61y7	Week 1 Quiz	QUIZ		\N	0	3	f	f	\N	\N	\N
cmqvc3m4o0001am5k1m0o3req	cmqus6esy000bcncwdmaajv17	Module 1 – General Introduction to the Bible	VIDEO	\N	https://youtu.be/ak06MSETeo4?si=z4dONwm3qmG5nrwY	300	0	f	f	\N	\N	\N
cmqvc6vwt0003am5kea534t3s	cmqus6esy000bcncwdmaajv17	The story of the Bible	VIDEO	\N	https://youtu.be/7_CGP-12AE0?si=ae-zdaPxqp0JrOhz	300	1	f	f	\N	\N	\N
cmqvcavwo000aam5kxw6d0fpc	cmqus6esy000bcncwdmaajv17	Week 1	QUIZ	Multiple Choice Questions	\N	0	2	f	f	\N	\N	\N
cmqvcvf660025am5k2gac09ec	cmqus6esy000bcncwdmaajv17	Discussion Forum - Week 1	FORUM	Module 1 teaches that the Bible is both a divine book inspired by God and a human book written through human authors in real historical and cultural settings. How does understanding these two natures of the Bible help believers read, trust, interpret, and apply Scripture today? 	\N	0	3	f	f	\N	10	\N
cmqvgut9p0003kllcnm612zcm	cmqvgr97z0001kllc17lapea1	Week 2 - Video 1	VIDEO	\N	https://youtu.be/ALsluAKBZ-c?si=oZ8KIWpSBOlBYymn	720	0	f	f	\N	\N	\N
cmqvhbz2q0008kllcj014krxk	cmqvgr97z0001kllc17lapea1	Week 2	QUIZ		\N	0	1	f	f	\N	\N	\N
cmqvi3hy5000xwhytxmcduxqh	cmqvgr97z0001kllc17lapea1	Discussion Forum - Week 2	FORUM	Module 2 teaches that the Old Testament is not just ancient history, but it prepares the way for Jesus Christ through themes such as covenant, sacrifice, holiness, kingship, prophecy, and redemption. How does understanding these major Old Testament themes help Christians read the New Testament more clearly today? 	\N	0	2	f	f	\N	10	\N
cmqvi8mrf0011whytzdsm7hik	cmqvi6rcr000zwhytsnxuxk6g	Week 3	VIDEO	\N	https://youtu.be/Q0BrP8bqj0c?si=wo3ot3UaJzHHaEHM	480	0	f	f	\N	\N	\N
cmqviccw70018whytpkilfqbn	cmqvi6rcr000zwhytsnxuxk6g	Week 3 - Quiz	QUIZ		\N	0	1	f	f	\N	\N	\N
cmqviy8490030whyt778z2669	cmqvi6rcr000zwhytsnxuxk6g	Week 3 - Learning Forum	FORUM	Module 3 teaches that the New Testament reveals the fulfillment of God’s promises in Jesus Christ and shows His life, death, resurrection, the birth of the Church, and Christ's final victory. How does understanding Jesus as the center of the New Testament help believers grow in faith, worship, mission, and Christian living today? 	\N	0	2	f	f	\N	10	\N
cmqw3du2m0003u8gjjfazxo7n	cmqw3bg480001u8gjdkuzlmck	Week 4 - Recognizing Literary Genres of the Bible	VIDEO	\N	https://youtu.be/oUXJ8Owes8E?si=0vq9gkZbgxqZXRC6	300	0	f	f	\N	\N	\N
cmqw3n0ye0005u8gjg3vvyi4x	cmqw3bg480001u8gjdkuzlmck	Week 4 - Reading Scripture in Its Historical and Cultural Context	VIDEO	\N	https://youtu.be/xaMPCcyL4S0?si=zx8wB5a_gkkFQoz2	480	1	f	f	\N	\N	\N
cmqw3qexa000cu8gjbn7y22wi	cmqw3bg480001u8gjdkuzlmck	Week 4 - Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
cmqw4bir40024u8gja3g6ef7b	cmqw3bg480001u8gjdkuzlmck	Week 4 - Discussion Forum	FORUM	Module 4 teaches that understanding the Bible requires attention to literary genre, historical context, cultural background, grammar, and the author’s intended meaning. Why is it dangerous to apply a Bible passage without first understanding its original context and genre? 	\N	0	3	f	f	\N	10	\N
cmqw4nnvb0028u8gjtymwvfx5	cmqw4cfhv0026u8gjymtncomp	Week 5 - Biblical Leadership	VIDEO	\N	https://youtu.be/HMkFF6qKjKU?si=lSKuUaAMcizeggis	720	0	f	f	\N	\N	\N
cmqw4t738002au8gjsiabyxhb	cmqw4cfhv0026u8gjymtncomp	Week 5 - Biblical principles for life	VIDEO	\N	https://youtu.be/umm4GUJGG8E?si=55e1K6U5UwJRw0i4	480	1	f	f	\N	\N	\N
cmqw4uyeu002hu8gjajszz0xk	cmqw4cfhv0026u8gjymtncomp	Week 5 - Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
cmqw5g1qd004iu8gj9x3zd76l	cmqw5dm7u004fu8gjxq60qrgs	Reflection Paper	ASSIGNMENT	\N	\N	0	0	f	f	\N	\N	\N
cmqz0trco000574imfz47agnh	cmqz0r7fr000374impkqp5nfa	Pgm 1 Course 1 Video	VIDEO	\N	https://www.youtube.com/watch?v=ulFK2tv4GWQ&list=RDulFK2tv4GWQ&start_radio=1	720	0	t	f	\N	\N	\N
cmqz0v1nc000774imyickm1xf	cmqz0r7fr000374impkqp5nfa	Pg1 Course 2 Video	VIDEO	\N	https://www.youtube.com/watch?v=F5Vx3V5h-fc&list=RDF5Vx3V5h-fc&start_radio=1	5100	1	f	f	\N	\N	\N
cmqz0ywnd000e74imbvn7t41k	cmqz0r7fr000374impkqp5nfa	Course 1 Assignment	ASSIGNMENT	\N	\N	0	2	f	f	\N	\N	\N
cmqz0zkcc000j74img404edn1	cmqz0r7fr000374impkqp5nfa	Course 2 Assignment	ASSIGNMENT	\N	\N	0	3	f	f	\N	\N	\N
cmqz10ajb000o74im1xqkw89j	cmqz0r7fr000374impkqp5nfa	Course 1 Quiz	QUIZ	Answer all questions	\N	0	4	f	f	\N	\N	\N
cmr0lcfdo0006u021lxhwaiox	cmr0lcfdo0005u0217zb7isrt	What is Pastoral Ministry?	VIDEO	\N	https://youtu.be/hyJKt2hbod8?si=L2H06iZ1wqsw-TJ7	180	0	f	f	\N	\N	\N
cmr0lcfdo0007u021dhnwwp7v	cmr0lcfdo0005u0217zb7isrt	Disscusion Week 1	FORUM	Why is servant leadership essential for effective pastoral ministry in the twenty-first century?	\N	0	2	f	f	\N	25	\N
cmr0lcfdo0008u021echfpetp	cmr0lcfdo0005u0217zb7isrt	Reflection Paper (700–1,000 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmr0lcfdo000bu0217ao4muq9	cmr0lcfdo0005u0217zb7isrt	Week 1 Quiz	QUIZ		\N	0	3	f	f	\N	\N	\N
cmr0lcfdp0014u021lfhv9s3j	cmr0lcfdp0013u021czt9m44e	Leadership, 5 Things Jesus Teaches us about Leadership	VIDEO	\N	https://youtu.be/1ru9B3E1joY?si=O8jS_y-w9N85v09B	660	0	f	f	\N	\N	\N
cmr0lcfdp0015u021jwkewuvj	cmr0lcfdp0013u021czt9m44e	Ministry Development Project (1,000–1,500 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmr0lcfdp0018u021qhqg2w2w	cmr0lcfdp0013u021czt9m44e	Forum 2	FORUM	What challenges do Christian leaders face today, and how can they remain faithful to their calling?	\N	0	3	f	f	\N	25	\N
cmr0lcfdp0019u021s7k8hh0z	cmr0lcfdp0013u021czt9m44e	Week 2 Quiz	QUIZ		\N	0	2	f	f	\N	\N	\N
cmr0mijpp002hu021z50tv4wx	cmr0mijpo002gu021akgxag2m	The First 150 Years of Christianity in the Roman World	VIDEO	\N	https://youtu.be/oM8Gcn1gbRw?si=XNRIeYTwonTZcFYe	780	0	f	f	\N	\N	\N
cmr0mijpp002iu021zuw3btc3	cmr0mijpo002gu021akgxag2m	Early Christian Schisms - Before Imperium - Extra History	VIDEO	\N	https://youtu.be/E1ZZeCDGHJE?si=qGqhNLOde2OZQeno	480	1	f	f	\N	\N	\N
cmr0mijpp002ju021vt2h58e6	cmr0mijpo002gu021akgxag2m	What lessons can contemporary believers learn from the faith and commitment of the early church?	FORUM	Give a Reply for this Question	\N	0	3	f	f	\N	25	\N
cmr0mijpp002ku0212m81u0ei	cmr0mijpo002gu021akgxag2m	Historical Reflection Essay (700–1,000 words)	ASSIGNMENT	\N	\N	0	2	f	f	\N	\N	\N
cmr0mijpp002nu0211hccv3yz	cmr0mijpo002gu021akgxag2m	Week 1 Quiz	QUIZ		\N	0	4	f	f	\N	\N	\N
cmr0mijpq003gu021wg5oq21e	cmr0mijpq003fu021nxyoiy8b	Church History Timeline Project (1,000–1,500 words)	ASSIGNMENT	\N	\N	0	1	f	f	\N	\N	\N
cmr0mijpq003ju021mnxn6xbq	cmr0mijpq003fu021nxyoiy8b	 Why did the Protestant Reformation Happen?	VIDEO	\N	https://youtu.be/cXYyIBdBubE?si=k3bckFT9v9I71lt0	720	0	f	f	\N	\N	\N
cmr0mijpq003ku02134brk0mw	cmr0mijpq003fu021nxyoiy8b	In what ways has the Protestant Reformation shaped the beliefs and practices of the modern Church?	FORUM	Give as reply for the Forum	\N	0	2	f	f	\N	25	\N
cmr0mijpq003lu021p1rk3ih5	cmr0mijpq003fu021nxyoiy8b	Week 2 Quiz	QUIZ		\N	0	3	f	f	\N	\N	\N
\.


--
-- Data for Name: LessonProgress; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."LessonProgress" (id, "enrollmentId", "lessonId", "completedAt", "watchedSeconds") FROM stdin;
cmqpnk9kb000bhrq8iacvib1w	cmqp9xtcr000xai5scf4hdpcc	cmqm9bhoc0002fjtamemwjsgb	2026-06-22 20:13:01.93	0
cmqpod5c2000phrq8n3kgyq6j	cmqp9xtcr000xai5scf4hdpcc	cmqm830ov000g676pi9q80t1h	2026-06-22 20:35:29.473	0
cmqpoegy8000rhrq85tdn43mu	cmqp9xtcr000xai5scf4hdpcc	cmqm861xv000k676palb9pam4	2026-06-22 20:36:31.183	0
cmqpogj2w000zhrq8uvtxf8di	cmqp9xtcr000xai5scf4hdpcc	cmqm8cx3c000w676p4tm0ux3m	2026-06-22 20:38:07.255	0
cmqpoje3b0019hrq8f61zk4ss	cmqp9xtcr000xai5scf4hdpcc	cmqm88xop000p676peegc2hlt	2026-06-22 20:40:20.758	0
cmqpokah9001dhrq8t8r2cuqc	cmqp9xtcr000xai5scf4hdpcc	cmqm8b1ct000t676pealzxzcv	2026-06-22 20:41:02.733	0
cmqpobi0s000lhrq8lr3zd6l0	cmqp9xtcr000xai5scf4hdpcc	cmqm80ohb000c676pmvmgotrk	2026-06-23 11:04:12.582	0
cmqp81z6r0001mjflss4xrai4	cmqp6pov8000410toqzo6alhn	cmqma7u560014fjta1di1my64	2026-06-22 12:58:54.435	2054
cmqp836gu0009mjfl0ui8j40k	cmqp6pov8000410toqzo6alhn	cmqmagxos001gfjtatxn5zxo5	2026-06-22 13:48:02.513	3348
cmqp8ewgr000hmjflgd5qy0nt	cmqp6pov8000410toqzo6alhn	cmqmag2e2001dfjtatsq6s9pj	2026-06-22 13:08:57.434	3176
cmqp8gm1r000lmjflsqqczmwq	cmqp6pov8000410toqzo6alhn	cmqmas8i9002efjtat36qtmqu	2026-06-22 13:10:17.246	3893
cmqp8j3a9000xmjflj30fzq2l	cmqp6pov8000410toqzo6alhn	cmqmb15gu003mfjtagdy38md2	2026-06-22 13:12:12.897	2508
cmqp8p2h5000zmjfleplazb0a	cmqp6pov8000410toqzo6alhn	cmqmav4yw002ofjta6c5ocmpl	2026-06-22 13:50:30.891	3647
cmqp9nquj0005ai5sqibuka7c	cmqp6pov8000410toqzo6alhn	cmqmab2yd0019fjtan1gr22cr	2026-06-22 13:43:49.675	1292
cmqp9xtbq000vai5swj9udwuv	cmqp6pov8000410toqzo6alhn	cmqmaunv0002jfjtabouyu5z4	2026-06-22 13:51:39.446	2659
cmqpng2ic0001hrq8hj5jq6zx	cmqp9xtcr000xai5scf4hdpcc	cmqm7qfur0003676pzxgtogtb	2026-06-22 20:09:46.162	2800
cmqpnh7it0003hrq8apbg30gc	cmqp9xtcr000xai5scf4hdpcc	cmqm7xxk40005676pf5itb3zf	2026-06-22 20:10:39.317	1854
cmr0na6vx0003yukukndn1uja	cmr0n9efo0001yukuok57bu2a	cmr0mijpp002hu021z50tv4wx	2026-06-30 12:50:49.762	0
cmr0nenj2000lyukuk3gzyt2f	cmr0n9efo0001yukuok57bu2a	cmr0mijpp002iu021zuw3btc3	2026-06-30 12:54:16.586	0
cmr0nugjf001pyukun4qkjun8	cmr0n9efo0001yukuok57bu2a	cmr0mijpp002nu0211hccv3yz	2026-06-30 13:06:25.88	0
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Message" (id, "senderId", "receiverId", content, "sentAt", "readAt") FROM stdin;
cmqrutzdu00011ilo2q8h5byh	cmqku2zbo00003u1qrtqtk0h8	cmqp6pnjo000010tomoljdyc4	hi	2026-06-24 09:12:04.962	\N
cmqruu2qj00051ilod4i8ngmb	cmqku2zbo00003u1qrtqtk0h8	cmqp6pnjo000010tomoljdyc4	hi	2026-06-24 09:12:09.307	\N
cmqruu5kq00071ilo3axsvuha	cmqku2zbo00003u1qrtqtk0h8	cmqp6pnjo000010tomoljdyc4	hi	2026-06-24 09:12:12.987	\N
cmqruwiqh000d1iloqolx91ns	cmqku2zbo00003u1qrtqtk0h8	cmqp6pnjo000010tomoljdyc4	hi\n	2026-06-24 09:14:03.353	\N
cmqruyju8000h1ilo31zt37ks	cmqku2zbo00003u1qrtqtk0h8	cmqp6pnjo000010tomoljdyc4	hi\n	2026-06-24 09:15:38.097	\N
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
cmqm4y65c0009fzym3c9exbgf	cmqku2zbu00013u1qbthq3afd	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Church History and Historical Theology"	/instructor/courses	f	2026-06-20 09:08:39.456
cmqpa1y9q0015ai5ss3pqni6c	cmqp6pnjo000010tomoljdyc4	ASSIGNMENT_GRADED	Your assignment has been graded	You scored 24/25 on 'Reflection Paper (700–1,000 words)'	/student/assignments/cmqmab2yh001bfjtathv2kork	t	2026-06-22 13:54:52.478
cmqp9t5pg000bai5s5c9p4388	cmqp6pnjo000010tomoljdyc4	QUIZ_PASSED	You passed 'Week 1 Quiz'!	You scored 100.0%.	#	t	2026-06-22 13:48:02.213
cmqp9wc8f000lai5s7uahkiyr	cmqp6pnjo000010tomoljdyc4	QUIZ_PASSED	You passed 'Week 2 Quiz'!	You scored 100.0%.	#	t	2026-06-22 13:50:30.64
cmqp9xtf7000yai5sahrubo5s	cmqp6pnjo000010tomoljdyc4	COURSE_COMPLETED	🎉 You completed 'Pastoral Theology and Christian Leadership'!	Keep up the great work!	/student/courses	t	2026-06-22 13:51:39.572
cmqpa1qfp0013ai5snihc3tka	cmqp6pnjo000010tomoljdyc4	ASSIGNMENT_GRADED	Your assignment has been graded	You scored 24/25 on 'Ministry Development Project (1,000–1,500 words)'	/student/assignments/cmqmaunv7002lfjtayb3y966e	t	2026-06-22 13:54:42.325
cmqpobhg4000jhrq8lrqgyzrp	cmqku2zbu00013u1qbthq3afd	NEW_SUBMISSION	New assignment submission	A student submitted 'Historical Reflection Essay (700–1,000 words)'	/instructor/courses/cmqm4xmwo0005fzym9rhv5byg/assignments	f	2026-06-22 20:34:11.86
cmqpojdix0017hrq8etuz8de8	cmqku2zbu00013u1qbthq3afd	NEW_SUBMISSION	New assignment submission	A student submitted 'Church History Timeline Project (1,000–1,500 words)'	/instructor/courses/cmqm4xmwo0005fzym9rhv5byg/assignments	f	2026-06-22 20:40:20.025
cmqpokali001jhrq8b4c5i2xu	cmqku2zbu00013u1qbthq3afd	STUDENT_COMPLETED	testing testing testing completed your course	testing testing testing has just finished 'Church History and Historical Theology'.	/instructor/courses/cmqm4xmwo0005fzym9rhv5byg/students	f	2026-06-22 20:41:02.887
cmqpogiid000xhrq85x6wtw8b	cmqp6pnjo000010tomoljdyc4	QUIZ_PASSED	You passed 'Week 2 Quiz'!	You scored 100.0%.	#	t	2026-06-22 20:38:06.517
cmqpokali001ihrq8379r1g9x	cmqp6pnjo000010tomoljdyc4	COURSE_COMPLETED	🎉 You completed 'Church History and Historical Theology'!	You've completed the Master of Divinity (M.Div.) program! Your certificate is ready to download.	/student/certificates	t	2026-06-22 20:41:02.887
cmqqjeb9h000311tuswq78fvq	cmqku2zbu00013u1qbthq3afd	NEW_SUBMISSION	New assignment submission	A student submitted 'Historical Reflection Essay (700–1,000 words)'	/instructor/courses/cmqm4xmwo0005fzym9rhv5byg/assignments	f	2026-06-23 11:04:11.909
cmqruyn9b000j1ilobq5olkjo	cmqp6pnjo000010tomoljdyc4	NEW_MESSAGE	New message from CWAY Admin	hi\n	/student/dashboard	t	2026-06-24 09:15:42.528
cmqruu2o700031ilot2oj0dpb	cmqp6pnjo000010tomoljdyc4	NEW_MESSAGE	New message from CWAY Admin	hi	/student/dashboard	t	2026-06-24 09:12:09.223
cmqruu5no00091iloyh1jchs2	cmqp6pnjo000010tomoljdyc4	NEW_MESSAGE	New message from CWAY Admin	hi	/student/dashboard	t	2026-06-24 09:12:13.093
cmqruu8t5000b1ilopyuvjprb	cmqp6pnjo000010tomoljdyc4	NEW_MESSAGE	New message from CWAY Admin	hi	/student/dashboard	t	2026-06-24 09:12:17.178
cmqruwkpt000f1ilow2inmk1x	cmqp6pnjo000010tomoljdyc4	NEW_MESSAGE	New message from CWAY Admin	hi\n	/student/dashboard	t	2026-06-24 09:14:05.921
cmqurlg720007cncwt6cr6jtg	cmquqt72f0000cncw4qq1gp70	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Understanding the Bible"	/instructor/courses	f	2026-06-26 10:04:46.526
cmqm3es9z0009pm88hqgecp70	cmql8quqk0000h58xt3rfj7uo	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Pastoral Theology and Christian Leadership"	/instructor/courses	t	2026-06-20 08:25:35.4
cmqm3tuvc0003fzym8bq3opk2	cmql8quqk0000h58xt3rfj7uo	COURSE_INVITATION	You've been assigned a course	You have a new course invitation: "Pastoral Theology and Christian Leadership"	/instructor/courses	t	2026-06-20 08:37:18.601
cmqp9nqmy0003ai5sjid4tpvc	cmql8quqk0000h58xt3rfj7uo	NEW_SUBMISSION	New assignment submission	A student submitted 'Reflection Paper (700–1,000 words)'	/instructor/courses/cmqm3bas20005pm88e08zdgem/assignments	t	2026-06-22 13:43:49.402
cmqp9xt4l000tai5sj098xd17	cmql8quqk0000h58xt3rfj7uo	NEW_SUBMISSION	New assignment submission	A student submitted 'Ministry Development Project (1,000–1,500 words)'	/instructor/courses/cmqm3bas20005pm88e08zdgem/assignments	t	2026-06-22 13:51:39.189
cmqp9xtf7000zai5slrqcijh6	cmql8quqk0000h58xt3rfj7uo	STUDENT_COMPLETED	testing testing testing completed your course	testing testing testing has just finished 'Pastoral Theology and Christian Leadership'.	/instructor/courses/cmqm3bas20005pm88e08zdgem/students	t	2026-06-22 13:51:39.572
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

COPY public."Program" (id, title, description, thumbnail, "thumbnailKey", duration, tags, status, "createdAt", "updatedAt", "applicationsClosed") FROM stdin;
cmqdmxali00009bd9nmskius7	Master of Divinity (M.Div.)	The Master of Divinity (M.Div.) program is a comprehensive theological and ministerial training course designed to equip students with a strong foundation in Biblical studies, Christian doctrine, spiritual formation, pastoral ministry, preaching, missions, and leadership. Through structured coursework and practical ministry experience, students will be prepared to serve effectively in churches, missions, and Christian organizations while growing in their relationship with Christ and commitment to His Kingdom.	\N	\N	3 Years	[]	PUBLISHED	2026-06-14 10:21:56.071	2026-06-27 10:10:11.11	f
cmqureafd0001cncw89x31uvr	Certificate in Theology (C.Th.)	The Certificate in Theology is a structured programme comprising 10 courses in ministry, missions, and leadership. Each course runs for 6 weeks and includes short video lectures, 1 or 2 readings, quizzes, discussion forums, and writing assignments. This program is designed to give believers, church workers, evangelists, and emerging leaders a strong biblical and theological foundation for effective Christian life, ministry, and leadership.	\N	\N	14 Months (60 Weeks)	[]	PUBLISHED	2026-06-26 09:59:12.457	2026-06-27 10:19:36.36	f
cmqz1e2fe001274im7vdmwo2z	A trial Pgm	A trial Pgm description	\N	\N	3	[]	DRAFT	2026-06-29 09:50:02.954	2026-06-29 09:50:02.954	f
\.


--
-- Data for Name: ProgramApplication; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ProgramApplication" (id, "programId", "mediumOfStudy", "fullName", dob, gender, "maritalStatus", nationality, "aadhaarNumber", "passportPhotoUrl", "mobileNumber", "whatsappNumber", email, "permanentAddress", "currentAddress", "highestQualification", "previousInstitution", "yearOfCompletion", "marksOrGrade", "certificatesUrls", "isBornAgain", "churchName", "churchAddress", "pastorName", "ministryExperience", "callingStatement", "reference1Name", "reference1Phone", "reference1Relation", "reference2Name", "reference2Phone", "reference2Relation", "declarationName", status, "createdAt", "updatedAt", "reference1Email", "reference1Type", "reference2Email", "reference2Type", "reference1Status", "reference1Token", "reference2Status", "reference2Token") FROM stdin;
cmqoxx4m2000358gf5cavn0d5	cmqdmxali00009bd9nmskius7	English	testing testing testing	2005-10-13 00:00:00	Male	Single	Indian	206582978876	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/applications/photos/1782116109639-1782116109639-IMG_1108.jpg	+91 6360238632	+91 6360238632	joelrtharakan880@gmail.com	{"line1":"jeevas dream mansiom","line2":"kothanur post byrathy, kothanur PO: 560077","city":"Bengaluru","state":"Karnataka","postalCode":"560077","country":"India"}	{"line1":"jeevas dream mansiom","line2":"kothanur post byrathy, kothanur PO: 560077","city":"Bengaluru","state":"Karnataka","postalCode":"560077","country":"India"}	Bachelors	Karunya University	2025	78	["https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/applications/certificates/1782116111115-1782116111115-SEM-1-Marksheet.pdf"]	t	Crossway AG Church	{"line1":"Mother Teresa Main Rd, Mariyannapalya,","line2":" Hebbal Kempapura, Bengaluru, Karnataka 560024, India","city":"Bengaluru","state":"Karnataka","postalCode":"560077","country":"India"}	Dr. Reeju Tharakan	3	I believe God has called me to know Him more deeply and to serve His people faithfully. Through prayer, involvement in the local church, and the guidance of spiritual leaders, I have sensed a growing desire to be equipped for Christian ministry and leadership. My passion is to grow in biblical knowledge, spiritual maturity, and Christ-like character so that I may effectively serve the Church and contribute to the advancement of God's Kingdom.\r\n\r\nI am pursuing theological education to strengthen my understanding of Scripture and to develop the skills necessary for ministry. My desire is to faithfully fulfill God's calling upon my life by serving others, sharing the Gospel, discipling believers, and leading with humility and integrity. I pray that through this program, God will prepare me to be a faithful servant and a blessing to the body of Christ and the communities He places me in.	Dr. Reeju Tharakan	8660307998	Pastor	Joel R Tharakan	6360238632	Father	testing testing	APPROVED	2026-06-22 08:15:12.026	2026-06-22 12:21:24.959	joelrtharakan880@gmail.com	Pastor's Recommendation	joelrtharakan.in@gmail.com	General Reference	SUBMITTED	3f91aa9bc182f20a670288796358d3648e305a4d07e4e4e9e28e9dcd08d0a93f	SUBMITTED	22f6b3214efa2705a071a0ec7f93c0cbf96fea1fa2ece5cadba25b0e396351d1
\.


--
-- Data for Name: ProgramEnrollment; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ProgramEnrollment" (id, "studentId", "programId", status, "enrolledAt", "completedAt", "currentCourseId") FROM stdin;
cmqp6po7m000210tokl519zpt	cmqp6pnjo000010tomoljdyc4	cmqdmxali00009bd9nmskius7	COMPLETED	2026-06-22 12:21:20.72	2026-06-22 20:41:02.835	cmqm4xmwo0005fzym9rhv5byg
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: cway
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
cmqvcd4jt000eam5k8zfj016p	cmqvcavwq000cam5kugbs8l85	The word “Bible” comes from which Greek word?	MCQ	1	0	\N
cmqvce4yi000kam5kuerrzp0d	cmqvcavwq000cam5kugbs8l85	How many books are there in the Bible?	MCQ	1	1	\N
cmqvcfmgq000qam5klj508hi6	cmqvcavwq000cam5kugbs8l85	What does the word “Testament” mean?	MCQ	1	2	\N
cmqvchmht000wam5kcycd7c4w	cmqvcavwq000cam5kugbs8l85	Why is the Bible called the Word of God?\n\nB. \nC. \nD. \n	MCQ	1	3	\N
cmqvcjl140012am5kdm49ix3l	cmqvcavwq000cam5kugbs8l85	According to 2 Timothy 3:16–17, Scripture is useful for teaching, rebuking, correcting, and what else?\n\n\n\n	MCQ	1	4	\N
cmqvclscy0017am5k2j2l9pgn	cmqvcavwq000cam5kugbs8l85	What are the two natures of the Bible?\n\n	MCQ	1	5	\N
cmqvcoaa0001ham5kofbgo1hh	cmqvcavwq000cam5kugbs8l85	What does verbal inspiration mean?\n\n\n	MCQ	1	6	\N
cmqvcp4fi001nam5kw15eaiu5	cmqvcavwq000cam5kugbs8l85	Approximately how many human authors wrote the Bible?	MCQ	1	7	\N
cmqvcqz7t001tam5kpvgsq4a9	cmqvcavwq000cam5kugbs8l85	What are the three main original languages of the Bible?\n\n\n	MCQ	1	8	\N
cmqvctcxy001zam5kl1jfwm16	cmqvcavwq000cam5kugbs8l85	What does the word “canon” mean?\n\n\n	MCQ	1	9	\N
cmqvhe45m000ckllcmicjri7p	cmqvhbz34000akllcsyf4nh3e	What is the main focus of Module 2?\nA. \nB. \nC. \nD. \nAnswer: B. \n	MCQ	1	0	\N
cmqvhgvh9000ikllcad1yml64	cmqvhbz34000akllcsyf4nh3e	Why is it important to study major Bible themes?\n\n	MCQ	1	1	\N
cmqvhiw0h000okllclzxv5j3e	cmqvhbz34000akllcsyf4nh3e	The Old Testament prepares the way for whom?\n\n	MCQ	1	2	\N
cmqvhk4fe000ukllc9mcqkbgi	cmqvhbz34000akllcsyf4nh3e	How many major sections are there in the Old Testament?\nA. Three\nB. Four\nC. Five\nD. Seven\nAnswer: C. Five\n	MCQ	1	3	\N
cmqvhlhrg0010kllc9u3w2yo8	cmqvhbz34000akllcsyf4nh3e	What does the word “Pentateuch” mean?\n\n	MCQ	1	4	\N
cmqvhvmx90003whyt2uvmtluo	cmqvhbz34000akllcsyf4nh3e	Who is traditionally considered the author of Genesis, Exodus, Leviticus, Numbers, and Deuteronomy?\n	MCQ	1	5	\N
cmqvhx5hg0009whyt8po33oxo	cmqvhbz34000akllcsyf4nh3e	What is the main theme of Exodus?	MCQ	1	6	\N
cmqvhyoey000fwhytk0vfiyyr	cmqvhbz34000akllcsyf4nh3e	Which book records Israel’s wilderness journey?	MCQ	1	7	\N
cmqvi0emc000lwhytmtdt7ybc	cmqvhbz34000akllcsyf4nh3e	Which book teaches that “the righteous shall live by faith”?	MCQ	1	8	\N
cmqvi1vzh000rwhyt31ljmneg	cmqvhbz34000akllcsyf4nh3e	Which covenant promises forgiveness and new life through Christ?	MCQ	1	9	\N
cmqviehz5001cwhyt52rdjegh	cmqviccwa001awhytdk3e2jj3	What does the New Testament reveal?	MCQ	1	0	\N
cmqvifhlf001iwhytqub3cr0w	cmqviccwa001awhytdk3e2jj3	How many main sections are there in the New Testament?\n	MCQ	1	1	\N
cmqvigrx7001owhytrokxzr13	cmqviccwa001awhytdk3e2jj3	Which Gospel presents Jesus as Messiah and King?	MCQ	1	2	\N
cmqvii36i001uwhyt35jidyes	cmqviccwa001awhytdk3e2jj3	Who wrote the Gospel of Luke and the Book of Acts?	MCQ	1	3	\N
cmqvikmgq0020whytf6sc5vih	cmqviccwa001awhytdk3e2jj3	What is the main focus of the Book of Acts?	MCQ	1	4	\N
cmqvimrj50026whytrzc9yqd0	cmqviccwa001awhytdk3e2jj3	Which Pauline Epistle is central to understanding salvation?	MCQ	1	5	\N
cmqvipok6002cwhytp7ko8gml	cmqviccwa001awhytdk3e2jj3	What is the main theme of Galatians?	MCQ	1	6	\N
cmqviqua7002iwhytix57rhvi	cmqviccwa001awhytdk3e2jj3	Which book teaches the superiority of Christ?\n	MCQ	1	7	\N
cmqvitzb7002owhytqunvojty	cmqviccwa001awhytdk3e2jj3	What is the main message of Revelation?\n	MCQ	1	8	\N
cmqviw286002uwhytb90rd1ed	cmqviccwa001awhytdk3e2jj3	According to the module, the unity of the Bible is centered on whom?\n	MCQ	1	9	\N
cmqw3sgph000gu8gj4eq996bf	cmqw3qexe000eu8gjuum8c15h	What does the acronym A-I-M mean in Bible interpretation?	MCQ	1	0	\N
cmqw3ts09000mu8gj8mvdrxxw	cmqw3qexe000eu8gjuum8c15h	What is the main purpose of studying the Bible carefully?	MCQ	1	1	\N
cmqw3v39g000su8gjwbxvpnum	cmqw3qexe000eu8gjuum8c15h	What does the “General Context” of a Bible passage include?	MCQ	1	2	\N
cmqw3wh3b000yu8gjp30mocsj	cmqw3qexe000eu8gjuum8c15h	Which biblical book is compared to a “coconut” because it needs extra help to understand?\n	MCQ	1	3	\N
cmqw3xkql0014u8gj32mgqghv	cmqw3qexe000eu8gjuum8c15h	What is a narrative?\n	MCQ	1	4	\N
cmqw459u2001au8gj60uc2688	cmqw3qexe000eu8gjuum8c15h	According to the module, what is the single most common type of literature in the Bible?\n	MCQ	1	5	\N
cmqw468mg001gu8gj4ist49yc	cmqw3qexe000eu8gjuum8c15h	In the final analysis, who is the hero across all biblical narratives?	MCQ	1	6	\N
cmqw47ai4001mu8gj0c0e80eh	cmqw3qexe000eu8gjuum8c15h	What is Hebrew parallelism mainly concerned with?	MCQ	1	7	\N
cmqw48iey001su8gjfy26w0zg	cmqw3qexe000eu8gjuum8c15h	Which type of parallelism repeats the same concept using different words?\n	MCQ	1	8	\N
cmqw4a765001yu8gj4muj4nu1	cmqw3qexe000eu8gjuum8c15h	Synonymous parallelism\n	MCQ	1	9	\N
cmqw4x0hy002lu8gjp7shxgg7	cmqw4uyf3002ju8gj1hztdqox	What is the main purpose of the Bible according to Module 5?	MCQ	1	0	\N
cmqw4xriu002ru8gjwijudq9m	cmqw4uyf3002ju8gj1hztdqox	According to James 1:22, believers should be:\n	MCQ	1	1	\N
cmqw4ypdn002xu8gjw2eetu4r	cmqw4uyf3002ju8gj1hztdqox	What does biblical application mean?\n	MCQ	1	2	\N
cmqw5012b0037u8gj4yu1yjio	cmqw4uyf3002ju8gj1hztdqox	What is the first purpose of applying the Bible?	MCQ	1	3	\N
cmqw50zy9003du8gj1aiuuvbk	cmqw4uyf3002ju8gj1hztdqox	According to Hebrews 4:12, the Word of God discerns what?	MCQ	1	4	\N
cmqw51vih003ju8gj85r7ltgq	cmqw4uyf3002ju8gj1hztdqox	Christian application must be centered on:	MCQ	1	5	\N
cmqw533vp003pu8gj28t7mka4	cmqw4uyf3002ju8gj1hztdqox	According to 2 Timothy 3:16, Scripture is profitable for teaching, reproof, correction, and:\n	MCQ	1	6	\N
cmqw544a1003vu8gj4u9f2xww	cmqw4uyf3002ju8gj1hztdqox	What must the application be built on?	MCQ	1	7	\N
cmqw555zd0041u8gjkebnre0x	cmqw4uyf3002ju8gj1hztdqox	According to the module, Scripture should shape family life in areas such as marriage, parenting, forgiveness, money, speech, and:\n	MCQ	1	8	\N
cmqw57jql0047u8gjnudlvjea	cmqw4uyf3002ju8gj1hztdqox	Christian leaders are:\n	MCQ	1	9	\N
cmqz11bmu000s74imuzmkh5dt	cmqz10aje000q74imd9z77tir	Question 1	MCQ	1	0	\N
cmqz11ys5000x74img075z3nm	cmqz10aje000q74imd9z77tir	Question 2	MCQ	1	1	\N
cmr0lcfdp000eu021cw7kcqpf	cmr0lcfdp000du021txy4pwa1	1. Which passage outlines the qualifications for overseers?	MCQ	1	0	\N
cmr0lcfdp000ju021h8odhl18	cmr0lcfdp000du021txy4pwa1	2. Jesus described Himself as the:	MCQ	1	1	\N
cmr0lcfdp000ou021f63x551z	cmr0lcfdp000du021txy4pwa1	3. According to 1 Peter 5:1–4, elders are to shepherd God's flock:	MCQ	1	2	\N
cmr0lcfdp000tu0216fmcmsod	cmr0lcfdp000du021txy4pwa1	4. Servant leadership is best demonstrated by:	MCQ	1	3	\N
cmr0lcfdp000yu021s32yqipf	cmr0lcfdp000du021txy4pwa1	5. Which quality is required of church leaders according to Titus 1?	MCQ	1	4	\N
cmr0lcfdq001cu021967olkej	cmr0lcfdp001bu021ti905ow9	1. Which passage contains the Great Commission?	MCQ	1	0	\N
cmr0lcfdq001hu021r4s1n14t	cmr0lcfdp001bu021ti905ow9	2. According to Ephesians 4:11–12, church leaders are given to:\n\n	MCQ	1	1	\N
cmr0lcfdq001mu021yudsxk5a	cmr0lcfdp001bu021ti905ow9	3. Paul instructed the Ephesian elders to:	MCQ	1	2	\N
cmr0lcfdq001ru021691qu1qb	cmr0lcfdp001bu021ti905ow9	4. Which attitude is emphasized in Philippians 2?\n	MCQ	1	3	\N
cmr0lcfdq001wu0212kkiiaxu	cmr0lcfdp001bu021ti905ow9	5. Christian leadership should primarily reflect:	MCQ	1	4	\N
cmr0mijpp002qu021ljqkyre8	cmr0mijpp002pu021f1uib6i9	1. Which event marked the birth of the Christian Church?	MCQ	1	0	\N
cmr0mijpp002vu0214lyfja8k	cmr0mijpp002pu021f1uib6i9	2. Who was the first Christian martyr?	MCQ	1	1	\N
cmr0mijpp0030u021lvykhdno	cmr0mijpp002pu021f1uib6i9	3. Which Roman emperor legalized Christianity through the Edict of Milan in AD 313?	MCQ	1	2	\N
cmr0mijpp0035u021bg7rmak2	cmr0mijpp002pu021f1uib6i9	4. Which church council affirmed the deity of Christ in AD 325?	MCQ	1	3	\N
cmr0mijpp003au021sk07wvcr	cmr0mijpp002pu021f1uib6i9	5. Who is known as the "Father of Western Monasticism"?	MCQ	1	4	\N
cmr0mijpq003ou021850j4z41	cmr0mijpq003nu0215f2sz97y	1. Who initiated the Protestant Reformation in 1517?	MCQ	1	0	\N
cmr0mijpq003tu02190qg1qcd	cmr0mijpq003nu0215f2sz97y	2. What document did Martin Luther publish in 1517?	MCQ	1	1	\N
cmr0mijpr003yu021e85c40v3	cmr0mijpq003nu0215f2sz97y	3. Which doctrine emphasizes salvation by faith alone?	MCQ	1	2	\N
cmr0mijpr0043u021tddwddh8	cmr0mijpq003nu0215f2sz97y	4. Who wrote Institutes of the Christian Religion?	MCQ	1	3	\N
cmr0mijpr0048u021ot0xjvmp	cmr0mijpq003nu0215f2sz97y	5. Which movement emphasized global evangelization during the eighteenth and nineteenth centuries?	MCQ	1	4	\N
\.


--
-- Data for Name: Quiz; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Quiz" (id, "lessonId", title, "passingScore", "timeLimit", "maxAttempts", "rubricId") FROM stdin;
cmqm8cx3g000y676prkm8offi	cmqm8cx3c000w676p4tm0ux3m	Week 2 Quiz	70	120	2	\N
cmqm9bhof0004fjta9a419oal	cmqm9bhoc0002fjtamemwjsgb	Week 1 Quiz	70	300	1	\N
cmqmav4z2002qfjta8sk12q8p	cmqmav4yw002ofjta6c5ocmpl	Week 2 Quiz	70	240	3	\N
cmqmagxoz001ifjtap3v7ekhu	cmqmagxos001gfjtatxn5zxo5	Week 1 Quiz	70	180	3	\N
cmqvcavwq000cam5kugbs8l85	cmqvcavwo000aam5kxw6d0fpc	Week 1	70	\N	2	\N
cmqvhbz34000akllcsyf4nh3e	cmqvhbz2q0008kllcj014krxk	Week 2	70	\N	3	\N
cmqviccwa001awhytdk3e2jj3	cmqviccw70018whytpkilfqbn	Week 3 - Quiz	70	\N	3	\N
cmqw3qexe000eu8gjuum8c15h	cmqw3qexa000cu8gjbn7y22wi	Week 4 - Quiz	70	\N	3	\N
cmqw4uyf3002ju8gj1hztdqox	cmqw4uyeu002hu8gjajszz0xk	Week 5 - Quiz	70	\N	3	\N
cmqz10aje000q74imd9z77tir	cmqz10ajb000o74im1xqkw89j	Course 1 Quiz	70	\N	3	\N
cmr0lcfdp000du021txy4pwa1	cmr0lcfdo000bu0217ao4muq9	Week 1 Quiz	70	180	3	\N
cmr0lcfdp001bu021ti905ow9	cmr0lcfdp0019u021s7k8hh0z	Week 2 Quiz	70	240	3	\N
cmr0mijpp002pu021f1uib6i9	cmr0mijpp002nu0211hccv3yz	Week 1 Quiz	70	300	1	\N
cmr0mijpq003nu0215f2sz97y	cmr0mijpq003lu021p1rk3ih5	Week 2 Quiz	70	120	2	\N
\.


--
-- Data for Name: QuizAttempt; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."QuizAttempt" (id, "quizId", "studentId", score, passed, answers, "startedAt", "completedAt") FROM stdin;
cmqp9p1ue0007ai5snv628bxm	cmqmagxoz001ifjtap3v7ekhu	cmqp6pnjo000010tomoljdyc4	60	f	{"cmqmaiod1001kfjtalfgwev8o":"cmqmaiod1001nfjtaxk6sq9l2","cmqmak1ay001qfjta272cjzdk":"cmqmak1ay001sfjtan3e1ieps","cmqmalcwk001wfjta3g37o2lr":"cmqmalcwk001yfjtat4lohwt6","cmqmamfes0022fjtau37xuuwt":"cmqmamfes0024fjta1ji49a9p","cmqmanq9v0028fjtax35vzqnc":"cmqmanq9v002afjta5wdst5bs"}	2026-06-22 13:44:50.582	2026-06-22 13:45:35.143
cmqp9sf0h0009ai5sb2a3q9dm	cmqmagxoz001ifjtap3v7ekhu	cmqp6pnjo000010tomoljdyc4	100	t	{"cmqmaiod1001kfjtalfgwev8o":"cmqmaiod1001mfjtawisrmacg","cmqmak1ay001qfjta272cjzdk":"cmqmak1ay001tfjta8me5z9gc","cmqmalcwk001wfjta3g37o2lr":"cmqmalcwk001yfjtat4lohwt6","cmqmamfes0022fjtau37xuuwt":"cmqmamfes0024fjta1ji49a9p","cmqmanq9v0028fjtax35vzqnc":"cmqmanq9v002afjta5wdst5bs"}	2026-06-22 13:47:27.618	2026-06-22 13:48:02.206
cmqp9ul94000hai5s9lvhip1s	cmqmav4z2002qfjta8sk12q8p	cmqp6pnjo000010tomoljdyc4	60	f	{"cmqmawb38002sfjtabz083w4a":"cmqmawb38002tfjta6p35j5rk","cmqmaxje6002yfjtaszngtc1z":"cmqmaxje6002zfjtamik3aqqy","cmqmaygcy0034fjtazgrmd7ic":"cmqmaygcy0036fjtatp2iw56k","cmqmazbow003afjtat094ha02":"cmqmazbow003efjta5joz8nck","cmqmb06zf003gfjta053o2z64":"cmqmb06zf003jfjtaegr69qk5"}	2026-06-22 13:49:09.016	2026-06-22 13:50:01.817
cmqp9vy8l000jai5sc0uq5ko4	cmqmav4z2002qfjta8sk12q8p	cmqp6pnjo000010tomoljdyc4	100	t	{"cmqmawb38002sfjtabz083w4a":"cmqmawb38002tfjta6p35j5rk","cmqmaxje6002yfjtaszngtc1z":"cmqmaxje60030fjtajrxbnrs6","cmqmaygcy0034fjtazgrmd7ic":"cmqmaygcy0036fjtatp2iw56k","cmqmazbow003afjtat094ha02":"cmqmazbow003cfjtatg7qnni2","cmqmb06zf003gfjta053o2z64":"cmqmb06zf003jfjtaegr69qk5"}	2026-06-22 13:50:12.502	2026-06-22 13:50:30.636
cmqpnj5vi0009hrq8ve1lhjvu	cmqm9bhof0004fjta9a419oal	cmqp6pnjo000010tomoljdyc4	0	f	{}	2026-06-22 20:12:10.494	2026-06-22 20:12:55.574
cmqpof1hf000vhrq89izqyku9	cmqm8cx3g000y676prkm8offi	cmqp6pnjo000010tomoljdyc4	100	t	{"cmqm8r0py0010676pjacvj8tx":"cmqm8r0py0012676pkwc3u3vf","cmqm8syoz0016676pf1wpfvuc":"cmqm8syoz0019676pmbsinawt","cmqm8u3py001c676px5058mj9":"cmqm8u3py001g676px6r784v0","cmqm8vcaf001i676pc0ms9r2b":"cmqm8vcaf001j676p1wa3hjpr","cmqm8web8001o676p3s2ey700":"cmqm8web8001r676p45ikvc8e"}	2026-06-22 20:36:57.796	2026-06-22 20:38:06.433
cmr0ntk4g0019yukun19mwx1u	cmr0mijpp002pu021f1uib6i9	cmqz5i7660000tjftgvoo5j5v	40	f	{"cmr0mijpp002qu021ljqkyre8":"cmr0mijpp002su021slbsx3fa","cmr0mijpp002vu0214lyfja8k":"cmr0mijpp002wu0214t8ym9s2","cmr0mijpp0030u021lvykhdno":"cmr0mijpp0032u021iynykufl","cmr0mijpp0035u021bg7rmak2":"cmr0mijpp0037u0211wp6uvk4","cmr0mijpp003au021sk07wvcr":"cmr0mijpp003du021gqsvcz8v"}	2026-06-30 13:05:43.456	2026-06-30 13:06:19.601
\.


--
-- Data for Name: ReadingMaterial; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ReadingMaterial" (id, "sectionId", title, description, "fileUrl", "fileKey", "fileType", "fileSize", "order", "createdAt") FROM stdin;
cmqm7yqzc0007676pniigiguw	cmqm7o0px0001676p3m8poipq	Week 1 Mateial	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm7o0px0001676p3m8poipq/1781951583565-undefined-certificate.pdf	reading-materials/cmqm7o0px0001676p3m8poipq/1781951583565-undefined-certificate.pdf	pdf	334959	0	2026-06-20 10:33:05.304
cmqm7z6910009676pt9184nm4	cmqm7o0px0001676p3m8poipq	Week 1.2	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm7o0px0001676p3m8poipq/1781951603525-undefined-certificate--3-.pdf	reading-materials/cmqm7o0px0001676p3m8poipq/1781951603525-undefined-certificate--3-.pdf	pdf	334959	1	2026-06-20 10:33:25.093
cmqm87qik000m676p0bgi01un	cmqm84hxm000i676p1tz73xr2	Week 2 Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqm84hxm000i676p1tz73xr2/1781952003828-undefined-certificate--1-.pdf	reading-materials/cmqm84hxm000i676p1tz73xr2/1781952003828-undefined-certificate--1-.pdf	pdf	334959	0	2026-06-20 10:40:04.604
cmqma8s0z0016fjtaisqfkrd5	cmqma3dhl0010fjta6rse61y7	Week 1 Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqma3dhl0010fjta6rse61y7/1781955411103-Bible-Story.pdf	reading-materials/cmqma3dhl0010fjta6rse61y7/1781955411103-Bible-Story.pdf	pdf	139145	0	2026-06-20 11:36:52.452
cmqmatex8002gfjtank6d6kjw	cmqma4r8j0012fjtawds1ajg0	Week 2 Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqma4r8j0012fjtawds1ajg0/1781956373587-undefined-certificate.pdf	reading-materials/cmqma4r8j0012fjtawds1ajg0/1781956373587-undefined-certificate.pdf	pdf	334959	0	2026-06-20 11:52:55.245
cmqvc94yi0005am5kwl1m72y5	cmqus6esy000bcncwdmaajv17	Class Notes	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqus6esy000bcncwdmaajv17/1782502982694-Module1-UnderstandingtheBible-CTh-Notes.pdf	reading-materials/cmqus6esy000bcncwdmaajv17/1782502982694-Module1-UnderstandingtheBible-CTh-Notes.pdf	pdf	119719	0	2026-06-26 19:43:04.027
cmqvc9wsf0007am5kaym5m871	cmqus6esy000bcncwdmaajv17	Week 1 - Reading Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqus6esy000bcncwdmaajv17/1782503019715-AGeneralIntroductiontotheBible-Reading-Module1.pdf	reading-materials/cmqus6esy000bcncwdmaajv17/1782503019715-AGeneralIntroductiontotheBible-Reading-Module1.pdf	pdf	740056	1	2026-06-26 19:43:40.096
cmqvgz9tw0005kllcpjdg3srr	cmqvgr97z0001kllc17lapea1	Week 2 - Class Notes	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqvgr97z0001kllc17lapea1/1782510920765-Module2-UnderstandingtheBible.pdf	reading-materials/cmqvgr97z0001kllc17lapea1/1782510920765-Module2-UnderstandingtheBible.pdf	pdf	138574	0	2026-06-26 21:55:21.86
cmqvhr7kl0001whytcyi5u4yw	cmqvgr97z0001kllc17lapea1	Week 2 - Reading Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqvgr97z0001kllc17lapea1/1782512224062-MajorBibleThemesLewisSperryChaferJohnFWalvoord-Reading-Module2.pdf	reading-materials/cmqvgr97z0001kllc17lapea1/1782512224062-MajorBibleThemesLewisSperryChaferJohnFWalvoord-Reading-Module2.pdf	pdf	362498	1	2026-06-26 22:17:05.3
cmqvi9iol0013whyt6ehfgufw	cmqvi6rcr000zwhytsnxuxk6g	Week 3 - Class Notes	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqvi6rcr000zwhytsnxuxk6g/1782513078729-Module3-UnderstandingtheBible.pdf	reading-materials/cmqvi6rcr000zwhytsnxuxk6g/1782513078729-Module3-UnderstandingtheBible.pdf	pdf	108402	0	2026-06-26 22:31:19.51
cmqvib47h0015whytermg1q2g	cmqvi6rcr000zwhytsnxuxk6g	Week 3 - Reading Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqvi6rcr000zwhytsnxuxk6g/1782513153745-MajorBibleThemesLewisSperryChaferJohnFWalvoord-Module3.pdf	reading-materials/cmqvi6rcr000zwhytsnxuxk6g/1782513153745-MajorBibleThemesLewisSperryChaferJohnFWalvoord-Module3.pdf	pdf	357874	1	2026-06-26 22:32:34.062
cmqw3odij0007u8gjc9e1onig	cmqw3bg480001u8gjdkuzlmck	Week 4 - Class Notes	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqw3bg480001u8gjdkuzlmck/1782549043325-Module4-UnderstandingtheBible.pdf	reading-materials/cmqw3bg480001u8gjdkuzlmck/1782549043325-Module4-UnderstandingtheBible.pdf	pdf	735407	0	2026-06-27 08:30:44.588
cmqw3p44n0009u8gji7mm6p6g	cmqw3bg480001u8gjdkuzlmck	Week 4 - Reading Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqw3bg480001u8gjdkuzlmck/1782549078578-How_To_Read_The_Bible-Reading-Module4.pdf	reading-materials/cmqw3bg480001u8gjdkuzlmck/1782549078578-How_To_Read_The_Bible-Reading-Module4.pdf	pdf	569387	1	2026-06-27 08:31:19.079
cmqw4u37y002cu8gj4us8gx7p	cmqw4cfhv0026u8gjymtncomp	Week 5 - Class Notes	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqw4cfhv0026u8gjymtncomp/1782550990037-Module5-UnderstandingBible.pdf	reading-materials/cmqw4cfhv0026u8gjymtncomp/1782550990037-Module5-UnderstandingBible.pdf	pdf	97904	0	2026-06-27 09:03:10.798
cmqw4uk6v002eu8gjcn31p0ad	cmqw4cfhv0026u8gjymtncomp	Week 5 - Reading Material	\N	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqw4cfhv0026u8gjymtncomp/1782551012324-TheHandbookofBibleApplicationTyndale-Module5.pdf	reading-materials/cmqw4cfhv0026u8gjymtncomp/1782551012324-TheHandbookofBibleApplicationTyndale-Module5.pdf	pdf	1300133	1	2026-06-27 09:03:32.791
cmqz0xefp000974imstoy5buq	cmqz0r7fr000374impkqp5nfa	Course 1 Reading	Course 1 Reading Description	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqz0r7fr000374impkqp5nfa/1782725824103-Course1Reading.pdf	reading-materials/cmqz0r7fr000374impkqp5nfa/1782725824103-Course1Reading.pdf	pdf	185967	0	2026-06-29 09:37:05.365
cmqz0xzx4000b74im54hhc2aa	cmqz0r7fr000374impkqp5nfa	Course 2 Reading	Course 2 Reading Description	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/reading-materials/cmqz0r7fr000374impkqp5nfa/1782725852918-Course2Reading.pdf	reading-materials/cmqz0r7fr000374impkqp5nfa/1782725852918-Course2Reading.pdf	pdf	186249	1	2026-06-29 09:37:33.209
\.


--
-- Data for Name: ReadingMaterialProgress; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ReadingMaterialProgress" (id, "enrollmentId", "readingMaterialId", "completedAt") FROM stdin;
cmqp8gqln000nmjfl20do5r8l	cmqp6pov8000410toqzo6alhn	cmqmatex8002gfjtank6d6kjw	2026-06-26 15:35:32.177
cmqpni6ft0007hrq8hp0y68ah	cmqp9xtcr000xai5scf4hdpcc	cmqm7z6910009676pt9184nm4	2026-06-26 18:00:50.485
cmqpoeuw9000thrq85wny66th	cmqp9xtcr000xai5scf4hdpcc	cmqm87qik000m676p0bgi01un	2026-06-26 18:01:01.498
cmqpnhuvw0005hrq8yj120kq1	cmqp9xtcr000xai5scf4hdpcc	cmqm7yqzc0007676pniigiguw	2026-06-27 09:56:37.948
cmqp8294v0003mjflnamef2ei	cmqp6pov8000410toqzo6alhn	cmqma8s0z0016fjtaisqfkrd5	2026-06-28 09:36:57.553
\.


--
-- Data for Name: ReferenceForm; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."ReferenceForm" (id, "applicationId", "referenceIndex", type, "yearsKnown", "capacityKnown", "churchEngagement", "spiritualInfluence", ratings, "financialAbility", "financialHelp", comments, "attentionAreas", "discussFurther", recommendation, "refereeName", "refereePosition", "churchName", denomination, address, phone, email, "signatureUrl", "createdAt", "updatedAt") FROM stdin;
cmqoydcta000658gf6minh55q	cmqoxx4m2000358gf5cavn0d5	2	GENERAL	4 years	Pastor	Enthusiastic	Evangelistic	{"Christian Commitment":"Above Average","Spiritual Maturity":"Excellent","Christian Character/Testimony":"Excellent","Attitude to Authority":"Excellent","Sense of Responsibility":"Excellent","Ability to Study in English":"Average","Willingness to Learn":"Above Average","Ability to Work with Others":"Above Average","Willingness to Help Others":"Excellent","Integrity/Honesty":"Excellent","Leadership Ability":"Above Average","Relationship with the Family":"Excellent"}	Would need some help		personal	spiritual	f	I recommend with reservation	Joel R Tharakan	pastor			{"line1":"Hennur ","city":"Bengaluru","state":"Karnataka","zip":"560077"}	8050500515	joelrtharakan.in@gmail.com	Joel	2026-06-22 08:27:48.73	2026-06-22 08:27:48.73
cmqoytkw9000958gf0j4m1myv	cmqoxx4m2000358gf5cavn0d5	1	PASTOR	4	Senior Pastor	Enthusiastic	Positive	{"Christian Commitment":"Excellent","Spiritual Maturity":"Average","Christian Character/Testimony":"Excellent","Attitude to Authority":"Above Average","Sense of Responsibility":"Above Average","Ability to Study in English":"Above Average","Willingness to Learn":"Excellent","Ability to Work with Others":"Excellent","Willingness to Help Others":"Excellent","Integrity/Honesty":"Above Average","Leadership Ability":"Above Average","Relationship with the Family":"Above Average"}	Unable to pay	Raise support	hiuiyu		t	I strongly recommend	Dr. Reeju Tharakan	Senior Pastor	cw	ag	{"line1":"fdfdfdfd","city":"fdfdfdfd","state":"fdfd","zip":"fdfd"}	asfd	joelrtharakan880@gmail.com	fdffdf	2026-06-22 08:40:25.699	2026-06-22 08:40:25.699
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."Review" (id, "courseId", "studentId", rating, comment, "isApproved", "createdAt") FROM stdin;
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
cmqm7o0px0001676p3m8poipq	cmqm4xmwo0005fzym9rhv5byg	Week 1: The Early Church and the Medieval Period	This course provides a survey of the historical development of Christianity and the major theological traditions that have shaped the Church from the apostolic era to the present day. Students will examine significant events, influential leaders, ecumenical councils, the Protestant Reformation, missionary movements, and contemporary theological developments. Through the study of church history and historical theology, students will gain a deeper understanding of the continuity of the Christian faith and its relevance for ministry in the modern world.	[]	\N	f	0
cmqm84hxm000i676p1tz73xr2	cmqm4xmwo0005fzym9rhv5byg	Week 2: The Reformation and Modern Christianity	This module examines the Protestant Reformation and its theological significance, the rise of missionary movements, and the growth of Christianity throughout the modern era. Students will also consider contemporary challenges and opportunities facing the Church in the twenty-first century.	[]	\N	f	1
cmqma3dhl0010fjta6rse61y7	cmqm3bas20005pm88e08zdgem	Week 1: Foundations of Pastoral Ministry	This module introduces students to the biblical understanding of pastoral ministry and Christian leadership. Students will examine the qualifications and responsibilities of pastors, the model of servant leadership demonstrated by Jesus Christ, and the importance of shepherding God's people with love and faithfulness.	[]	\N	f	0
cmqma4r8j0012fjtawds1ajg0	cmqm3bas20005pm88e08zdgem	Week 2: Christian Leadership and Ministry Practice	This module focuses on the practical aspects of Christian leadership, including spiritual formation, discipleship, church administration, pastoral counseling, and ministry development. Students will explore ways to effectively lead congregations while maintaining personal spiritual growth and integrity.	[]	\N	f	1
cmqus6esy000bcncwdmaajv17	cmqurk9xx0003cncwyp5wnvhs	Week 1: General Introduction to the Bible	This week introduces students to the Bible as the inspired Word of God and the foundation of Christian faith and life. This module explains the meaning, structure, authority, inspiration, divine and human nature, and canon of the Bible. Students will also learn how the Bible was written, its major divisions, and why Scripture is trustworthy, authoritative, and essential for understanding God’s plan of salvation.	[]	\N	f	0
cmqvgr97z0001kllc17lapea1	cmqurk9xx0003cncwyp5wnvhs	Week 2 - The Structure and Major Bible Themes: The Old Testament	Module 2 introduces students to the structure, divisions, authorship, and major themes of the Old Testament. This module helps students understand the Law, the Historical Books, the Wisdom and Poetry Books, the Major Prophets, and the Minor Prophets. It also shows how Old Testament themes such as creation, sin, covenant, holiness, sacrifice, kingship, prophecy, and redemption prepare the way for Jesus Christ and connect with the message of the New Testament.	[]	\N	f	1
cmqvi6rcr000zwhytsnxuxk6g	cmqurk9xx0003cncwyp5wnvhs	Week 3 - The Structure and Major Bible Themes: The New Testament	Module 3 introduces students to the structure, divisions, authorship, and major themes of the New Testament. This module helps students understand the Gospels, Acts, Pauline Epistles, General Epistles, and Revelation. It shows how Jesus Christ fulfills God’s promises, how the Church begins and grows through the Holy Spirit, and how the New Testament teaches salvation, Christian living, mission, worship, holiness, hope, and the final victory of Christ.	[]	\N	f	2
cmqw3bg480001u8gjdkuzlmck	cmqurk9xx0003cncwyp5wnvhs	Week 4 - Principles of Biblical Learning: Recognizing Literary Genres and Reading Scripture in Its Historical and Cultural Context	Module 4 introduces students to important principles for studying and interpreting the Bible correctly. This module teaches students how to recognize different biblical genres, understand historical and cultural context, observe grammar, and seek the author’s intended meaning. It also helps students learn how to read narratives, law, poetry, prophecy, parables, epistles, and apocalyptic writings with care, so that Scripture may be understood and applied faithfully.	[]	\N	f	3
cmqw4cfhv0026u8gjymtncomp	cmqurk9xx0003cncwyp5wnvhs	Week 5 - Applying the Bible in Christian Life, Ministry, and Leadership	Module 5 helps students move from understanding the Bible to faithfully applying it in daily life, family, church, ministry, and leadership. This module teaches that Scripture must shape our beliefs, character, decisions, relationships, worship, service, and mission. Students will learn that true Bible study leads to obedience, transformation, Christ-centered living, and faithful leadership under the authority of God’s Word.	[]	\N	f	4
cmqw5dm7u004fu8gjxq60qrgs	cmqurk9xx0003cncwyp5wnvhs	Week 6 - Final Exam		[]	\N	f	5
cmqz0r7fr000374impkqp5nfa	cmqz0ph7p000174imnri1fnic	01	Module 1 Description	[]	\N	f	0
cmr0lcfdo0005u0217zb7isrt	cmr0lcfdn0002u0217dg9nqqb	Week 1: Foundations of Pastoral Ministry	This module introduces students to the biblical understanding of pastoral ministry and Christian leadership. Students will examine the qualifications and responsibilities of pastors, the model of servant leadership demonstrated by Jesus Christ, and the importance of shepherding God's people with love and faithfulness.	[]	\N	f	0
cmr0lcfdp0013u021czt9m44e	cmr0lcfdn0002u0217dg9nqqb	Week 2: Christian Leadership and Ministry Practice	This module focuses on the practical aspects of Christian leadership, including spiritual formation, discipleship, church administration, pastoral counseling, and ministry development. Students will explore ways to effectively lead congregations while maintaining personal spiritual growth and integrity.	[]	\N	f	1
cmr0mijpo002gu021akgxag2m	cmr0mijpo002du0214hzcic1f	Week 1: The Early Church and the Medieval Period	This course provides a survey of the historical development of Christianity and the major theological traditions that have shaped the Church from the apostolic era to the present day. Students will examine significant events, influential leaders, ecumenical councils, the Protestant Reformation, missionary movements, and contemporary theological developments. Through the study of church history and historical theology, students will gain a deeper understanding of the continuity of the Christian faith and its relevance for ministry in the modern world.	[]	\N	f	0
cmr0mijpq003fu021nxyoiy8b	cmr0mijpo002du0214hzcic1f	Week 2: The Reformation and Modern Christianity	This module examines the Protestant Reformation and its theological significance, the rise of missionary movements, and the growth of Christianity throughout the modern era. Students will also consider contemporary challenges and opportunities facing the Church in the twenty-first century.	[]	\N	f	1
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."SiteSettings" (id, "siteName", "logoUrl", tagline, "contactEmail", "contactWhatsApp", "primaryColor", "smtpConfig", "stripeConfig", "storageConfig", "updatedAt") FROM stdin;
cmqku2zfs007f3u1qauy3l7qd	CWAY Academy	\N	Coach. Challenge. Commission.	support@cwayacademy.com	+919663831220	#C9973A	\N	\N	\N	2026-06-19 11:16:42.088
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
cmqp9xt4i000rai5syn87c6cb	cmqmaunv7002lfjtayb3y966e	cmqp6pnjo000010tomoljdyc4		https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/submissions/1782136298281-Screenshot--30183-.png	2026-06-22 13:51:39.186	24		2026-06-22 13:54:42.319	t
cmqp9nqms0001ai5s910kiw7t	cmqmab2yh001bfjtathv2kork	cmqp6pnjo000010tomoljdyc4	vfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdgvfgbfbdgbdg	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/submissions/1782135828075-Screenshot--30183-.png	2026-06-22 13:43:49.396	24		2026-06-22 13:54:52.472	t
cmqpojdiq0015hrq8mk9rb5wj	cmqm88xou000r676pqmmgppo8	cmqp6pnjo000010tomoljdyc4		https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/submissions/1782160819652-Old-Testament-Answer-Key.png	2026-06-22 20:40:20.018	\N	\N	\N	f
cmqqjeb97000111tu93p49zj1	cmqm80ohd000e676p6czu0aux	cmqp6pnjo000010tomoljdyc4	My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.\r\n\r\nMy life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.My life has been amazing.	\N	2026-06-23 11:04:11.899	\N	\N	\N	f
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public."User" (id, name, email, "passwordHash", role, avatar, bio, phone, church, location, "preferredLanguage", "isVerified", "isBanned", "payoutPercentage", "emailVerifyToken", "resetToken", "resetTokenExpiry", "googleId", "createdAt", "updatedAt", "socialLinks", title, credentials, "yearsExperience", expertise, "notificationPrefs", "lastLoginAt", "lastLogoutAt", "appActiveSeconds") FROM stdin;
cmqku2zby00023u1qy4o9yich	Pr. Robin Ninan	pr.robin@cwayacademy.com	$2b$12$uyuVqkBdoUtDZiZp.bCrCutMtvfAS9m9rNhM45WAQ58SXwqwCsUNW	INSTRUCTOR	\N	Holding a Master of Divinity and extensive experience in leadership, management, and media. Secretary-Trustee of CWAY Missions Religious Trust, Bangalore.	\N	CWAY Missions	Bangalore, India	ENGLISH	t	f	0	\N	\N	\N	\N	2026-06-19 11:16:41.95	2026-06-20 09:27:39.205	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zct000k3u1qegpd6yok	Reviewer 1	reviewer1@cway.dev	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.982	2026-06-19 11:16:41.982	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zd0000n3u1q8wvzo2kx	Reviewer 2	reviewer2@cway.dev	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.988	2026-06-19 11:16:41.988	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zd4000q3u1q3cmhdn0m	Reviewer 3	reviewer3@cway.dev	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.993	2026-06-19 11:16:41.993	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zeo004t3u1qdff43hnt	Rahul Sharma	student1@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Grace Bible Church	Kerala	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.049	2026-06-19 11:16:42.049	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zep004u3u1q9vsn4vwi	Priya Nair	student2@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Bethel Fellowship	Tamil Nadu	TAMIL	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.05	2026-06-19 11:16:42.05	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zeq004v3u1qxmenxe88	Samuel David	student3@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Emmanuel Assembly	Karnataka	TELUGU	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.05	2026-06-19 11:16:42.05	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zeq004w3u1qss13hsfr	Mary Thomas	student4@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Zion Chapel	Andhra Pradesh	MALAYALAM	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.051	2026-06-19 11:16:42.051	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zer004x3u1q5zxvdqbs	Amit Patel	student5@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Calvary Tabernacle	Maharashtra	KANNADA	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.052	2026-06-19 11:16:42.052	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zes004y3u1qxcgenhbm	Shalini Kumari	student6@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Hebron Assembly	Jharkhand	HINDI	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.052	2026-06-19 11:16:42.052	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zet004z3u1qsf61dlmm	Ebenezer Paul	student7@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Trinity Covenant	Assam	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.053	2026-06-19 11:16:42.053	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zet00503u1q3tos24vz	Rupali Das	student8@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Redeemer Assembly	West Bengal	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.054	2026-06-19 11:16:42.054	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zeu00513u1q4ljp2a52	John Wesley	student9@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Faith Mission	Uttar Pradesh	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.054	2026-06-19 11:16:42.054	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zeu00523u1qd33zl1p7	Mercy Mathew	student10@test.com	$2b$12$ZrQzKEEu6XwGD4Nvuc30GuIfLYB3iZJ9Yar5feSoSdxlCucoleuOC	STUDENT	\N	\N	\N	Hope Fellowship	Telangana	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:42.055	2026-06-19 11:16:42.055	\N	\N	\N	\N	[]	{}	\N	\N	0
cmquqt72f0000cncw4qq1gp70	Dr. Reeju Tharakan	tharakanreeju@gmail.com	$2b$10$5kryzJMKl14/6ZLJRGrPAOf25ccaDRIYOUIgAPxoERIzvMngrBeuq	INSTRUCTOR	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-26 09:42:48.328	2026-06-26 19:34:55.975	\N	\N	\N	\N	[]	{}	2026-06-26 19:34:55.974	2026-06-26 18:44:50.746	0
cmqz1d0gj001174imfxe1gus2	Tech01	tech01@cwayacademy.com	$2b$10$H36gCLr.NfX15msm834AIuhaNVcZ04oSVUyePViMsBr.OBKmLeXom	INSTRUCTOR	\N	\N	\N	\N	\N	ENGLISH	t	f	10	\N	\N	\N	\N	2026-06-29 09:49:13.747	2026-06-29 09:49:27.975	\N	\N	\N	\N	[]	{}	\N	\N	0
cmqku2zbu00013u1qbthq3afd	Dr. Reeju Tharakan	dr.reeju@cwayacademy.com	$2b$08$.h6EiZAb41u9aNg71axTD.6xW9uo8HhK1PWHyL75ZqtYYzhI.PkNa	INSTRUCTOR	\N	With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education. Lead Pastor of Immanuel AG Church in Dubai and President-Trustee of CWAY Missions.	\N	Immanuel AG Church, Dubai	Dubai, UAE	ENGLISH	t	f	0	\N	\N	\N	\N	2026-06-19 11:16:41.947	2026-07-06 18:30:07.454	\N	\N	\N	\N	[]	{}	2026-07-06 18:30:07.449	2026-07-06 18:27:28.267	0
cmqz5i7660000tjftgvoo5j5v	Main Registrar	registrar@cwayacademy.com	$2b$08$TVbPdexiNqMNmT2NwqNRveToUyxh5HpX4zO60kYvaqfNkhwBzbkZS	REGISTRAR	\N	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-29 11:45:14.19	2026-07-06 08:15:41.286	\N	\N	\N	\N	[]	{}	2026-07-06 08:15:41.192	2026-07-05 16:03:47.993	0
cmqku2zbo00003u1qrtqtk0h8	CWAY Admin	admin@cwayacademy.com	$2b$08$qmDp3Tk06xEHq4/cUDVxiOiWzQSsVfVNPSvXttJWWDd6eS3hmX3Qq	ADMIN	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781889985771-cmqku2zbo00003u1qrtqtk0h8.jpeg	\N	\N	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-19 11:16:41.941	2026-07-04 16:27:28.856	\N	\N	\N	\N	[]	{}	2026-07-04 16:27:28.847	2026-07-02 15:59:35.447	0
cmql8quqk0000h58xt3rfj7uo	Joel R Tharakan	joelrtharakan@gmail.com	$2b$08$whjJSZp22MdpdhZ/RuJdzuGZ.lTrCJvAG65HK.aZfHBOyQozbAJgC	INSTRUCTOR	https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/avatars/1781892569411-cmql8quqk0000h58xt3rfj7uo.jpeg		+91 6360238632	Crossway AG Church	BENGALURU	ENGLISH	t	f	0	\N	\N	\N	\N	2026-06-19 18:07:10.364	2026-07-16 15:41:10.33	\N	Mr.	B.Tech	1	[]	{}	2026-07-16 15:41:02.347	2026-07-16 15:41:10.329	0
cmqp6pnjo000010tomoljdyc4	testing testing testing	joelrtharakan880@gmail.com	$2b$08$2Rac2Jh0DVdd62Iag9ynruvPyXuLBvaj7nlmiGIKgjeVv/5gZlh2K	STUDENT	\N	\N	+91 6360238632	\N	\N	ENGLISH	t	f	70	\N	\N	\N	\N	2026-06-22 12:21:19.86	2026-07-16 15:40:46.111	\N	\N	\N	\N	[]	{}	2026-07-16 15:35:10.125	2026-07-16 15:40:46.111	0
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: cway
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
edce18fe-2397-4e91-a054-e8c012145bd4	5a22a5f113524a60e8cc93a92d15072d8728bd8fd0a7c072d414f99c90952dba	2026-06-17 09:56:25.936779+00	20260617095518_init_postgres		\N	2026-06-17 09:56:25.936779+00	0
36e5ef31-a01a-4d13-860a-206a44ce7961	5a22a5f113524a60e8cc93a92d15072d8728bd8fd0a7c072d414f99c90952dba	\N	20260617130545_init_postgres	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260617130545_init_postgres\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "User" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"User\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1164), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260617130545_init_postgres"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260617130545_init_postgres"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:202	2026-06-22 12:52:53.515696+00	2026-06-21 23:06:40.288036+00	0
fec7166b-8585-4855-aa98-2d61743d870e	5a22a5f113524a60e8cc93a92d15072d8728bd8fd0a7c072d414f99c90952dba	2026-06-22 12:52:54.381691+00	20260617130545_init_postgres		\N	2026-06-22 12:52:54.381691+00	0
\.


--
-- Name: ActivityLog ActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY (id);


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
-- Name: ProgramApplication ProgramApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ProgramApplication"
    ADD CONSTRAINT "ProgramApplication_pkey" PRIMARY KEY (id);


--
-- Name: ProgramEnrollment ProgramEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ProgramEnrollment"
    ADD CONSTRAINT "ProgramEnrollment_pkey" PRIMARY KEY (id);


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
-- Name: ReferenceForm ReferenceForm_pkey; Type: CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReferenceForm"
    ADD CONSTRAINT "ReferenceForm_pkey" PRIMARY KEY (id);


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
-- Name: ActivityLog_action_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ActivityLog_action_idx" ON public."ActivityLog" USING btree (action);


--
-- Name: ActivityLog_createdAt_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ActivityLog_createdAt_idx" ON public."ActivityLog" USING btree ("createdAt");


--
-- Name: ActivityLog_resource_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ActivityLog_resource_idx" ON public."ActivityLog" USING btree (resource);


--
-- Name: ActivityLog_status_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ActivityLog_status_idx" ON public."ActivityLog" USING btree (status);


--
-- Name: ActivityLog_userId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ActivityLog_userId_idx" ON public."ActivityLog" USING btree ("userId");


--
-- Name: Announcement_authorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Announcement_authorId_idx" ON public."Announcement" USING btree ("authorId");


--
-- Name: Announcement_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Announcement_courseId_idx" ON public."Announcement" USING btree ("courseId");


--
-- Name: Announcement_sectionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Announcement_sectionId_idx" ON public."Announcement" USING btree ("sectionId");


--
-- Name: Answer_questionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Answer_questionId_idx" ON public."Answer" USING btree ("questionId");


--
-- Name: Assignment_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Assignment_lessonId_key" ON public."Assignment" USING btree ("lessonId");


--
-- Name: Assignment_rubricId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Assignment_rubricId_idx" ON public."Assignment" USING btree ("rubricId");


--
-- Name: AttendanceRecord_sessionId_studentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON public."AttendanceRecord" USING btree ("sessionId", "studentId");


--
-- Name: AttendanceRecord_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "AttendanceRecord_studentId_idx" ON public."AttendanceRecord" USING btree ("studentId");


--
-- Name: AttendanceSession_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "AttendanceSession_courseId_idx" ON public."AttendanceSession" USING btree ("courseId");


--
-- Name: AttendanceSession_sectionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "AttendanceSession_sectionId_idx" ON public."AttendanceSession" USING btree ("sectionId");


--
-- Name: BlogPost_authorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "BlogPost_authorId_idx" ON public."BlogPost" USING btree ("authorId");


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
-- Name: Certificate_certificateNumber_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON public."Certificate" USING btree ("certificateNumber");


--
-- Name: Certificate_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Certificate_courseId_idx" ON public."Certificate" USING btree ("courseId");


--
-- Name: Certificate_programId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Certificate_programId_idx" ON public."Certificate" USING btree ("programId");


--
-- Name: Certificate_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Certificate_studentId_idx" ON public."Certificate" USING btree ("studentId");


--
-- Name: Certificate_templateId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Certificate_templateId_idx" ON public."Certificate" USING btree ("templateId");


--
-- Name: Certificate_uniqueCode_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Certificate_uniqueCode_key" ON public."Certificate" USING btree ("uniqueCode");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Coupon_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Coupon_courseId_idx" ON public."Coupon" USING btree ("courseId");


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
-- Name: Course_categoryId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_categoryId_idx" ON public."Course" USING btree ("categoryId");


--
-- Name: Course_instructorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_instructorId_idx" ON public."Course" USING btree ("instructorId");


--
-- Name: Course_isFeatured_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Course_isFeatured_idx" ON public."Course" USING btree ("isFeatured");


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
-- Name: DiscussionReply_authorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "DiscussionReply_authorId_idx" ON public."DiscussionReply" USING btree ("authorId");


--
-- Name: DiscussionReply_discussionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "DiscussionReply_discussionId_idx" ON public."DiscussionReply" USING btree ("discussionId");


--
-- Name: Discussion_authorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Discussion_authorId_idx" ON public."Discussion" USING btree ("authorId");


--
-- Name: Discussion_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Discussion_courseId_idx" ON public."Discussion" USING btree ("courseId");


--
-- Name: Discussion_lessonId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Discussion_lessonId_idx" ON public."Discussion" USING btree ("lessonId");


--
-- Name: Discussion_sectionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Discussion_sectionId_idx" ON public."Discussion" USING btree ("sectionId");


--
-- Name: EmailTemplate_name_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "EmailTemplate_name_key" ON public."EmailTemplate" USING btree (name);


--
-- Name: Enrollment_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_courseId_idx" ON public."Enrollment" USING btree ("courseId");


--
-- Name: Enrollment_enrolledAt_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_enrolledAt_idx" ON public."Enrollment" USING btree ("enrolledAt");


--
-- Name: Enrollment_paymentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_paymentId_idx" ON public."Enrollment" USING btree ("paymentId");


--
-- Name: Enrollment_sponsorshipId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_sponsorshipId_idx" ON public."Enrollment" USING btree ("sponsorshipId");


--
-- Name: Enrollment_status_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Enrollment_status_idx" ON public."Enrollment" USING btree (status);


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
-- Name: ForumPost_authorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ForumPost_authorId_idx" ON public."ForumPost" USING btree ("authorId");


--
-- Name: ForumPost_forumId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ForumPost_forumId_idx" ON public."ForumPost" USING btree ("forumId");


--
-- Name: ForumReply_authorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ForumReply_authorId_idx" ON public."ForumReply" USING btree ("authorId");


--
-- Name: ForumReply_postId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ForumReply_postId_idx" ON public."ForumReply" USING btree ("postId");


--
-- Name: Forum_courseId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Forum_courseId_key" ON public."Forum" USING btree ("courseId");


--
-- Name: LessonProgress_enrollmentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "LessonProgress_enrollmentId_idx" ON public."LessonProgress" USING btree ("enrollmentId");


--
-- Name: LessonProgress_enrollmentId_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON public."LessonProgress" USING btree ("enrollmentId", "lessonId");


--
-- Name: LessonProgress_lessonId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "LessonProgress_lessonId_idx" ON public."LessonProgress" USING btree ("lessonId");


--
-- Name: Lesson_sectionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Lesson_sectionId_idx" ON public."Lesson" USING btree ("sectionId");


--
-- Name: Message_receiverId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Message_receiverId_idx" ON public."Message" USING btree ("receiverId");


--
-- Name: Message_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Message_senderId_receiverId_idx" ON public."Message" USING btree ("senderId", "receiverId");


--
-- Name: Note_lessonId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Note_lessonId_idx" ON public."Note" USING btree ("lessonId");


--
-- Name: Note_studentId_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Note_studentId_lessonId_key" ON public."Note" USING btree ("studentId", "lessonId");


--
-- Name: Notification_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Notification_userId_createdAt_idx" ON public."Notification" USING btree ("userId", "createdAt");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: Payment_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Payment_courseId_idx" ON public."Payment" USING btree ("courseId");


--
-- Name: Payment_status_createdAt_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Payment_status_createdAt_idx" ON public."Payment" USING btree (status, "createdAt");


--
-- Name: Payment_stripePaymentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON public."Payment" USING btree ("stripePaymentId");


--
-- Name: Payment_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Payment_studentId_idx" ON public."Payment" USING btree ("studentId");


--
-- Name: PayoutRequest_instructorId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "PayoutRequest_instructorId_idx" ON public."PayoutRequest" USING btree ("instructorId");


--
-- Name: ProgramApplication_email_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ProgramApplication_email_idx" ON public."ProgramApplication" USING btree (email);


--
-- Name: ProgramApplication_programId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ProgramApplication_programId_idx" ON public."ProgramApplication" USING btree ("programId");


--
-- Name: ProgramApplication_reference1Token_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "ProgramApplication_reference1Token_key" ON public."ProgramApplication" USING btree ("reference1Token");


--
-- Name: ProgramApplication_reference2Token_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "ProgramApplication_reference2Token_key" ON public."ProgramApplication" USING btree ("reference2Token");


--
-- Name: ProgramEnrollment_programId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ProgramEnrollment_programId_idx" ON public."ProgramEnrollment" USING btree ("programId");


--
-- Name: ProgramEnrollment_studentId_programId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "ProgramEnrollment_studentId_programId_key" ON public."ProgramEnrollment" USING btree ("studentId", "programId");


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
-- Name: QuizAttempt_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "QuizAttempt_studentId_idx" ON public."QuizAttempt" USING btree ("studentId");


--
-- Name: Quiz_lessonId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Quiz_lessonId_key" ON public."Quiz" USING btree ("lessonId");


--
-- Name: Quiz_rubricId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Quiz_rubricId_idx" ON public."Quiz" USING btree ("rubricId");


--
-- Name: ReadingMaterialProgress_enrollmentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ReadingMaterialProgress_enrollmentId_idx" ON public."ReadingMaterialProgress" USING btree ("enrollmentId");


--
-- Name: ReadingMaterialProgress_enrollmentId_readingMaterialId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "ReadingMaterialProgress_enrollmentId_readingMaterialId_key" ON public."ReadingMaterialProgress" USING btree ("enrollmentId", "readingMaterialId");


--
-- Name: ReadingMaterialProgress_readingMaterialId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ReadingMaterialProgress_readingMaterialId_idx" ON public."ReadingMaterialProgress" USING btree ("readingMaterialId");


--
-- Name: ReadingMaterial_sectionId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "ReadingMaterial_sectionId_idx" ON public."ReadingMaterial" USING btree ("sectionId");


--
-- Name: ReferenceForm_applicationId_referenceIndex_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "ReferenceForm_applicationId_referenceIndex_key" ON public."ReferenceForm" USING btree ("applicationId", "referenceIndex");


--
-- Name: Review_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Review_courseId_idx" ON public."Review" USING btree ("courseId");


--
-- Name: Review_courseId_studentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Review_courseId_studentId_key" ON public."Review" USING btree ("courseId", "studentId");


--
-- Name: Review_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Review_studentId_idx" ON public."Review" USING btree ("studentId");


--
-- Name: RubricCriteria_rubricId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "RubricCriteria_rubricId_idx" ON public."RubricCriteria" USING btree ("rubricId");


--
-- Name: RubricLevel_criteriaId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "RubricLevel_criteriaId_idx" ON public."RubricLevel" USING btree ("criteriaId");


--
-- Name: Rubric_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Rubric_courseId_idx" ON public."Rubric" USING btree ("courseId");


--
-- Name: Section_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Section_courseId_idx" ON public."Section" USING btree ("courseId");


--
-- Name: Sponsorship_courseId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Sponsorship_courseId_idx" ON public."Sponsorship" USING btree ("courseId");


--
-- Name: Sponsorship_stripePaymentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Sponsorship_stripePaymentId_key" ON public."Sponsorship" USING btree ("stripePaymentId");


--
-- Name: Sponsorship_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Sponsorship_studentId_idx" ON public."Sponsorship" USING btree ("studentId");


--
-- Name: Submission_assignmentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Submission_assignmentId_idx" ON public."Submission" USING btree ("assignmentId");


--
-- Name: Submission_assignmentId_studentId_key; Type: INDEX; Schema: public; Owner: cway
--

CREATE UNIQUE INDEX "Submission_assignmentId_studentId_key" ON public."Submission" USING btree ("assignmentId", "studentId");


--
-- Name: Submission_studentId_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "Submission_studentId_idx" ON public."Submission" USING btree ("studentId");


--
-- Name: User_createdAt_idx; Type: INDEX; Schema: public; Owner: cway
--

CREATE INDEX "User_createdAt_idx" ON public."User" USING btree ("createdAt");


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
-- Name: ActivityLog ActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
    ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certificate Certificate_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
    ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ProgramApplication ProgramApplication_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ProgramApplication"
    ADD CONSTRAINT "ProgramApplication_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramEnrollment ProgramEnrollment_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ProgramEnrollment"
    ADD CONSTRAINT "ProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramEnrollment ProgramEnrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ProgramEnrollment"
    ADD CONSTRAINT "ProgramEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ReferenceForm ReferenceForm_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cway
--

ALTER TABLE ONLY public."ReferenceForm"
    ADD CONSTRAINT "ReferenceForm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."ProgramApplication"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

\unrestrict lFJsk6eIGWyA31XMnLRTCeXxlA4BURpWzRf6FP5q1m3JHwEtCey3f5nE9Xt1bug

