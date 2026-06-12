import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const enrollment = await prisma.enrollment.findFirst({
    include: {
      course: {
        include: {
          instructor: true
        }
      }
    }
  });
  console.log("Instructor data:", JSON.stringify(enrollment?.course?.instructor, null, 2));
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
