import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from workspace root if not already loaded
const rootEnvPath = path.resolve(process.cwd(), "../../.env");
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Fields to serialize/deserialize
const arrayFields = ["requirements", "outcomes", "targetAudience", "tags", "variables"];
const jsonFields = ["answers", "smtpConfig", "stripeConfig", "storageConfig"];
const allFields = [...arrayFields, ...jsonFields];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }: any) {
        // Serialize before query
        if (args.data) {
          for (const field of allFields) {
            if (args.data[field] !== undefined) {
              if (typeof args.data[field] !== "string") {
                args.data[field] = JSON.stringify(args.data[field]);
              }
            }
          }
        }
        if (args.update) {
          // for updateMany
          for (const field of allFields) {
            if (args.update[field] !== undefined) {
              if (typeof args.update[field] !== "string") {
                args.update[field] = JSON.stringify(args.update[field]);
              }
            }
          }
        }

        const result = await query(args);

        // Deserialize after query
        const parseObject = (obj: any) => {
          if (!obj) return;
          for (const field of allFields) {
            if (obj[field] && typeof obj[field] === "string") {
              try {
                obj[field] = JSON.parse(obj[field]);
              } catch (e) {
                // Ignore parse errors, fallback to string or empty array depending on field
                if (arrayFields.includes(field)) obj[field] = [];
              }
            }
          }
        };

        if (Array.isArray(result)) {
          result.forEach(parseObject);
        } else if (result && typeof result === "object") {
          parseObject(result);
        }

        return result;
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;
