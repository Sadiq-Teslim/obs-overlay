// vision-service.js (THE GEMINI VERSION)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function detectTextFromBase64(base64String) {
    try {
        // 1. Clean the Base64 string
        const cleanString = base64String.replace(/^data:image\/\w+;base64,/, "");

        // 2. Select the Model (Flash is fast and cheap/free)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        // 3. Construct the Request
        // We ask for JSON specifically to keep your existing backend logic happy.
        const prompt = `
            Look at this image. Extract the numeric balance and any text found.
            Return ONLY a raw JSON object with this format (no markdown):
            { "fullText": "the whole text found", "words": ["array", "of", "words"] }
        `;

        const imagePart = {
            inlineData: {
                data: cleanString,
                mimeType: "image/png",
            },
        };

        // 4. Send to AI
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // 5. Clean up the AI response (sometimes it wraps code in ```json ... ```)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // 6. Parse JSON
        const data = JSON.parse(text);

        return {
            fullText: data.fullText || "",
            words: data.words || []
        };

    } catch (error) {
        console.error("Gemini AI Error:", error);
        // Fallback so server doesn't crash
        return { fullText: "", words: [] };
    }
}

module.exports = { detectTextFromBase64 };