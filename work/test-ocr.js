const fs = require('fs');
// If using Node v18+, 'fetch' is built-in. If older, uncomment line below:
// const fetch = require('node-fetch'); 

async function runTest() {
    try {
        console.log("1. Reading test.png...");
        // Read the file and convert to Base64
        const imageBitmap = fs.readFileSync('./test.png');
        const base64Image = imageBitmap.toString('base64');

        console.log("2. Sending to API...");
        const response = await fetch('http://localhost:3000/api/ocr-events/raw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform: "debug_platform",
                room_id: "debug_room",
                capture_type: "balance", // telling the API this is a balance check
                image_b64: base64Image
            })
        });

        const result = await response.json();

        console.log("------------------------------------------------");
        console.log("STATUS:", response.status);
        if (result.data) {
            console.log("RAW TEXT DETECTED:", result.data.ocr_raw);
            console.log("WORDS ARRAY:", result.data.ocr_words);
        } else {
            console.log("ERROR RESPONSE:", result);
        }
        console.log("------------------------------------------------");

    } catch (err) {
        console.error("TEST FAILED:", err);
    }
}

runTest();