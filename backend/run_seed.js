const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    user: 'postgres',
    host: '127.0.0.1', // Using 127.0.0.1 as per .env
    database: 'wafir',
    password: 'postgres',
    port: 5433,
});

async function runSeed() {
    try {
        await client.connect();
        console.log('Connected to database');

        const sqlPath = path.join(__dirname, '../seed_full.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL script...');
        await client.query(sql);
        console.log('Seed executed successfully!');
    } catch (err) {
        console.error('Error executing seed:', err);
    } finally {
        await client.end();
    }
}

runSeed();
