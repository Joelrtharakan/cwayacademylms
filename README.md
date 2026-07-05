# CWAY Academy LMS

Welcome to the **CWAY Academy Learning Management System (LMS)**! This platform is a modern, enterprise-grade, full-stack application designed to facilitate theological training, course management, student engagement, and administration for the CWAY Missions Religious Trust.

This document serves as the comprehensive guide to the project, covering its architecture, features, design system, API, database, and setup instructions.

---

## 🏗️ Technical Architecture

This application is engineered as a highly scalable **Monorepo** using [Turborepo](https://turbo.build/). The stack is split into distinct, specialized workspaces for maintainability and performance.

### 1. Frontend (`apps/web`)
The user interface is built for speed, SEO, and premium aesthetics.
- **Framework:** Next.js 14 (App Router) + React
- **Styling:** Tailwind CSS with a highly customized, luxury theme.
- **Data Fetching:** React Query / Custom Axios Hooks.
- **State Management:** Zustand (for Auth and UI states).
- **Features:** Server-Side Rendering (SSR), beautifully animated components, markdown blog renderer, and a distraction-free interactive video learning player.

### 2. Backend API (`apps/api`)
A robust, secure, and blazing-fast RESTful API.
- **Framework:** Node.js with Express.js.
- **Language:** TypeScript (Strict Mode).
- **Security:** Helmet, Express Rate Limit, CORS, and Bcrypt for password hashing.
- **Authentication:** Stateless JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **Storage Integration:** Direct streaming to Cloudflare R2 via AWS SDK v3.
- **Email:** Automated transactional HTML emails via Resend API.

### 3. Database Layer (`packages/db`)
A shared internal package providing type-safe database access across the monorepo.
- **Database:** PostgreSQL (Containerized via Docker).
- **ORM:** Prisma ORM.
- **Features:** Automated migrations, strict relational integrity, and heavily optimized query structures.

---

## 🎨 Design System & Theme Identity

The LMS follows a highly specific, premium aesthetic designed to look professional, sophisticated, and academic. The entire application UI is constructed around this precise color token system:

- **Dark Green (Hero & Backgrounds):** `#1C2B1E`
- **Forest (Text):** `#243825`
- **Gold (Primary Accent):** `#C9973A` — The primary interactive color.
- **Gold Light (Hover):** `#E8B85A`
- **Gold Muted:** `#A8792A`
- **Cream (Primary App Background):** `#F5F0E8`
- **Text Muted:** `#8A9E8C`

**Semantic Status Colors:**
- Success: `#4A8C5C`
- Danger/Destructive: `#8C3A3A`
- Warning: `#8C6A1A`

---

## ✨ Features & Capabilities

The application has successfully completed all foundational development and is 100% production-ready.

### 🔐 Authentication & Roles
- Custom JWT-based stateless authentication.
- Securely isolated roles: `STUDENT`, `INSTRUCTOR`, and `ADMIN`.

### 📚 Course Assembly & Instructor Workflow
- **Course Builder:** Instructors can draft courses, attach Cloudflare R2-hosted thumbnails, and define prerequisites.
- **Modular Curriculum:** Courses are broken down into `Modules` → `Lessons`.
- **Lesson Types:** `VIDEO`, `READING_MATERIAL`, `QUIZ`, and `FORUM`.
- **Assignments:** File upload assignments with manual grading workflows.
- **Instructor Analytics:** Dashboards showing enrollments, completion rates, and student activity.

### 🎓 Student Learning Experience
- **Interactive Learning Player:** Distraction-free unified layout for video playback, syllabus tracking, and dynamic content.
- **Automated Progress Tracking:** Completed lessons and video watch time sync automatically.
- **Private Notes System:** Rich-text notes tied directly to the current lesson.
- **Learning Forums:** Lesson-specific discussion boards.
- **Assignment Dashboards:** Track pending, awaiting grade, and graded assignments.

### ☁️ Infrastructure & Admin
- **Cloudflare R2 File Uploads:** All file uploads stream directly to R2.
- **Automated Email Triggers:** Resend API integration for account verification, password resets, enrollments, and approvals.
- **CMS Blog Module:** Markdown-powered Blog for Administrators.

---

## 🏗️ Database Architecture

The highly relational database schema is managed via Prisma & PostgreSQL:

1. **User Model:** Has a `role` (`STUDENT`, `INSTRUCTOR`, `ADMIN`).
2. **Course Model:** Owned by an `INSTRUCTOR`. Has many `Module`s.
3. **Module Model:** Belongs to a `Course`. Has many `Lesson`s.
4. **Lesson Model:** Belongs to a `Module`. Types include `VIDEO`, `READING_MATERIAL`, `QUIZ`, or `FORUM`.
5. **Enrollment Model:** Many-to-many join table tracking overall `progress`.
6. **LessonProgress Model:** Tracks granular completion state and watch time.
7. **Submission Model:** A student's uploaded assignment file awaiting grading.

> **CRITICAL DEPLOYMENT NOTE:** Do not attempt to run `prisma migrate dev` against the production database. In production, rely on `prisma db push` or pre-compiled migration SQL scripts depending on your CI/CD strategy.

---

## 📡 API Endpoints Map

The Express.js backend provides the following core endpoints (all protected routes expect a `Bearer <Token>`):

### Authentication (`/api/v1/auth/*`)
- `POST /register`, `POST /login`, `POST /verify-email`, `GET /me`

### Student Operations (`/api/v1/student/*`)
- `GET /dashboard`, `POST /enrollments`, `GET /courses/:courseId/learn`
- `POST /enrollments/:enrollmentId/lessons/:lessonId/complete`
- `POST /assignments/:assignmentId/submit`, `POST /lessons/:lessonId/notes`

### Instructor Operations (`/api/v1/courses/*`)
- `POST /`, `GET /my-courses`, `POST /:courseId/modules`, `POST /:courseId/modules/:moduleId/lessons`
- `PUT /:courseId/publish`, `GET /:courseId/students`, `POST /assignments/:assignmentId/grade`

### Blog Operations (`/api/v1/blog/*`)
- `GET /posts`, `GET /posts/:slug`, `POST /posts` (Admin), `PUT /posts/:id`

---

## 🐳 Infrastructure & Docker

The entire stack is containerized for exact parity between your local development environment and the production server.

### Local Development
- **PostgreSQL:** Runs on port `5444`.
- **Redis:** Runs on port `6379`.
- **pgAdmin:** Accessible at `http://localhost:5050`.

### Production Stack
- Orchestrated by `docker-compose.prod.yml`.
- Includes Nginx Reverse Proxy, API Container, Web Container, and Persistent PostgreSQL volume.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Docker Desktop** (Running)
3. **Git**

### Installation
1. **Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd cway-academy
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create `.env` files based on the `.env.example` templates:
   - Root: `./.env`
   - API: `./apps/api/.env`
   - Web: `./apps/web/.env.local`

4. **Start Local Docker Services:**
   ```bash
   npm run docker:dev
   ```

5. **Initialize the Database:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

6. **Start the Development Servers:**
   ```bash
   npm run dev
   ```
   - **Frontend:** `http://localhost:3000`
   - **Backend API:** `http://localhost:4000`

---

## 🌍 Production Deployment Guide

Deploy to a VPS (AWS EC2, DigitalOcean, Hetzner, etc.) running Linux.

### Server Specifications
- **Minimum:** 2 vCPUs, 4GB RAM, 20GB SSD
- **Recommended:** 4 vCPUs, 8GB RAM, 40GB+ SSD
- **High Traffic:** 8 vCPUs, 16GB RAM, 80GB+ SSD

### Setup
Create a `.env` file at the root of your repository on the server with production credentials (Database URL, JWT Secret, Cloudflare R2, Resend API).

Launch the stack:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📁 Storage & File Management

Because modern deployments rely on ephemeral containers, you **cannot** store uploaded files locally. CWAY Academy uses **Cloudflare R2** for all file uploads.

1. The Express backend receives multipart form data.
2. The file is securely piped to Cloudflare R2.
3. The public URL is saved in the PostgreSQL database.

---

## 🤝 Contributing & Code Style

- **Strict Typing:** All new features must be typed with TypeScript interfaces. Avoid `any`.
- **Styling:** Strictly follow the predefined Tailwind theme colors (`text-[#1C2B1E]`, `bg-[#F5F0E8]`, etc.). Do not introduce arbitrary colors.
- **Database Changes:** Run `npm run db:push` to apply changes locally before committing.
