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

async function verifyNewUploadLogic() {
    console.log('--- Cloudinary New Upload Logic Verification ---');

    // Simulate the Logic in src/lib/cloudinary.ts
    const fileName = "2026 0205 回覧.pdf";
    const folder = "wakabayashi-west-debug";

    // Replicate logic exactly
    const public_id = fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt|csv)$/i)
        ? fileName
        : fileName.replace(/\.[^/.]+$/, "");

    const resource_type = fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt|csv)$/i) ? 'raw' : 'auto';

    console.log('Parameters:');
    console.log('fileName:', fileName);
    console.log('public_id:', public_id);
    console.log('resource_type:', resource_type);

    try {
        console.log('Uploading local test file...');
        // Use a real file (we created test_upload.txt earlier, let's reuse it or create a new one)
        // Creating a dummy PDF file (just text really, but named .pdf for test)
        const fs = require('fs');
        fs.writeFileSync('2026 0205 回覧.pdf', 'Dummy PDF content for verification');

        const result = await cloudinary.uploader.upload('2026 0205 回覧.pdf', {
            folder: folder,
            public_id: public_id,
            resource_type: resource_type,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });

        console.log('\nUpload Result:');
        console.log('Public ID:', result.public_id);
        console.log('Secure URL:', result.secure_url);
        console.log('Bytes:', result.bytes); // Check if 0

        console.log('\n--- Check this URL ---');
        console.log(result.secure_url);

    } catch (error) {
        console.error('\n❌ Upload Failed:', error);
    }
}

verifyNewUploadLogic();
