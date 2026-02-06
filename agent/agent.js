const screenshot = require('screenshot-desktop');
const Jimp = require('jimp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load Config
const configPath = path.join(__dirname, 'config', 'test.source.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// POINT THIS TO YOUR SERVER (Running in the 'work' folder)
const API_URL = 'http://localhost:3000/api/ocr-events/raw';

async function captureAndSend() {
  try {
    // 1. Take Screenshot of entire screen
    const imgBuffer = await screenshot({ format: 'png' });

    // 2. Process each region in the config
    for (const region of config.regions) {

      // Load image into Jimp
      const image = await Jimp.read(imgBuffer);

      // CROP: x, y, width, height
      image.crop(region.x, region.y, region.width, region.height);

      await image.writeAsync(`debug_${region.type}.png`);
      console.log(`   💾 Saved debug image to agent/debug_${region.type}.png`);


      // Convert to Base64
      const croppedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
      const base64Image = croppedBuffer.toString('base64');

      console.log(`📸 Captured [${region.type}] - Sending to API...`);

      // 3. Send to Backend
      const response = await axios.post(API_URL, {
        platform: config.platform,
        room_id: config.room_id,
        capture_type: region.type,
        image_b64: base64Image
      });

      console.log(`   ✅ API Response: Words found -> ${JSON.stringify(response.data.data.ocr_words)}`);
    }

  } catch (err) {
    // Handle common errors gracefully
    if (err.code === 'ECONNREFUSED') {
      console.error("❌ Error: Is your Backend Server running? (Connection Refused)");
    } else {
      console.error("❌ Error:", err.message);
    }
  }
}

// Start the Loop
console.log(`👀 Agent started for ${config.platform}...`);
console.log(`   Targeting Server: ${API_URL}`);
setInterval(captureAndSend, config.interval_ms);