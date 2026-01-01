import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API key provided");
        process.exit(1);
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("--- Testing Models ---");

    // 1. Test Gemini 3 Flash Preview
    const flashModelName = "gemini-3-flash-preview";
    try {
        console.log(`Testing ${flashModelName}...`);
        const model = genAI.getGenerativeModel({ model: flashModelName });
        const res = await model.generateContent("Hello, are you there?");
        console.log(`✅ ${flashModelName} is available.`);
        console.log(`Response: ${res.response.text().slice(0, 50)}...`);
    } catch (e: any) {
        console.log(`❌ ${flashModelName} failed: ${e.message}`);
    }

    // 2. Test Gemini Embedding 001
    const embedModelName = "gemini-embedding-001";
    try {
        console.log(`\nTesting ${embedModelName}...`);
        const model = genAI.getGenerativeModel({ model: embedModelName });
        const res = await model.embedContent("Hello world");
        console.log(`✅ ${embedModelName} is available.`);
        console.log(`Dimensions: ${res.embedding.values.length}`);
    } catch (e: any) {
        console.log(`❌ ${embedModelName} failed: ${e.message}`);
    }
}

test();
