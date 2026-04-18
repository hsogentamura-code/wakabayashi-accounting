require('dotenv').config({ path: '.env.local' });

async function verifyMicroCMSRead() {
    console.log('--- MicroCMS Read Verification ---');
    console.log('Service Domain:', process.env.MICROCMS_SERVICE_DOMAIN);
    console.log('Read API Key (MICROCMS_API_KEY):', process.env.MICROCMS_API_KEY ? '****' + process.env.MICROCMS_API_KEY.slice(-4) : 'MISSING');

    if (!process.env.MICROCMS_API_KEY) {
        console.error('❌ MICROCMS_API_KEY is missing from .env.local');
        console.log('Please ensure MICROCMS_API_KEY is set to the same value as MICROCMS_MGMT_API_KEY if using the same key.');
    } else {
        console.log('✅ MICROCMS_API_KEY is present.');
    }
}

verifyMicroCMSRead();
