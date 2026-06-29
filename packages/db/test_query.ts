import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.$queryRaw`SELECT count(*) FROM "LessonProgress" WHERE "watchedSeconds" > 0`;
  console.log('LessonProgress > 0:', res);
  
  const res2 = await prisma.$queryRaw`
    SELECT u.id, u.name, u.email, u.avatar, 
           SUM(lp."watchedSeconds") as "totalSeconds",
           COUNT(DISTINCT e."courseId") as "enrollmentCount"
    FROM "User" u
    JOIN "Enrollment" e ON e."studentId" = u.id
    JOIN "LessonProgress" lp ON lp."enrollmentId" = e.id
    WHERE u.role = 'STUDENT'
    GROUP BY u.id, u.name, u.email, u.avatar
    HAVING SUM(lp."watchedSeconds") > 0
    ORDER BY "totalSeconds" DESC
    LIMIT 10
  `;
  console.log('Top students:', res2);
}
main().catch(console.error).finally(() => prisma.$disconnect());
