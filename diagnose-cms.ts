
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;

if (!serviceDomain) {
    console.error('Service Domain is missing.');
    process.exit(1);
}

async function checkEndpoint(endpoint: string) {
    const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}`;
    console.log(`\nChecking ${url} (without API Key)...`);

    try {
        // Send request WITHOUT API Key to check for 401 vs 404
        const response = await fetch(url);

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
            console.log('✅ Result: 401 Unauthorized.');
            console.log('   -> This means the ENDPOINT EXISTS and the DOMAIN IS CORRECT.');
            console.log('   -> The issue is likely with your API KEY permissions.');
        } else if (response.status === 404) {
            console.log('❌ Result: 404 Not Found.');
            console.log('   -> This means the ENDPOINT DOES NOT EXIST or the SERVICE DOMAIN is wrong.');
        } else {
            console.log(`   -> Unexpected status: ${response.status}`);
        }
    } catch (error: any) {
        console.error('Network Error:', error.message);
    }
}

async function run() {
    console.log(`Diagnosing Service Domain: ${serviceDomain}`);
    await checkEndpoint('news');
    await checkEndpoint('events');
    await checkEndpoint('resources');

    // Try a random one to verify 404 behavior
    await checkEndpoint('random-endpoint-that-does-not-exist');
}

run();
