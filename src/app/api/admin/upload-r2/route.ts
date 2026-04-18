import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isAuthenticated } from '@/lib/auth';
import { r2Client } from '@/lib/r2';

export async function POST(request: NextRequest) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { filename, fileType } = await request.json();

        if (!filename || !fileType) {
            return NextResponse.json({ error: 'Filename and fileType are required' }, { status: 400 });
        }

        // Generate a unique filename to prevent overwrites
        const uniqueFileName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueFileName,
            ContentType: fileType,
        });

        // Generate a pre-signed URL valid for 5 minutes
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

        // Construct the expected public URL for the client to use after upload
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFileName}`;

        // If it's a PDF or an image, also generate a presigned URL for its thumbnail
        let thumbSignedUrl = null;
        if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
            const lastDotIndex = uniqueFileName.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 ? uniqueFileName.substring(0, lastDotIndex) : uniqueFileName;
            const thumbFileName = `${baseName}_thumb.jpg`;
            const thumbCommand = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: thumbFileName,
                ContentType: 'image/jpeg',
            });
            thumbSignedUrl = await getSignedUrl(r2Client, thumbCommand, { expiresIn: 300 });
        }

        return NextResponse.json({ signedUrl, publicUrl, fileName: uniqueFileName, thumbSignedUrl });
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
