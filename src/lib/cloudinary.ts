import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, folder: string = 'wakabayashi-west') => {
    return new Promise<{ url: string; public_id: string }>(async (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                // Sanitize public_id: use a safe prefix + timestamp to avoid any invalid characters
                public_id: (() => {
                    const pid = `doc_${Date.now()}`;
                    return pid;
                })(),
                resource_type: 'auto',
                use_filename: false, // Force use of specified public_id
                unique_filename: false,
                overwrite: true,
                access_mode: 'public',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    reject(error);
                    return;
                }
                if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                } else {
                    reject(new Error('Upload failed: No result returned'));
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};
