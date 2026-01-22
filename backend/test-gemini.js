const https = require('https');

const models = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001'
];

const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '.env');
let apiKey = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    process.exit(1);
}

function testModel(model) {
    const data = JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        console.log(`[${model}] STATUS: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log(`[${model}] SUCCESS!`);
        }
    });

    req.on('error', (e) => {
        console.error(`[${model}] ERROR: ${e.message}`);
    });

    req.write(data);
    req.end();
}

console.log("Testing Models...");
models.forEach(m => testModel(m));
