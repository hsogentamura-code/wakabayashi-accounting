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

async function verifyCloudinarySigned() {
    console.log('--- Cloudinary Signed URL Verification ---');

    try {
        console.log('Uploading sample text file (RAW)...');
        const result = await cloudinary.uploader.upload('./test_upload.txt', {
            public_id: 'test_access_signed',
            folder: 'wakabayashi-west-debug',
            resource_type: 'raw',
            type: 'upload',
            overwrite: true
        });

        const publicUrl = result.secure_url;

        // Generate Signed URL
        // sign_url usually used for transformations, but for raw files in restricted mode, we might need 'authenticated' type.
        // But let's try generating a signature for the existing public file just in case the user has "Strict Transformations" on even for raw? (Unlikely)

        // Actually, if the type is 'upload', it SHOULD be public.
        // If it's 401ing, maybe the account defaults new uploads to 'authenticated'?
        // Let's try to upload explicitly as 'authenticated' and gen a signed URL.

        console.log('Uploading another as type: authenticated...');
        const authResult = await cloudinary.uploader.upload('./test_upload.txt', {
            public_id: 'test_access_auth',
            folder: 'wakabayashi-west-debug',
            resource_type: 'raw',
            type: 'authenticated', // Private
            overwrite: true,
            // No sign_url: true needed here, we generate it manually below
        });

        // Construct Signed URL for authenticated asset
        const signedUrl = cloudinary.url(authResult.public_id, {
            resource_type: 'raw',
            type: 'authenticated',
            secure: true,
            sign_url: true,
            auth_token: { // Token based auth might be needed if not using signed URL format?
                // Actually cloudinary.url with sign_url: true (and config set) should handle it for transformations.
                // For raw/authenticated, we often need a signed delivery URL.
            }
        });

        // Simple manual generation for authenticated resource to be sure
        // Format: https://res.cloudinary.com/<cloud_name>/<resource_type>/authenticated/s--<signature>--/<version>/<public_id>.<extension>
        // Utilizing the SDK to do this.
        const generatedSignedUrl = cloudinary.url(authResult.public_id, {
            resource_type: 'raw',
            type: 'authenticated',
            secure: true,
            sign_url: true
        });


        console.log('\n--- URLs to Test ---');
        console.log('\n1. Standard Public URL (Should fail if previous one failed):');
        console.log(publicUrl);

        console.log('\n2. Authenticated Signed URL (Should work even if strict):');
        console.log(generatedSignedUrl);

    } catch (error) {
        console.error('\n❌ Upload Failed:', error);
    }
}

verifyCloudinarySigned();
