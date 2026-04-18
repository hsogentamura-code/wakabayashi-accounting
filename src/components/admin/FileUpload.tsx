'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
    onUploadComplete: (url: string, fileName: string, type: 'pdf' | 'image' | 'video' | 'other') => void;
}

async function generatePdfThumbnail(file: File): Promise<Blob | null> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.0 });
        const scale = 800 / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return null;

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
            canvasContext: context,
            viewport: scaledViewport
        }).promise;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
        });
    } catch (error) {
        console.error('Error generating PDF thumbnail:', error);
        return null;
    }
}

async function generateImageThumbnail(file: File): Promise<Blob | null> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 800; // サムネイルの最大長辺

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                console.log('Thumbnail blob generated:', blob?.size, 'bytes');
                resolve(blob);
            }, 'image/jpeg', 0.8);
        };
        img.onerror = (err) => {
            console.error('Error loading image for thumbnail:', err);
            URL.revokeObjectURL(url);
            resolve(null);
        };
        img.src = url;
    });
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const isPdf = file.type === 'application/pdf';
            const isImage = file.type.startsWith('image/');

            // 1. Get pre-signed URL from our new API route
            const res = await fetch('/api/admin/upload-r2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, fileType: file.type })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to get upload URL');
            }

            const { signedUrl, publicUrl, thumbSignedUrl } = await res.json();

            // 2. Upload the file directly to Cloudflare R2 using the pre-signed URL
            // This bypasses Vercel's 4.5MB payload limit entirely.

            const uploadPromises = [];

            uploadPromises.push(
                fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type }
                }).then(res => {
                    if (!res.ok) throw new Error('Failed to upload file to Cloudflare storage');
                })
            );

            if ((isPdf || isImage) && thumbSignedUrl) {
                console.log('Generating thumbnail for type:', file.type, 'URL:', thumbSignedUrl.substring(0, 50) + '...');
                const thumbBlob = isPdf ? await generatePdfThumbnail(file) : await generateImageThumbnail(file);

                if (thumbBlob) {
                    console.log('Uploading thumbnail blob...', thumbBlob.size);
                    uploadPromises.push(
                        fetch(thumbSignedUrl, {
                            method: 'PUT',
                            body: thumbBlob,
                            headers: { 'Content-Type': 'image/jpeg' }
                        }).then(res => {
                            if (!res.ok) {
                                console.error('Failed to upload thumbnail, status:', res.status, res.statusText);
                            } else {
                                console.log('Thumbnail uploaded successfully!');
                            }
                        }).catch(err => {
                            console.error('Fetch error during thumbnail upload:', err);
                        })
                    );
                } else {
                    console.error('Failed to generate thumbnail blob (returned null)');
                }
            } else {
                console.log('Skipping thumbnail upload. Condition:', { isPdf, isImage, hasUrl: !!thumbSignedUrl });
            }

            // Wait for all uploads to complete
            await Promise.all(uploadPromises);
            console.log('All uploads completed');

            // Calculate size in KB for logging
            const kbSize = (file.size / 1024).toFixed(0);
            console.log(`Upload successful: ${kbSize} KB`);

            let type: 'pdf' | 'image' | 'video' | 'other' = 'other';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (isPdf) type = 'pdf';

            // Pass the public R2 URL back to the parent form
            onUploadComplete(publicUrl, file.name, type);
        } catch (error) {
            console.error(error);
            alert(`アップロードに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: uploading ? '#ccc' : '#D68C45',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                }}
            >
                {uploading ? 'アップロード中...' : 'ファイルを追加 (PDF/画像)'}
            </button>
        </div>
    );
}
