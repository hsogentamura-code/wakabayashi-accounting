
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

console.log('--- CMS Configuration Check ---');
console.log('Service Domain:', serviceDomain);
console.log('API Key:', apiKey ? '******' + apiKey.slice(-4) : 'MISSING');

if (!serviceDomain || !apiKey) {
    console.error('Missing environment variables. Verification aborted.');
    process.exit(1);
}

async function verifyEndpoint(endpoint: string) {
    const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}`;
    console.log(`\nFetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                'X-MICROCMS-API-KEY': apiKey as string,
            },
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('Success!', data);
        } else {
            console.error('Failed.');
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error: any) {
        console.error('Network Error:', error.message);
    }
}

async function run() {
    await verifyEndpoint('news');
    await verifyEndpoint('events');
    await verifyEndpoint('resources');
}

run();
