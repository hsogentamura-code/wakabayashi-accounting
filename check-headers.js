async function checkHeaders() {
    const url = "https://res.cloudinary.com/djxqbod9s/raw/upload/v1771343121/wakabayashi-west/2026%200205%20%E5%9B%9E%E8%A6%A7_1771343119713.pdf";
    console.log(`Checking headers for: ${url}`);

    try {
        const res = await fetch(url, { method: 'HEAD' });
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));
        console.log('Content-Disposition:', res.headers.get('content-disposition'));
        console.log('Content-Length:', res.headers.get('content-length'));
    } catch (error) {
        console.error('Error fetching headers:', error);
    }
}

checkHeaders();
