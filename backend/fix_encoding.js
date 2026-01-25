const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Arabic Envelopes
const envelopes = [
    { name: 'المأكل والمشرب', limit: 2000.00 },
    { name: 'السكن', limit: 3000.00 },
    { name: 'النقل والمواصلات', limit: 800.00 },
    { name: 'الفواتير والخدمات', limit: 500.00 },
    { name: 'المطاعم والمقاهي', limit: 600.00 },
    { name: 'العناية الشخصية', limit: 400.00 },
    { name: 'التسوق', limit: 500.00 },
    { name: 'التعليم', limit: 0.00 },
    { name: 'الترفيه', limit: 300.00 },
    { name: 'الادخار', limit: 1000.00 },
    { name: 'الصدقة', limit: 200.00 },
    { name: 'الهدايا', limit: 150.00 },
    { name: 'صندوق الطوارئ', limit: 500.00 },
    { name: 'السفر', limit: 0.00 },
    { name: 'زكاة المال', limit: 0.00 },
    { name: 'الاستثمار', limit: 1000.00 },
];

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        // 1. Delete existing envelopes for this user
        const resDelete = await client.query('DELETE FROM envelopes WHERE "userId" = $1', [userId]);
        console.log(`Deleted ${resDelete.rowCount} envelopes`);

        // 2. Insert new envelopes
        for (const env of envelopes) {
            await client.query(
                `INSERT INTO envelopes (id, name, "limitAmount", period, "userId") 
         VALUES (gen_random_uuid(), $1, $2, 'Monthly', $3)`,
                [env.name, env.limit, userId]
            );
        }
        console.log(`Inserted ${envelopes.length} envelopes with correct encoding`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
