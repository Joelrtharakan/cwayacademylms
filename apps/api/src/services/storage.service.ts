import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { AppError } from "../utils/errors";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "cway-assets";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://assets.cwayacademy.com";

let s3Client: S3Client | null = null;

if (ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

export const StorageService = {
  /**
   * Generates a safe object key for R2 storage.
   */
  generateUploadKey(folder: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "").toLowerCase();
    return `${folder}/${Date.now()}-${sanitized}`;
  },

  /**
   * Uploads a file buffer to R2 and returns the public URL and key.
   */
  async uploadFile(fileBuffer: Buffer, key: string, mimeType: string) {
    if (!s3Client) {
      console.warn("[StorageService] R2 credentials missing. Saving locally.");
      const fs = require("fs");
      const path = require("path");
      const uploadDir = path.join(process.cwd(), "uploads");
      const fileDir = path.join(uploadDir, path.dirname(key));
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
      
      const filePath = path.join(uploadDir, key);
      fs.writeFileSync(filePath, fileBuffer);
      
      const localUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
      return { url: `${localUrl}/uploads/${key}`, key };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);
      return { url: `${PUBLIC_URL}/${key}`, key };
    } catch (error) {
      console.error("[StorageService] Upload error:", error);
      throw new AppError("Failed to upload file to storage", 500);
    }
  },

  /**
   * Deletes a file from R2.
   */
  async deleteFile(key: string) {
    if (!s3Client) {
      console.warn("[StorageService] R2 credentials missing. Skipping delete.");
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error("[StorageService] Delete error:", error);
      throw new AppError("Failed to delete file from storage", 500);
    }
  },
};
