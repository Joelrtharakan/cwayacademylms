import {
  S3Client, DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

// Cloudflare R2 uses S3-compatible API
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  fileBuffer: Buffer,
  key:        string,
  mimeType:   string
): Promise<{ url: string; key: string }> {
  const upload = new Upload({
    client: r2,
    params: {
      Bucket:      process.env.R2_BUCKET_NAME!,
      Key:         key,
      Body:        fileBuffer,
      ContentType: mimeType,
    },
  })
  await upload.done()
  return {
    key,
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key:    key,
  }))
}

export function generateKey(
  folder: string,
  filename: string
): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
  return `${folder}/${Date.now()}-${sanitized}`
}
