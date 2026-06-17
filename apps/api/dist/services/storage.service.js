"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2 = void 0;
exports.uploadToR2 = uploadToR2;
exports.deleteFromR2 = deleteFromR2;
exports.generateKey = generateKey;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
// Cloudflare R2 uses S3-compatible API
exports.r2 = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});
async function uploadToR2(fileBuffer, key, mimeType) {
    const upload = new lib_storage_1.Upload({
        client: exports.r2,
        params: {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
        },
    });
    await upload.done();
    return {
        key,
        url: `${process.env.R2_PUBLIC_URL}/${key}`,
    };
}
async function deleteFromR2(key) {
    await exports.r2.send(new client_s3_1.DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    }));
}
function generateKey(folder, filename) {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    return `${folder}/${Date.now()}-${sanitized}`;
}
