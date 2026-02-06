// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { detectTextFromBase64 } = require('./vision-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// INCREASE LIMIT: Images are large, default limit is too small
app.use(bodyParser.json({ limit: '10mb' })); 

// --- ROUTE: RAW OCR INGEST ---
app.post('/api/ocr-events/raw', async (req, res) => {
    try {
        const { platform, room_id, capture_type, image_b64 } = req.body;

        // Validation
        if (!image_b64) {
            return res.status(400).json({ error: "Missing image_b64" });
        }

        console.log(`[OCR] Processing ${capture_type} for ${platform}/${room_id}...`);
        
        // 1. Call Vision Service
         const ocrResult = await detectTextFromBase64(image_b64);
        
        // --- SMART FILTER FOR DEMO ---
        // This looks for any number like "5,000" or "5000" in the text
        const numberMatch = ocrResult.fullText.match(/[\d,]+\.?\d*/);
        const cleanBalance = numberMatch ? numberMatch[0] : "No match";
        
        console.log("------------------------------------------------");
        console.log(`RAW TEXT: "${ocrResult.fullText.replace(/\n/g, ' ')}"`);
        console.log(`DETECTED BALANCE: ${cleanBalance}`);
        console.log("------------------------------------------------");

        // 3. Return structured response
        res.json({
            status: "ok",
            data: {
                platform,
                room_id,
                capture_type,
                timestamp: new Date().toISOString(),
                ocr_raw: ocrResult.fullText,
                ocr_words: ocrResult.words
            }
        });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 LBC Backend running on port ${PORT}`);
    console.log(`   Endpoint ready: POST /api/ocr-events/raw`);
});