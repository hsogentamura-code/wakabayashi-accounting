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

async function verifyAutoUpload() {
    console.log('--- Verifying Auto Upload (PDF as Image?) ---');
    const fileName = "test_auto.pdf";
    const fs = require('fs');
    // Minimal valid PDF structure
    const pdfContent = `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000111 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`;

    if (!fs.existsSync(fileName) || fs.readFileSync(fileName).toString() !== pdfContent) {
        fs.writeFileSync(fileName, pdfContent);
    }

    try {
        console.log('Uploading with resource_type: auto ...');
        // Note: 'auto' usually detects PDF as 'image' resource type in Cloudinary
        const result = await cloudinary.uploader.upload(fileName, {
            folder: 'debug_auto',
            resource_type: 'auto',
            overwrite: true
        });

        console.log('Resource Type:', result.resource_type);
        console.log('Upload URL:', result.secure_url);

        console.log('Checking accessibility...');
        const res = await fetch(result.secure_url, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.status === 200 ? '✅ OK' : '❌ Failed'}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyAutoUpload();
