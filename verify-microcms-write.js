// Native fetch is available in Node 18+
require('dotenv').config({ path: '.env.local' });

async function verifyMicroCMSWrite() {
    console.log('--- MicroCMS Write Verification ---');

    // 1. Check Env Vars
    const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
    const apiKey = process.env.MICROCMS_MGMT_API_KEY;

    console.log('Service Domain:', serviceDomain);
    console.log('API Key:', apiKey ? '****' + apiKey.slice(-4) : 'MISSING');

    if (!serviceDomain || !apiKey) {
        console.error('❌ Missing credentials.');
        return;
    }

    const endpoint = 'news'; // Testing with 'news' endpoint
    const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}`;

    // 2. Prepare Test Payload
    // Minimal payload based on schema
    const payload = {
        title: 'API Test Post WITH Attachment',
        category: ['announcement'], // Array for select field
        date: new Date().toISOString().split('T')[0],
        content: 'This post includes an attachment test.',
        isImportant: false,
        attachments: [
            {
                fieldId: 'attachments', // Corrected: Match Custom Field ID (plural)
                title: 'Test File',
                fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                type: ['image'] // Array for select field
            }
        ]
    };

    console.log('\nAttempting to POST to:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MICROCMS-API-KEY': apiKey,
            },
            body: JSON.stringify(payload),
        });

        console.log('\nResponse Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Content Created.');
            console.log('ID:', data.id);
            console.log('Please delete this content from MicroCMS dashboard manually.');
        } else {
            console.error('❌ Failed.');
            const errorText = await response.text();
            console.error('Error Body:', errorText);
        }

    } catch (error) {
        console.error('❌ Network/System Error:', error);
    }
}

// Check for fetch compatibility
if (!globalThis.fetch) {
    console.log('Node version might be too old for native fetch. Installing node-fetch...');
    // In a real environment we might need to install it, but here we assume modern Node 
    // or we might need `npm install node-fetch` if it fails.
    // For now, let's try to run.
}

verifyMicroCMSWrite();
