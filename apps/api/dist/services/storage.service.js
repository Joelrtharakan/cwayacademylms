"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const r2Client = process.env.R2_ACCOUNT_ID
    ? new client_s3_1.S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
    })
    : null;
const BUCKET = process.env.R2_BUCKET_NAME || "cway-academy";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://cdn.cwayacademy.org";
exports.StorageService = {
    async uploadFile(file, key, mimeType, _isPublic = true) {
        if (!r2Client) {
            // Dev mock — return a placeholder URL
            console.log(`[StorageService DEV] Would upload: ${key}`);
            return { url: `${PUBLIC_URL}/${key}`, key };
        }
        await r2Client.send(new client_s3_1.PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file,
            ContentType: mimeType,
        }));
        return { url: `${PUBLIC_URL}/${key}`, key };
    },
    async deleteFile(key) {
        if (!r2Client) {
            console.log(`[StorageService DEV] Would delete: ${key}`);
            return;
        }
        await r2Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    },
    generateUploadKey(folder, filename) {
        const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
        return `${folder}/${Date.now()}-${sanitized}`;
    },
};
