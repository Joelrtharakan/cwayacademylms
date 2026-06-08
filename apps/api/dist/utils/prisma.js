"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables from workspace root if not already loaded
const rootEnvPath = path_1.default.resolve(process.cwd(), "../../.env");
if (fs_1.default.existsSync(rootEnvPath)) {
    dotenv_1.default.config({ path: rootEnvPath });
}
else {
    dotenv_1.default.config();
}
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
            async $allOperations({ model, operation, args, query }) {
                // Serialize before query
                if (args.data) {
                    for (const field of allFields) {
                        console.log(`[PRISMA INTERCEPTOR] model=${model}, field=${field}`);
                        if (field === "answers" && model !== "QuizAttempt") {
                            console.log(`[PRISMA INTERCEPTOR] Skipping stringify for answers on model ${model}`);
                            continue;
                        }
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
                        if (field === "answers" && model !== "QuizAttempt")
                            continue;
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
                        if (field === "answers" && model !== "QuizAttempt")
                            continue;
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
