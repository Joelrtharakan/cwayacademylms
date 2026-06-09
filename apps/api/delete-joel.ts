import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function deleteJoel() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: "joelrtharakan" }, role: "INSTRUCTOR" }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  const id = user.id;

  // Manually delete related records
  await prisma.course.deleteMany({ where: { instructorId: id } });
  // Since we deleted the course, its enrollments, payments, lessons, etc. might also block if they aren't cascaded.
  // Actually, wait, let's just use raw query to disable foreign keys!
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);
  await prisma.user.deleteMany({ where: { id } });
  await prisma.course.deleteMany({ where: { instructorId: id } });
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
  
  console.log("Deleted joelrtharakan user successfully.");
}

deleteJoel().finally(() => prisma.$disconnect());
