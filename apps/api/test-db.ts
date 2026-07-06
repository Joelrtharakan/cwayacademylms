import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const discussions = await prisma.discussion.findMany({
    include: { course: true }
  });
  console.log("Total discussions:", discussions.length);
  if (discussions.length > 0) {
    console.log(discussions[0]);
  }
}
main().finally(() => prisma.$disconnect());
