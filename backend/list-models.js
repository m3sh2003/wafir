const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: '/v1beta/models?key=AIzaSyDTFAZvuO8rykaehTLwfHFJPHw_GEFDkZs',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        fs.writeFileSync('models.json', body);
        console.log('Saved models.json');
    });
});
req.end();
