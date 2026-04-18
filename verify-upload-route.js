const fs = require('fs');

async function testUploadRoute() {
    console.log('--- Testing /api/admin/upload Route ---');
    const fileName = "2026 0205 回覧.pdf";
    const filePath = './' + fileName;

    // Create dummy file if not exists
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Dummy PDF content for route verification');
    }

    // Prepare FormData
    // In Node.js, we need to carefully construct FormData to match browser behavior
    // Using 'undici' or native fetch in Node 18+ usually works with standard FormData

    try {
        const { Blob } = require('buffer');
        const fileContent = fs.readFileSync(filePath);
        const blob = new Blob([fileContent], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', blob, fileName);

        console.log(`Uploading ${fileName} to http://localhost:3000/api/admin/upload ...`);

        const res = await fetch('http://localhost:3000/api/admin/upload', {
            method: 'POST',
            body: formData,
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);

        if (!res.ok) {
            console.error('Upload failed!');
        } else {
            const json = JSON.parse(text);
            console.log('Success! public_id:', json.public_id);
            console.log('URL:', json.url);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testUploadRoute();
