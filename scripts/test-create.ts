import { createClient } from 'microcms-js-sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_API_KEY || ''
});

async function main() {
    const content = {
        date: new Date().toISOString(),
        category: "cz6txckzo",
        type: ["支出"],
        amount: 0,
        amount_expense: 1500,
        description: "Test description field",
        content: "<p>This is the <strong>rich text</strong> content field.</p>",
        attachments: JSON.stringify([{ url: "http://example.com/file.jpg", title: "file.jpg", type: "image", description: "test" }])
    };

    console.log("Sending:", content);

    try {
        const res = await client.create({
            endpoint: "transactions",
            content
        });
        console.log("Success:", res);
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

main();
