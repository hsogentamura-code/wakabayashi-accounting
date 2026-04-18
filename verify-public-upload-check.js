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

async function verifySignedUrl() {
    console.log('--- Verifying Signed URL Access ---');
    // Using the public_id from the FAILED 401 test
    const publicId = "debug_access/woergwhfavbnwoplykl8.pdf";
    console.log(`Public ID: ${publicId}`);

    // Generate Signed URL
    const signedUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        sign_url: true, // This adds the signature
        secure: true
    });

    console.log(`Generated Signed URL: ${signedUrl}`);

    try {
        console.log('Checking accessibility...');
        const res = await fetch(signedUrl, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.status === 200 ? '✅ OK' : '❌ Failed'}`);
        if (res.status === 200) console.log('This confirms we NEED signed URLs for raw files.');

    } catch (error) {
        console.error('Error:', error);
    }
}

verifySignedUrl();
