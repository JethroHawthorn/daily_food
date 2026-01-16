const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error("No API Key found in .env");
    process.exit(1);
}

async function fetchModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log("Fetching " + url.replace(key, "HIDDEN_KEY"));
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }
        
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                 console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models returned.");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

fetchModels();
