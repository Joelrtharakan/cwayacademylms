# CWAY Academy LMS

Welcome to the **CWAY Academy Learning Management System (LMS)**! This platform is a modern, enterprise-grade, full-stack application designed to facilitate theological training, course management, student engagement, and administration for the CWAY Missions Religious Trust.

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

## 🐳 Infrastructure & Docker

The entire stack is containerized for exact parity between your local development environment and the production server.

### Local Development
We use Docker to spin up the required external services locally without cluttering your host machine.
- **PostgreSQL:** Runs on port `5444` to avoid collisions with existing databases.
- **Redis:** Runs on port `6379`.
- **pgAdmin:** A web-based GUI for managing the database, accessible at `http://localhost:5050`.

### Production Stack
The production environment uses a multi-container architecture orchestrated by `docker-compose.prod.yml`.
- **Nginx Reverse Proxy:** Routes incoming traffic, handles SSL termination, and serves static assets.
- **API Container:** Runs the compiled Node.js backend.
- **Web Container:** Runs the standalone Next.js production server.
- **Database:** Persistent PostgreSQL volume.

---

## 🚀 Getting Started (Local Development)

Follow these steps to get the CWAY Academy LMS running on your local machine.

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
   Create `.env` files in the following locations based on the provided `.env.example` templates:
   - Root: `./.env`
   - API: `./apps/api/.env`
   - Web: `./apps/web/.env.local`

4. **Start Local Docker Services:**
   This spins up your isolated PostgreSQL database.
   ```bash
   npm run docker:dev
   ```

5. **Initialize the Database:**
   Push the Prisma schema to your new database and generate the TypeScript client.
   ```bash
   npm run db:push
   npm run db:generate
   ```

6. **Start the Development Servers:**
   Turborepo will concurrently start both the Next.js frontend and the Express backend.
   ```bash
   npm run dev
   ```
   - **Frontend:** `http://localhost:3000`
   - **Backend API:** `http://localhost:4000`

---

## 🌍 Production Deployment Guide

Deploying CWAY Academy requires a VPS (Virtual Private Server) such as an AWS EC2 instance, DigitalOcean Droplet, or Hetzner server running Linux.

### 1. Server Preparation
- SSH into your server.
- Install Docker and Docker Compose.
- Install Git and clone your repository.

### 2. Environment Configuration
Create a `.env` file at the root of your repository on the server. You MUST configure the following critical credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://cway:cwaydev@db:5432/cway_lms"

# API & Frontend URLs
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api/v1"
CLIENT_URL="https://academy.yourdomain.com"
APP_URL="https://academy.yourdomain.com"

# Security
JWT_SECRET="generate-a-very-long-secure-random-string"

# Cloudflare R2 (File Uploads)
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret"
R2_BUCKET_NAME="cway-lms-uploads"
R2_PUBLIC_URL="https://pub-your-custom-url.r2.dev"

# Resend (Automated Emails)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="CWAY Academy <noreply@cwayacademy.com>"
```

### 3. Launching the Stack
Once your `.env` is secure, build and start the production containers:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
This command will:
1. Build the highly-optimized `standalone` Next.js image.
2. Compile the TypeScript Express API.
3. Start the PostgreSQL database with a persistent Docker volume to prevent data loss.
4. Launch an Nginx proxy to securely route traffic.

---

## 📁 Storage & File Management

Because modern deployments rely on ephemeral containers, you **cannot** store uploaded files (like PDFs, assignments, or thumbnails) on the local disk.

CWAY Academy is pre-configured to stream all file uploads directly to **Cloudflare R2** (an S3-compatible, zero-egress-fee cloud storage provider). 

When a teacher uploads a syllabus or a student submits an assignment:
1. The Express backend receives the multipart form data.
2. The file is piped securely to Cloudflare R2.
3. The public URL of the uploaded file is saved to the PostgreSQL database.

---

## 🤝 Contributing & Code Style

- **Strict Typing:** All new features must be strictly typed using TypeScript interfaces. Avoid using `any`.
- **Styling:** Stick to the predefined Tailwind theme colors (e.g., `text-[#1C2B1E]`, `bg-[#F5F0E8]`). Do not introduce arbitrary colors.
- **Database Changes:** If you modify `packages/db/prisma/schema.prisma`, you MUST run `npm run db:push` to apply changes locally before committing.
