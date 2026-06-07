/*
  Warnings:

  - You are about to drop the column `lessonId` on the `ReadingMaterial` table. All the data in the column will be lost.
  - Added the required column `sectionId` to the `ReadingMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReadingMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingMaterial_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReadingMaterial" ("createdAt", "description", "fileKey", "fileSize", "fileType", "fileUrl", "id", "order", "title") SELECT "createdAt", "description", "fileKey", "fileSize", "fileType", "fileUrl", "id", "order", "title" FROM "ReadingMaterial";
DROP TABLE "ReadingMaterial";
ALTER TABLE "new_ReadingMaterial" RENAME TO "ReadingMaterial";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
