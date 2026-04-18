const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

// Ensure correct credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

async function verifyArchiveUrl() {
    console.log('--- Verifying Archive URL Access ---');
    const publicId = "debug_access/woergwhfavbnwoplykl8.pdf";
    console.log(`Public ID: ${publicId}`);

    // Generate Archive URL
    // target_format: zip is default
    const archiveUrl = cloudinary.utils.download_archive_url({
        public_ids: [publicId],
        resource_type: 'raw',
        target_format: 'zip'
    });

    console.log(`Generated Archive URL: ${archiveUrl}`);

    try {
        console.log('Checking accessibility...');
        const res = await fetch(archiveUrl, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.status === 200 ? '✅ OK' : '❌ Failed'}`);
        console.log('Content-Type:', res.headers.get('content-type'));

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyArchiveUrl();
