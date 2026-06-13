// @ts-ignore
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

const MODELS = [
  "User",
  "Category",
  "Course",
  "Section",
  "Lesson",
  "ReadingMaterial",
  "Rubric",
  "RubricCriteria",
  "RubricLevel",
  "Quiz",
  "Question",
  "Answer",
  "Assignment",
  "Payment",
  "Sponsorship",
  "Enrollment",
  "LessonProgress",
  "ReadingMaterialProgress",
  "QuizAttempt",
  "Submission",
  "CertificateTemplate",
  "Certificate",
  "Review",
  "Forum",
  "ForumPost",
  "ForumReply",
  "Message",
  "Notification",
  "Coupon",
  "EmailTemplate",
  "SiteSettings",
  "BlogPost",
  "PayoutRequest",
  "Announcement",
  "Discussion",
  "DiscussionReply",
  "AttendanceSession",
  "AttendanceRecord",
  "Curriculum",
  "Note"
];

async function main() {
  console.log("Connecting to SQLite...");
  const dbPath = path.resolve(__dirname, "prisma/dev.db");
  const sqlite = new Database(dbPath, { readonly: true });
  
  console.log("Connecting to PostgreSQL...");
  await prisma.$connect();

  console.log("Clearing PostgreSQL database...");
  for (const model of [...MODELS].reverse()) {
    try {
      await (prisma as any)[model[0].toLowerCase() + model.slice(1)].deleteMany();
    } catch (e) {
      console.warn(`Failed to clear ${model}, continuing...`);
    }
  }

  console.log("Migrating data...");

  for (const model of MODELS) {
    const prismaModelName = model[0].toLowerCase() + model.slice(1);
    
    // Read from SQLite
    try {
      const rows = sqlite.prepare(`SELECT * FROM "${model}"`).all() as any[];
      if (rows.length === 0) {
        console.log(`[${model}] No rows to migrate.`);
        continue;
      }

      // SQLite stores booleans as 1/0 and Date as numbers/strings
      // We need to fetch table info to identify BOOLEAN and DATETIME columns
      const tableInfo = sqlite.prepare(`PRAGMA table_info("${model}")`).all() as any[];
      const booleanColumns = tableInfo.filter(c => c.type === "BOOLEAN").map(c => c.name);
      const datetimeColumns = tableInfo.filter(c => c.type === "DATETIME").map(c => c.name);

      const transformedRows = rows.map(row => {
        const newRow = { ...row };
        for (const col of booleanColumns) {
          if (newRow[col] !== null && newRow[col] !== undefined) {
            newRow[col] = newRow[col] === 1;
          }
        }
        for (const col of datetimeColumns) {
          if (newRow[col] !== null && newRow[col] !== undefined) {
            newRow[col] = new Date(newRow[col]);
          }
        }
        return newRow;
      });

      // Insert into Postgres one-by-one to skip orphaned rows
      let successCount = 0;
      for (const rowData of transformedRows) {
        try {
          await (prisma as any)[prismaModelName].create({
            data: rowData
          });
          successCount++;
        } catch (e: any) {
          if (e.code === 'P2003') {
             // Foreign key constraint failed
             console.warn(`[${model}] Skipped orphaned row ID ${rowData.id}`);
          } else if (e.code === 'P2002') {
             // Unique constraint
          } else {
             console.error(`[${model}] Error inserting row ${rowData.id}:`, e.message);
          }
        }
      }

      console.log(`[${model}] Migrated ${successCount}/${rows.length} rows.`);
    } catch (err: any) {
      if (err.message.includes("no such table")) {
        console.warn(`[${model}] Table does not exist in SQLite, skipping...`);
      } else {
        console.error(`[${model}] Error migrating:`, err);
        throw err;
      }
    }
  }

  console.log("Migration completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
