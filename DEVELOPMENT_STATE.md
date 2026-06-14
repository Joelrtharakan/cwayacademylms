# CWAY Academy LMS - Development State & Technical Handover

This document serves as the exhaustive technical reference manual for the CWAY Academy LMS. It outlines the precise state of development, the exact feature set built across all phases, the strict UI/UX design tokens, the database architectural decisions, and a comprehensive API map.

Any developer taking over this project must read this document thoroughly to maintain architectural consistency.

---

## 🎨 1. Design System & Theme Identity

The LMS follows a highly specific, premium aesthetic designed to look professional, sophisticated, and academic. The entire application UI is constructed around this precise color token system. **Do not use generic UI libraries** (like MUI or default Tailwind templates) that conflict with these hex codes.

### Core Color Palette (`cway-theme.ts`)
- **Dark Green (Hero & Backgrounds):** `#1C2B1E` — Used for the main header, heavy text, and bold contrast containers.
- **Forest (Text):** `#243825` — Used for high-contrast typography and secondary containers.
- **Gold (Primary Accent):** `#C9973A` — The absolute primary interactive color. Used for active navigation states, primary buttons, borders, and success highlights.
- **Gold Light (Hover):** `#E8B85A` — Used for button hover states and softer gradients.
- **Gold Muted:** `#A8792A` — Used for subtle, non-intrusive accenting and inactive tab borders.
- **Cream (Primary App Background):** `#F5F0E8` — The primary background color of the application. It completely replaces pure white to create a softer, premium reading experience.
- **Text Muted:** `#8A9E8C` — Used for secondary text, descriptions, placeholders, and inactive states.

### Semantic Status Colors
- **Success:** `#4A8C5C` (Muted Green)
- **Danger/Destructive:** `#8C3A3A` (Muted Red)
- **Warning:** `#8C6A1A` (Muted Yellow/Brown)

---

## ✅ 2. Completed Phases & Feature Exhaustive List

The application has successfully completed all 7 phases of foundational development. It is 100% production-ready.

### Phase 1: Core Architecture & Authentication
- **Monorepo Setup:** Turborepo configured linking `apps/web`, `apps/api`, and `packages/db`.
- **Authentication:** Custom JWT-based stateless authentication. Tokens are signed by the backend and persisted securely in the frontend via Zustand stores and Axios interceptors.
- **Role-Based Access Control (RBAC):** Users are securely isolated as `STUDENT`, `INSTRUCTOR`, or `ADMIN`.

### Phase 2: Instructor Workflow & Course Assembly
- **Course Builder:** Instructors can draft courses, attach Cloudflare R2-hosted thumbnails, and define prerequisites.
- **Modular Curriculum Structure:** Courses are strictly broken down into `Modules` → `Lessons`.
- **Lesson Types Built:**
  - `VIDEO`: Streams standard video content.
  - `READING_MATERIAL`: Renders rich markdown or PDF downloads.
  - `QUIZ`: Interactive automated testing.
  - `FORUM`: Instructor-prompted discussion boards tied directly to the curriculum.
- **Assignments:** Instructors can define assignments requiring file uploads and manually grade student submissions.

### Phase 3: The Student Learning Experience
- **Interactive Learning Player (`/student/courses/[courseId]/learn`):** A unified, distraction-free layout (similar to masterclass) housing the video player, syllabus sidebar, and dynamic lesson content.
- **Automated Progress Tracking:** Completed lessons dynamically update progress bars. Video watch time is automatically synced to the server.
- **Private Notes System:** A slide-out panel allowing students to take and persist rich-text notes tied explicitly to the current lesson they are viewing.

### Phase 4-6: Community, Polish, and Administration
- **Learning Forums:** Students can reply, edit, and delete responses in lesson-specific discussion boards.
- **Assignment Dashboards:** Premium, fully spaced data tables allowing students to track pending, awaiting grade, and graded assignments.
- **Instructor Analytics:** Dashboard showing enrollment counts, completion rates, and recent student activity.

