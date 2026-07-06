import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://cwayuser:W5lNF1swSRij3BUM9pPgAKFuREUQRLSG@dpg-d8p66aok1i2s73eu1igg-a.oregon-postgres.render.com/cway?sslmode=require"
    }
  }
});

async function main() {
  try {
    console.log("Attempting to connect to Render DB...");
    await prisma.$connect();
    console.log("Connection successful!");
    
    // try a simple query
    const count = await prisma.user.count();
    console.log("User count:", count);
  } catch (err: any) {
    console.error("Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
