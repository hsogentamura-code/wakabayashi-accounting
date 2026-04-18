import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not set in environment variables');
}

export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    // Required for R2
    forcePathStyle: true,
});

/**
 * Parses full public R2 URLs, extracts the necessary object keys (including thumbnails if applicable), 
 * and deletes them from the bucket.
 */
export async function deleteFromR2(urls: string[]) {
    if (urls.length === 0) return;

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
        throw new Error('R2_BUCKET_NAME is not set');
    }

    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

    const keysToDelete: { Key: string }[] = [];

    for (const url of urls) {
        try {
            // Only process URLs that belong to our R2 bucket
            if (!url.startsWith(publicUrlBase) && !url.includes('r2.cloudflarestorage.com') && !url.includes('r2.dev')) {
                continue;
            }

            // Extract the filename (object key) from the URL
            const urlObj = new URL(url);
            let objectKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

            // If the public URL has a subpath, we might need to strip it depending on bucket structure
            // But typically the path after the domain IS the object key in R2.
            // Let's ensure we strip the public URL base properly if used
            if (publicUrlBase && url.startsWith(publicUrlBase)) {
                const baseObj = new URL(publicUrlBase);
                const fullPath = urlObj.pathname;
                const basePath = baseObj.pathname;
                if (fullPath.startsWith(basePath)) {
                    objectKey = fullPath.substring(basePath.length);
                    if (objectKey.startsWith('/')) objectKey = objectKey.substring(1);
                }
            }

            if (!objectKey) continue;

            keysToDelete.push({ Key: objectKey });

            // Also queue the thumbnail for deletion if it's an image or PDF
            const lastDotIndex = objectKey.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                const ext = objectKey.substring(lastDotIndex).toLowerCase();
                if (['.pdf', '.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                    const baseName = objectKey.substring(0, lastDotIndex);
                    const thumbKey = `${baseName}_thumb.jpg`;
                    keysToDelete.push({ Key: thumbKey });
                }
            }
        } catch (e) {
            console.error('Failed to parse URL for deletion:', url, e);
        }
    }

    if (keysToDelete.length === 0) return;

    try {
        console.log(`Attempting to delete ${keysToDelete.length} objects from R2...`, keysToDelete);
        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: keysToDelete,
                Quiet: false,
            }
        });
        const response = await r2Client.send(command);
        console.log('R2 deletion response:', response.Deleted);
        if (response.Errors && response.Errors.length > 0) {
            console.error('Some R2 objects failed to delete:', response.Errors);
        }
    } catch (error) {
        console.error('Error executing R2 deletion:', error);
    }
}
