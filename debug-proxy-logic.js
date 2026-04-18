const cloudinary = require('cloudinary').v2;
const AdmZip = require('adm-zip');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Ensure correct credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

async function debugProxyLogic() {
    console.log('--- Debugging Proxy Logic ---');
    // public_id extracted from User's URL
    const publicId = "wakabayashi-west/2026 0205 回覧_1771343119713.pdf";
    console.log(`Target Public ID: ${publicId}`);

    try {
        // 1. Generate Signed Archive URL
        const archiveUrl = cloudinary.utils.download_archive_url({
            public_ids: [publicId],
            resource_type: 'raw',
            target_format: 'zip',
            flatten_folders: true,
        });

        console.log(`Generated Archive URL: ${archiveUrl}`);

        // 2. Fetch ZIP
        console.log('Fetching ZIP...');
        const zipRes = await fetch(archiveUrl);
        if (!zipRes.ok) {
            console.error(`Failed to fetch ZIP. Status: ${zipRes.status}`);
            return;
        }

        const zipArrayBuffer = await zipRes.arrayBuffer();
        const zipBuffer = Buffer.from(zipArrayBuffer);
        console.log(`ZIP fetched. Size: ${zipBuffer.length} bytes`);

        // 3. Extract
        console.log('Extracting...');
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();

        console.log(`Found ${zipEntries.length} entries in ZIP.`);
        zipEntries.forEach(entry => {
            console.log(` - Entry: ${entry.entryName} (${entry.header.size} bytes)`);
        });

        if (zipEntries.length > 0) {
            console.log('SUCCESS: File found in ZIP.');
        } else {
            console.error('FAILURE: ZIP is empty.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugProxyLogic();
