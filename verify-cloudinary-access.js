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

async function verifyCloudinaryAccess() {
    console.log('--- Cloudinary Access Verification ---');

    try {
        console.log('Uploading sample PDF...');
        // Upload a sample PDF
        const result = await cloudinary.uploader.upload('https://pdfobject.com/pdf/sample.pdf', {
            public_id: 'test_access_pdf',
            folder: 'wakabayashi-west-debug',
            resource_type: 'auto',
            // Explicitly requesting 'upload' type (public) to be sure
            type: 'upload'
        });

        console.log('\nUpload Result:');
        console.log('Public ID:', result.public_id);
        console.log('Resource Type:', result.resource_type); // Should be 'image' or 'raw' (PDF usually image/page)
        console.log('Type:', result.type); // Should be 'upload' (public)
        console.log('Access Mode:', result.access_mode); // Should be 'public'
        console.log('Secure URL:', result.secure_url);

        console.log('\n--- Check this URL in browser ---');
        console.log(result.secure_url);

        // Don't delete immediately so user can test
        // await cloudinary.uploader.destroy(result.public_id);

    } catch (error) {
        console.error('\n❌ Upload Failed:', error);
    }
}

verifyCloudinaryAccess();
