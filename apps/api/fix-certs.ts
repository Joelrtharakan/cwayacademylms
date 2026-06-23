import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const certs = await prisma.certificate.findMany({ where: { type: 'COURSE' }, include: { course: true } });
  let deletedCount = 0;
  for (const cert of certs) {
    if (cert.course && cert.course.programId) {
      await prisma.certificate.delete({ where: { id: cert.id } });
      console.log('Deleted course certificate for program course', cert.id);
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} course certificates.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
