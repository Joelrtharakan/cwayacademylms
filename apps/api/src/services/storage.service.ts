import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = process.env.R2_ACCOUNT_ID
  ? new S3Client({
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

export const StorageService = {
  async uploadFile(
    file: Buffer,
    key: string,
    mimeType: string,
    _isPublic: boolean = true
  ): Promise<{ url: string; key: string }> {
    if (!r2Client) {
      // Dev mock — return a placeholder URL
      console.log(`[StorageService DEV] Would upload: ${key}`);
      return { url: `${PUBLIC_URL}/${key}`, key };
    }

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file,
        ContentType: mimeType,
      })
    );

    return { url: `${PUBLIC_URL}/${key}`, key };
  },

  async deleteFile(key: string): Promise<void> {
    if (!r2Client) {
      console.log(`[StorageService DEV] Would delete: ${key}`);
      return;
    }
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  },

  generateUploadKey(folder: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `${folder}/${Date.now()}-${sanitized}`;
  },
};
