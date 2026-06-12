# CWAY Academy LMS - Development State & Handover

This document outlines the current state of the CWAY Academy LMS, the features built to date, the official design system/theme colors, a comprehensive API map, and guidelines for developing the next phase. 

---

## 🎨 Design System & Theme Colors

The LMS follows a strict, premium aesthetic designed to look professional, sophisticated, and slightly academic. The primary color palette revolves around Deep Forest Greens and Rich Golds.

**Core Color Palette (`cway-theme.ts`):**
- **Dark Green (Hero):** `#1C2B1E` - Used for heavy text, primary headings, and bold contrast backgrounds.
- **Forest (Text):** `#243825` - Used for standard, high-contrast typography and secondary containers.
- **Gold (Primary Accent):** `#C9973A` - Used for active states, primary buttons, borders, and success highlights.
- **Gold Light:** `#E8B85A` - Used for hover states and softer gradients.
- **Gold Muted:** `#A8792A` - Used for subtle, non-intrusive accenting.
- **Cream (Background):** `#F5F0E8` - The primary background color of the app, replacing harsh pure whites with a softer, premium reading tone.
- **Text Muted:** `#8A9E8C` - Used for secondary text, descriptions, placeholders, and inactive states.

**Status Colors:**
- **Success:** `#4A8C5C` (Green)
- **Danger:** `#8C3A3A` (Red)
- **Warning:** `#8C6A1A` (Yellow/Brown)

*Note: All new UI components should stick to these hex codes to ensure UI consistency.*

---

## ✅ Completed Phases & Extra Features

The foundational phases of the LMS have been completely built out. 

### Phase 1: Authentication & Role Management
- Fully functional authentication via JWT.
- Role-based Access Control (RBAC): `STUDENT`, `INSTRUCTOR`, `ADMIN`.
- Secure route protection on both Frontend and Backend.

### Phase 2: Instructor Dashboard & Course Management
- **Course Builder:** Instructors can create courses, attach thumbnail images, and set requirements.
- **Modular Curriculum:** Courses are broken down into Modules.
- **Lesson Types:** Modules can contain multiple lesson types: `VIDEO`, `READING_MATERIAL`, `QUIZ`, and `FORUM`.
- **Assignment System:** Instructors can create assignments and grade student submissions.
- **Student Analytics:** Instructors can view enrolled students, track their progress, and see their last completed lessons.

### Phase 3: Student Experience & Learning Panel
- **Course Enrollment:** Students can browse published courses and enroll.
- **Interactive Learning Player:** A unified, distraction-free layout (`/student/courses/[courseId]/learn`) that houses the video player, reading materials, and quizzes.
- **Progress Tracking:** Automatic progress tracking. Completed lessons update the sidebar dynamically. The "End Course" button automatically activates when no next lesson is found.
- **Assignments UI:** A premium, fully spaced data table for students to track Pending, Awaiting Grade, and Graded assignments with corresponding scores.
- **Learning Forums:** Students can reply to instructor-prompted forum discussions directly within the lesson flow. *Extra Feature: Students can edit and delete their own forum replies dynamically.*
- **Notes System:** A slide-out panel allows students to take private, rich-text notes tied specifically to the lesson they are viewing.

---

## 📡 API Endpoints Overview

The backend uses Express.js and Prisma. Below is a map of the primary endpoints to help you build the next phase.

### Auth (`/api/auth/*`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate and return JWT token
- `GET /me` - Get current authenticated user profile

### Student Routes (`/api/student/*`)
- `GET /dashboard` - Fetch student dashboard analytics and enrolled courses
- `POST /enrollments` - Enroll in a course
- `GET /courses/:courseId/learn` - Fetch full course curriculum for the learning player
- `POST /enrollments/:enrollmentId/lessons/:lessonId/complete` - Mark a lesson as complete
- `POST /enrollments/:enrollmentId/lessons/:lessonId/progress` - Save video watch time
- `POST /quizzes/:quizId/submit` - Submit quiz answers for auto-grading
- `GET /assignments` - Fetch all assignments (Pending & Completed)
- `POST /assignments/:assignmentId/submit` - Upload a file submission for an assignment
- `POST /lessons/:lessonId/notes` - Create a private note
- `POST /discussions/:id/replies` - Post a reply to a forum discussion

### Instructor Routes (`/api/courses/*`)
- `POST /` - Create a new course
- `GET /my-courses` - Fetch instructor's courses
- `POST /:courseId/modules` - Create a curriculum module
- `POST /:courseId/modules/:moduleId/lessons` - Add a video/reading/quiz lesson to a module
- `PUT /:courseId/publish` - Publish a course to the student catalog
- `GET /:courseId/students` - Fetch enrolled students and their progress metrics
- `POST /assignments/:assignmentId/grade` - Grade a student's submission

### Forums Routes (`/api/forums/*`)
- `PUT /replies/:replyId` - Edit a specific forum reply
- `DELETE /replies/:replyId` - Delete a specific forum reply

---

## 🚀 Building the Next Phase (Guidelines)

As you transition into the next development phase, keep the following rules in mind:

### 1. Database Migrations (Prisma)
If you need to add new features (e.g., Live Classes, Payments, Certificates), you must update `packages/db/prisma/schema.prisma`. 
After updating the schema, always run:
```bash
npm run db:push
npm run db:generate
```
Since the project is using **SQLite**, the database is stored locally in `packages/db/prisma/dev.db`. Be careful not to delete this file unless you want to wipe your local database.

### 2. File Uploads (Critical for Production)
The current system successfully processes file uploads using `multer` with `diskStorage`, saving files to `/apps/web/public/uploads`.
**For Phase 4 (Production Prep):** You must switch the `multer` configuration in the API controllers to use `multer-s3` and stream the uploads directly to an AWS S3 bucket. Modern hosting platforms (Vercel/Render) will wipe local uploads on restart.

### 3. Component Architecture
When building new UI pieces:
- Prefer standard Tailwind CSS utility classes combined with inline styles for highly specific, unbreakable constraints (as demonstrated in the Assignments Table padding).
- Do not use generic component libraries that break the CWAY theme. If you need a modal, build it using absolute positioning and the defined `THEME` constants to keep the luxury aesthetic intact.
- Keep the `api` instance (`import { api } from "@/store/auth.store";`) for all fetch calls as it automatically attaches the JWT bearer token for authentication.

### 4. Suggested Next Features (Phase 4)
- **Stripe Integration:** For paid course enrollments.
- **Certificate Generation:** PDF generation using `pdfkit` or `puppeteer` when a student hits 100% progress.
- **Admin Panel:** A super-admin dashboard (`/admin`) to manage all users, suspend accounts, and view platform-wide revenue.
