"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const errors_1 = require("../utils/errors");
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "cway-assets";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://assets.cwayacademy.com";
let s3Client = null;
if (ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    s3Client = new client_s3_1.S3Client({
        region: "auto",
        endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY,
        },
    });
}
exports.StorageService = {
    /**
     * Generates a safe object key for R2 storage.
     */
    generateUploadKey(folder, filename) {
        const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "").toLowerCase();
        return `${folder}/${Date.now()}-${sanitized}`;
    },
    /**
     * Uploads a file buffer to R2 and returns the public URL and key.
     */
    async uploadFile(fileBuffer, key, mimeType) {
        if (!s3Client) {
            console.warn("[StorageService] R2 credentials missing. Using mock upload.");
            return { url: `${PUBLIC_URL}/mock/${key}`, key };
        }
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: fileBuffer,
                ContentType: mimeType,
            });
            await s3Client.send(command);
            return { url: `${PUBLIC_URL}/${key}`, key };
        }
        catch (error) {
            console.error("[StorageService] Upload error:", error);
            throw new errors_1.AppError("Failed to upload file to storage", 500);
        }
    },
    /**
     * Deletes a file from R2.
     */
    async deleteFile(key) {
        if (!s3Client) {
            console.warn("[StorageService] R2 credentials missing. Skipping delete.");
            return;
        }
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            await s3Client.send(command);
        }
        catch (error) {
            console.error("[StorageService] Delete error:", error);
            throw new errors_1.AppError("Failed to delete file from storage", 500);
        }
    },
};
