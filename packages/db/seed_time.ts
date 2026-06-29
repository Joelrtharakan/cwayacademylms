import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const lps = await prisma.lessonProgress.findMany({
    take: 10,
    where: { completedAt: { not: null } },
  });
  
  for (const lp of lps) {
    await prisma.lessonProgress.update({
      where: { id: lp.id },
      data: { watchedSeconds: Math.floor(Math.random() * 3600) + 1200 }
    });
  }
  console.log('Seeded watchedSeconds for 10 lesson progress records');
}
main().catch(console.error).finally(() => prisma.$disconnect());
