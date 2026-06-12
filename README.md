# CWAY Academy LMS - Project & Deployment Report

Welcome to the CWAY Academy LMS! This is a modern, full-stack Learning Management System (LMS) built with a scalable monorepo architecture.

## 🏗️ Architecture Overview
This project uses **Turborepo** to manage multiple applications and packages within a single repository.

- **Frontend (`apps/web`)**: Built with **Next.js**, React, and Tailwind CSS. It serves the UI for Students, Instructors, and Administrators.
- **Backend (`apps/api`)**: Built with **Node.js** and **Express**. It handles all API requests, authentication, and business logic.
- **Database Layer (`packages/db`)**: Built with **Prisma ORM** connecting to an **SQLite** database.

---

## 🚀 Deployment Guide (Custom Domain)

If you want to deploy this platform to your own domain (e.g., `academy.yourdomain.com`), you will need to host both the Frontend and the Backend, and configure your DNS settings.

### 1. What You Need
To successfully deploy, you will need:
- **A Domain Name**: Registered via GoDaddy, Namecheap, Cloudflare, etc.
- **Frontend Hosting**: Platforms like **Vercel**, **Netlify**, or AWS Amplify are highly recommended for Next.js.
- **Backend Hosting**: Platforms like **Render** or **Railway** (using persistent volumes), **DigitalOcean App Platform**, or a traditional AWS EC2 instance.
- **Persistent Storage Volume (CRITICAL)**: Because SQLite is a file-based database, your backend host MUST provide a persistent disk volume. If you deploy on an ephemeral service without a disk, your database will be completely wiped out every time the server restarts.
- **Cloud Storage (CRITICAL)**: An AWS S3 bucket (or Cloudinary/Google Cloud Storage) to handle file uploads.

### 2. Environment Variables Required
Both your Frontend and Backend environments will require specific `.env` variables to function securely.

**Frontend (`apps/web/.env`)**:
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com" # The URL of your deployed backend
```

**Backend (`apps/api/.env`)**:
```env
PORT=5000
DATABASE_URL="file:../../packages/db/prisma/dev.db" # Ensure this path points to your persistent storage volume in production
JWT_SECRET="your_highly_secure_random_string"
CLIENT_URL="https://academy.yourdomain.com" # To configure CORS for your frontend
```

### 3. Domain & DNS Routing
You will need to set up DNS records on your domain registrar:
- **Frontend (Main App)**: Create a `CNAME` or `A` record pointing `academy.yourdomain.com` to your Vercel/Netlify deployment.
- **Backend (API)**: Create a `CNAME` pointing `api.yourdomain.com` to your Render/Railway backend server.

---

## 📁 File Uploads & Storage (IMPORTANT)

A major feature of the LMS is file handling. This includes:
- **Teachers**: Uploading reading materials, PDFs, and course attachments.
- **Students**: Uploading assignment submissions (PDFs, ZIPs, Docs).

### Current Development State
Currently, in development, the system uses **Multer (Local Disk Storage)**. Files are saved directly to `apps/web/public/uploads`. 

### Production Deployment Changes Required
You **cannot** use local disk storage in modern serverless hosting (like Vercel or Render) because their file systems are ephemeral (they wipe out on every restart). 

**Before deploying to production**, the backend file upload routes must be updated to upload files directly to a cloud storage provider. 

**Recommended Setup:**
1. Create an **AWS S3 Bucket** (or use Cloudinary).
2. Update the `apps/api/src/routes/student.routes.ts` and `courses.routes.ts` files to use `multer-s3` instead of `multer.diskStorage()`.
3. Add your S3 credentials to your backend `.env`:
   ```env
   AWS_ACCESS_KEY_ID="your_key"
   AWS_SECRET_ACCESS_KEY="your_secret"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="cway-academy-uploads"
   ```
4. The database (`Submission` and `ReadingMaterial` models) will securely store the public URL (e.g., `https://cway-academy-uploads.s3.amazonaws.com/assignment.pdf`) pointing to the hosted file.

---

## 🛠️ Local Development Commands

To run the platform locally or test changes before deployment:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Sync Database**:
   ```bash
   npm run db:push
   npm run db:generate
   ```

3. **Start Development Servers** (Frontend & Backend):
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:3000`
   - Backend API runs on: `http://localhost:5000`
