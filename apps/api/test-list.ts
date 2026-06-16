import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

async function testR2() {
  try {
    const data = await r2.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Prefix: 'thumbnails/',
    }));
    console.log("Objects in thumbnails/:", data.Contents?.map(c => c.Key));
  } catch (error) {
    console.error("FAILED:", error);
  }
}

testR2();
