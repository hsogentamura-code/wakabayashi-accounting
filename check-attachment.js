async function checkAttachment() {
    const baseUrl = "https://res.cloudinary.com/djxqbod9s/raw/upload/v1771343121/wakabayashi-west/2026%200205%20%E5%9B%9E%E8%A6%A7_1771343119713.pdf";
    const attachmentUrl = "https://res.cloudinary.com/djxqbod9s/raw/upload/fl_attachment/v1771343121/wakabayashi-west/2026%200205%20%E5%9B%9E%E8%A6%A7_1771343119713.pdf";

    // Cloudinary might fail if we ask for fl_attachment on a raw file if not handled right
    // Let's also try naming it
    // fl_attachment:test_file works?
    const namedUrl = "https://res.cloudinary.com/djxqbod9s/raw/upload/fl_attachment:testfile/v1771343121/wakabayashi-west/2026%200205%20%E5%9B%9E%E8%A6%A7_1771343119713.pdf";

    const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36' };

    console.log('--- Checking Base URL ---');
    try {
        const res = await fetch(baseUrl, { method: 'HEAD', headers });
        console.log('Status:', res.status);
        console.log('CD:', res.headers.get('content-disposition'));
        console.log('CT:', res.headers.get('content-type'));
    } catch (e) { console.error(e.message); }

    console.log('\n--- Checking Attachment URL ---');
    try {
        const res = await fetch(attachmentUrl, { method: 'HEAD', headers });
        console.log('Status:', res.status);
        console.log('CD:', res.headers.get('content-disposition'));
    } catch (e) { console.error(e.message); }

    console.log('\n--- Checking Named Attachment URL ---');
    try {
        const res = await fetch(namedUrl, { method: 'HEAD', headers });
        console.log('Status:', res.status);
        console.log('CD:', res.headers.get('content-disposition'));
    } catch (e) { console.error(e.message); }
}

checkAttachment();
