const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

async function verifyBasicAuth() {
    console.log('--- Verifying Basic Auth Access ---');
    // Using one of the 401 URLs
    const url = "https://res.cloudinary.com/djxqbod9s/raw/upload/v1771343766/debug_access/woergwhfavbnwoplykl8.pdf";

    // Authorization header: Basic base64(api_key:api_secret)
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const res = await fetch(url, {
            method: 'HEAD',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        console.log(`Status: ${res.status} ${res.status === 200 ? '✅ OK' : '❌ Failed'}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyBasicAuth();
