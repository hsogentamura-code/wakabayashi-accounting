async function compareHeaders() {
    const urlWorking = "https://res.cloudinary.com/djxqbod9s/raw/upload/v1771341416/wakabayashi-west-debug/2026%200205%20%E5%9B%9E%E8%A6%A7.pdf";
    const urlFailing = "https://res.cloudinary.com/djxqbod9s/raw/upload/v1771343121/wakabayashi-west/2026%200205%20%E5%9B%9E%E8%A6%A7_1771343119713.pdf";

    console.log(`\n--- Working URL (${urlWorking}) ---`);
    try {
        const res = await fetch(urlWorking, { method: 'HEAD' });
        console.log('Status:', res.status);
    } catch (e) { console.error(e.message); }

    console.log(`\n--- Failing URL (${urlFailing}) ---`);
    try {
        const res = await fetch(urlFailing, { method: 'HEAD' });
        console.log('Status:', res.status);
        if (res.status === 401) console.log('This means the file is Authenticated/Private.');
    } catch (e) { console.error(e.message); }
}

compareHeaders();
