import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isAuthenticated } from '@/lib/auth';
import { r2Client } from '@/lib/r2';

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
]);

const ALLOWED_EXTENSIONS = new Set([
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.heic',
]);

function getExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx !== -1 ? filename.substring(idx).toLowerCase() : '';
}

export async function POST(request: NextRequest) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const { filename, fileType } = body;

        if (!filename || typeof filename !== 'string' || !fileType || typeof fileType !== 'string') {
            return NextResponse.json({ error: 'Filename and fileType are required' }, { status: 400 });
        }

        const ext = getExtension(filename);
        if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(fileType.toLowerCase())) {
            return NextResponse.json(
                { error: '許可されていないファイル形式です（PDFまたは画像のみアップロード可能です）' },
                { status: 400 }
            );
        }

        const baseNameOnly = filename.replace(/^.*[\\\/]/, '');
        const sanitized = baseNameOnly.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueFileName = `${Date.now()}-${sanitized}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueFileName,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFileName}`;

        let thumbSignedUrl = null;
        if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
            const lastDotIndex = uniqueFileName.lastIndexOf('.');
            const base = lastDotIndex !== -1 ? uniqueFileName.substring(0, lastDotIndex) : uniqueFileName;
            const thumbFileName = `${base}_thumb.jpg`;
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
