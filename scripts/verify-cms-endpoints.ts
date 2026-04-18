import { createClient } from "microcms-js-sdk";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
    console.error("Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY in .env.local");
    process.exit(1);
}

const client = createClient({
    serviceDomain,
    apiKey,
});

async function verify() {
    console.log("Verifying Categories API...");
    try {
        const categories = await client.getList({ endpoint: "categories" });
        console.log("✅ Categories API is accessible. Total items:", categories.totalCount);
        if (categories.totalCount > 0) {
            console.log("Sample item fields:", Object.keys(categories.contents[0]));
        }
    } catch (e: any) {
        console.error("❌ Failed to access Categories API:", e.message);
    }

    console.log("\nVerifying Transactions API...");
    try {
        const transactions = await client.getList({ endpoint: "transactions" });
        console.log("✅ Transactions API is accessible. Total items:", transactions.totalCount);
        if (transactions.totalCount > 0) {
            console.log("Sample item fields:", Object.keys(transactions.contents[0]));
        }
    } catch (e: any) {
        console.error("❌ Failed to access Transactions API:", e.message);
    }
}

verify();
