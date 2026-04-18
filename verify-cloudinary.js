const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

async function verifyCloudinary() {
    console.log('--- Cloudinary Verification ---');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '****' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '****' : 'MISSING');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    console.log('Sanitized Cloud Name:', cloudName);

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    try {
        console.log('\nAttempting check connection...');
        const ping = await cloudinary.api.ping();
        console.log('Ping Success:', ping);

        console.log('\nAttempting test upload...');
        // Upload a small transparent 1x1 GIF
        const result = await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', {
            public_id: 'test_upload_verify',
            folder: 'wakabayashi-west-debug'
        });
        console.log('Upload Success!');
        console.log('URL:', result.secure_url);

        // Clean up
        await cloudinary.uploader.destroy(result.public_id);
        console.log('Cleanup Success.');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error);
    }
}

verifyCloudinary();
