const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

const OLD_ID = '33516dfe-52d9-41f7-bf02-cc507f8e7746'; // The orphaned ID
const NEW_ID = 'a59136e8-5f3f-4a73-a00e-2ac1ce8652b5'; // The latest ID

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        console.log('Confirming email for NEW_ID...');
        await client.query(`UPDATE auth.users SET email_confirmed_at = now() WHERE id = '${NEW_ID}'`);

        console.log('Creating public user for NEW_ID...');
        await client.query(`
      INSERT INTO public.users (id, email, "passwordHash", name) 
      VALUES ('${NEW_ID}', 'ahmed.test@gmail.com', 'dummy_hash', 'Ahmed Test')
      ON CONFLICT (id) DO NOTHING
    `);

        console.log('Moving envelopes from OLD_ID to NEW_ID...');
        const res = await client.query(`
      UPDATE public.envelopes SET "userId" = '${NEW_ID}' 
      WHERE "userId" = '${OLD_ID}'
    `);
        console.log(`Moved ${res.rowCount} envelopes.`);

        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
