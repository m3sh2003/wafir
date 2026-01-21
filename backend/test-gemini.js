const https = require('https');

const models = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001'
];

function testModel(model) {
    const data = JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=AIzaSyDTFAZvuO8rykaehTLwfHFJPHw_GEFDkZs`,
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
