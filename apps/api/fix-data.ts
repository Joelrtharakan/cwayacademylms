import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const certs = await prisma.certificate.findMany({ where: { type: 'COURSE' }, include: { course: true } });
  for (const cert of certs) {
    if (cert.course && cert.course.programId) {
      // Create program certificate if they completed all courses
      const programCourses = await prisma.course.findMany({ where: { programId: cert.course.programId } });
      const completed = await prisma.enrollment.count({ where: { studentId: cert.studentId, courseId: { in: programCourses.map(c => c.id) }, status: 'COMPLETED' } });
      if (completed === programCourses.length) {
        const existing = await prisma.certificate.findFirst({ where: { studentId: cert.studentId, programId: cert.course.programId, type: 'PROGRAM' } });
        if (!existing) {
          await prisma.certificate.create({
            data: {
              studentId: cert.studentId,
              programId: cert.course.programId,
              type: 'PROGRAM',
            }
          });
          console.log('Created missing program certificate for student', cert.studentId);
        }
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
