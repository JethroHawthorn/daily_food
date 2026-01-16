const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // Just listing models via API if possible, usually requires specific endpoint or just trial.
    // Ensure we can actually create the client.
    console.log("Testing API Key...");
    // There isn't a direct "listModels" method in the high-level SDK easily accessible in all versions.
    // But we can try to generate content with a fallback to see if it works or use the model listing if exposed.
    // Actually, checking documentation, we can't easily list models with the helper NOT initialized with a model.
    // But we can try the basic model. 
    
    // Let's try 'gemini-pro' as a fallback test.
    const validModels = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-pro", "gemini-1.5-pro"];
    
    for (const m of validModels) {
        process.stdout.write(`Testing ${m}... `);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log("OK");
            console.log("Valid model found: " + m);
            process.exit(0);
        } catch (e) {
            console.log("FAILED: " + e.message);
        }
    }
    
    console.log("No working models found from list.");
  } catch (e) {
    console.error(e);
  }
}

listModels();
