-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "thumbnail" TEXT,
    "promoVideoUrl" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "language" TEXT NOT NULL DEFAULT 'ENGLISH',
    "moduleNumber" INTEGER,
    "weeksDuration" INTEGER NOT NULL DEFAULT 6,
    "totalLectures" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "scriptureRef" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "requirements" TEXT NOT NULL DEFAULT '[]',
    "outcomes" TEXT NOT NULL DEFAULT '[]',
    "targetAudience" TEXT NOT NULL DEFAULT '[]',
    "welcomeMessage" TEXT,
    "congratsMessage" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "rejectionReason" TEXT,
    "instructorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("categoryId", "congratsMessage", "createdAt", "currency", "description", "id", "instructorId", "isFeatured", "isFree", "language", "level", "moduleNumber", "outcomes", "price", "promoVideoUrl", "rejectionReason", "requirements", "scriptureRef", "slug", "status", "subtitle", "tags", "targetAudience", "thumbnail", "title", "totalDuration", "totalLectures", "updatedAt", "weeksDuration", "welcomeMessage") SELECT "categoryId", "congratsMessage", "createdAt", "currency", "description", "id", "instructorId", "isFeatured", "isFree", "language", "level", "moduleNumber", "outcomes", "price", "promoVideoUrl", "rejectionReason", "requirements", "scriptureRef", "slug", "status", "subtitle", "tags", "targetAudience", "thumbnail", "title", "totalDuration", "totalLectures", "updatedAt", "weeksDuration", "welcomeMessage" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_status_idx" ON "Course"("status");
CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");
CREATE INDEX "Course_slug_idx" ON "Course"("slug");
CREATE TABLE "new_EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "variables" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EmailTemplate" ("createdAt", "htmlBody", "id", "name", "subject", "updatedAt", "variables") SELECT "createdAt", "htmlBody", "id", "name", "subject", "updatedAt", "variables" FROM "EmailTemplate";
DROP TABLE "EmailTemplate";
ALTER TABLE "new_EmailTemplate" RENAME TO "EmailTemplate";
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
