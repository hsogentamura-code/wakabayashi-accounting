import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error("Missing R2 credentials in .env.local");
    process.exit(1);
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

async function verifyR2() {
    console.log(`Verifying R2 Bucket: ${bucketName}...`);
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: 5
        });
        const response = await s3Client.send(command);
        console.log(`✅ R2 connection successful. Found ${response.Contents?.length || 0} items.`);
        if (response.Contents && response.Contents.length > 0) {
            console.log("Sample items:", response.Contents.map(c => c.Key).join(', '));
        }
    } catch (e: any) {
        console.error("❌ Failed to access R2 bucket:", e.message);
    }
}

verifyR2();
