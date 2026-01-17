const bcrypt = require('bcrypt');

async function generate() {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('password123', salt);
    console.log(hash);
}

generate();
