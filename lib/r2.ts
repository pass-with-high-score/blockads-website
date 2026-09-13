import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "blockads-filters";
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "https://filter.pwhs.app";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn("R2 credentials not fully configured.");
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return s3Client;
}

export async function uploadScreenshotToR2(
  fileBuffer: Buffer,
  mimeType: string,
  originalName?: string
): Promise<string | null> {
  const client = getS3Client();
  if (!client) {
    return null;
  }

  // Determine extension
  let ext = "jpg";
  if (mimeType === "image/png") ext = "png";
  else if (mimeType === "image/webp") ext = "webp";
  else if (mimeType === "image/jpeg" || mimeType === "image/jpg") ext = "jpg";
  else if (originalName && originalName.includes(".")) {
    ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  }

  // Unique filename
  const randomId = crypto.randomBytes(12).toString("hex");
  const fileName = `reports/${Date.now()}-${randomId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await client.send(command);

  return `${publicUrl}/${fileName}`;
}
