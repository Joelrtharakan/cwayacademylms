import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const req = { user: { id: 'cmql8quqk0000h58xt3rfj7uo', role: 'INSTRUCTOR' } };
  
  const whereClause = (req.user!.role === "ADMIN" || req.user!.role === "REGISTRAR")
    ? {}
    : { course: { instructorId: req.user!.id } };

  try {
    const discussions = await prisma.discussion.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        replies: {
          include: { author: { select: { id: true, name: true, avatar: true, role: true } } },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    console.log("Success! Found:", discussions.length);
  } catch (error) {
    console.error("Prisma Error:", error);
  }
}
main().finally(() => prisma.$disconnect());
