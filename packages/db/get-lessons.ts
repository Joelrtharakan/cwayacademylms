import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const section = await prisma.section.findFirst({
    where: { title: { contains: "Introduction to the Bible" } },
    include: { lessons: true }
  });
  console.dir(section, { depth: null });
}

main().finally(() => prisma.$disconnect());
