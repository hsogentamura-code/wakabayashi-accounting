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

async function inspectResource() {
    console.log('--- Inspecting Resource ---');
    const publicId = "debug_access/woergwhfavbnwoplykl8.pdf";

    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: 'raw'
        });

        console.log('Resource Details:');
        console.log('Public ID:', result.public_id);
        console.log('Type:', result.type);
        console.log('Access Mode:', result.access_mode);
        console.log('URL:', result.secure_url);

    } catch (error) {
        console.error('Error inspecting:', error);
    }
}

inspectResource();
