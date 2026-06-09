import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.lesson.findFirst({where: {type: 'VIDEO'}}).then(console.log).finally(() => prisma.$disconnect());
