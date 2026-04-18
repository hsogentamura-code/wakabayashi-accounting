const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

async function verifySignedVersion() {
    console.log('--- Verifying Signed URL with Correct Version ---');
    const publicId = "debug_access/woergwhfavbnwoplykl8.pdf";
    const version = "1771343766";

    // Generate Signed URL with explicit version
    const signedUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        sign_url: true,
        version: version,
        secure: true
    });

    console.log(`Generated Signed URL: ${signedUrl}`);

    try {
        const res = await fetch(signedUrl, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.status === 200 ? '✅ OK' : '❌ Failed'}`);
        if (res.status === 200) {
            console.log("SUCCESS! We need to use versioned signed URLs.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

verifySignedVersion();
