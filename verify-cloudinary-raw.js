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

async function verifyCloudinaryRaw() {
    console.log('--- Cloudinary RAW Access Verification ---');

    try {
        console.log('Uploading sample PDF as RAW...');
        // Upload a sample PDF as RAW
        const result = await cloudinary.uploader.upload('https://pdfobject.com/pdf/sample.pdf', {
            public_id: 'test_access_raw',
            folder: 'wakabayashi-west-debug',
            resource_type: 'raw', // Explicitly request raw
            type: 'upload'
        });

        console.log('\nUpload Result:');
        console.log('Public ID:', result.public_id);
        console.log('Resource Type:', result.resource_type);
        console.log('Secure URL:', result.secure_url);

        console.log('\n--- Check this RAW URL in browser ---');
        console.log(result.secure_url);

    } catch (error) {
        console.error('\n❌ Upload Failed:', error);
    }
}

verifyCloudinaryRaw();
