"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
const basePrisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
// Fields to serialize/deserialize
const arrayFields = ["requirements", "outcomes", "targetAudience", "tags", "variables"];
const jsonFields = ["answers", "smtpConfig", "stripeConfig", "storageConfig"];
const allFields = [...arrayFields, ...jsonFields];
exports.prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, args, query }) {
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
                const parseObject = (obj) => {
                    if (!obj)
                        return;
                    for (const field of allFields) {
                        if (obj[field] && typeof obj[field] === "string") {
                            try {
                                obj[field] = JSON.parse(obj[field]);
                            }
                            catch (e) {
                                // Ignore parse errors, fallback to string or empty array depending on field
                                if (arrayFields.includes(field))
                                    obj[field] = [];
                            }
                        }
                    }
                };
                if (Array.isArray(result)) {
                    result.forEach(parseObject);
                }
                else if (result && typeof result === "object") {
                    parseObject(result);
                }
                return result;
            },
        },
    },
});
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = basePrisma;
