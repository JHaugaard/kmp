import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('No API Key');
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the low level fetch or similar if needed, but getGenerativeModel doesn't have listModels
    // Actually the standard way is to use the REST API via fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

listModels();