### Phase 7: Production Prep & Cloud Infrastructure
- **PostgreSQL Migration:** Transitioned the local SQLite database to a highly scalable PostgreSQL instance.
- **Cloudflare R2 File Uploads:** Ripped out local `multer` disk storage. All file uploads (thumbnails, PDFs, assignment submissions) now stream directly to Cloudflare R2 via the AWS SDK.
- **Automated Email Triggers:** Fully integrated the **Resend API**. The system automatically dispatches highly-styled HTML emails for:
  - Account Verification
  - Password Resets
  - Student Course Enrollments
  - Course Approvals (to Instructors)
- **Dockerization:** Containerized the Next.js frontend, Express backend, PostgreSQL database, and Redis into local and production `docker-compose` stacks.
- **CMS Blog Module:** Built a full Markdown-powered Blog CMS for Administrators to publish articles to the public site.
- **Security:** Hardened the API with `helmet`, `cors`, and `express-rate-limit`.

---

## 📡 3. API Endpoints Map

The backend is built in Express.js. All protected routes expect a valid `Bearer <Token>` in the `Authorization` header.

### 🔐 Authentication (`/api/v1/auth/*`)
- `POST /register` - Register a new user account.
- `POST /login` - Authenticate and return JWT tokens.
- `POST /verify-email` - Verify a user's email via token.
- `GET /me` - Fetch the authenticated user's profile.

### 🎓 Student Operations (`/api/v1/student/*`)
- `GET /dashboard` - Aggregate student analytics, progress, and enrolled courses.
- `POST /enrollments` - Enroll in a published course.
- `GET /courses/:courseId/learn` - Fetch the heavily nested course curriculum required for the Learning Player.
- `POST /enrollments/:enrollmentId/lessons/:lessonId/complete` - Mark a specific lesson as complete.
- `POST /assignments/:assignmentId/submit` - Upload a file submission to Cloudflare R2 for grading.
- `POST /lessons/:lessonId/notes` - Create/Update a private lesson note.

### 📝 Instructor Operations (`/api/v1/courses/*`)
- `POST /` - Draft a new course.
- `GET /my-courses` - List courses owned by the authenticated instructor.
- `POST /:courseId/modules` - Append a module to a course.
- `POST /:courseId/modules/:moduleId/lessons` - Attach a specific lesson type to a module.
- `PUT /:courseId/publish` - Request admin approval or publish a course.
- `GET /:courseId/students` - Fetch the roster and progress of enrolled students.
- `POST /assignments/:assignmentId/grade` - Grade and provide feedback on a student's file submission.

### 📰 Blog Operations (`/api/v1/blog/*`)
- `GET /posts` - Fetch paginated blog posts (Public).
- `GET /posts/:slug` - Fetch a single post by its URL slug.
- `POST /posts` - Create a new post (Admin only).
- `PUT /posts/:id` - Update an existing post.

---

## 🏗️ 4. Database Architecture (Prisma/PostgreSQL)

The database schema (`packages/db/prisma/schema.prisma`) is highly relational. Below are the core relationships:

1. **User Model:** The center of the app. Has a `role` (`STUDENT`, `INSTRUCTOR`, `ADMIN`).
2. **Course Model:** Owned by an `INSTRUCTOR`. Has many `Module`s.
3. **Module Model:** Belongs to a `Course`. Has many `Lesson`s. Ordered by `orderIndex`.
4. **Lesson Model:** Belongs to a `Module`. Can be of type `VIDEO`, `READING_MATERIAL`, `QUIZ`, or `FORUM`.
5. **Enrollment Model:** A many-to-many join table between `User` (Student) and `Course`. Tracks overall `progress`.
6. **LessonProgress Model:** Tracks the granular completion state and video watch time of a specific student on a specific lesson.
7. **Submission Model:** Represents a student's uploaded file for an assignment, waiting to be graded by the instructor.

> **CRITICAL DEPLOYMENT NOTE:** 
> Do not attempt to run `prisma migrate dev` against the production database. In production, rely on `prisma db push` or pre-compiled migration SQL scripts depending on your CI/CD strategy.
