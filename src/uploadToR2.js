import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs"; // to read a local file

// Replace these values with your own
const ACCOUNT_ID = "your_account_id_here";
const ACCESS_KEY_ID = "your_access_key_id_here";
const SECRET_ACCESS_KEY = "your_secret_access_key_here";
const BUCKET_NAME = "your_bucket_name_here";

// Create the S3 client configured for Cloudflare R2
const s3 = new S3Client({
  region: "auto", // R2 doesn't use a real region, so "auto" is fine
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Important for R2
});

async function uploadFile() {
  try {
    // Read a local file to upload
    const fileStream = fs.createReadStream("./path/to/your/file.jpg");

    // Create the command to upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "file.jpg",  // the name it will have in the bucket
      Body: fileStream,
      ContentType: "image/jpeg", // specify MIME type if known
    });

    // Send the upload command
    const response = await s3.send(command);
    console.log("File uploaded successfully:", response);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

uploadFile();
