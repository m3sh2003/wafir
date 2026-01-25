const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        console.log('Confirming email...');
        await client.query("UPDATE auth.users SET email_confirmed_at = now() WHERE id = '33516dfe-52d9-41f7-bf02-cc507f8e7746'");

        console.log('Creating public user...');
        await client.query(`
      INSERT INTO public.users (id, email, "passwordHash", name) 
      VALUES ('33516dfe-52d9-41f7-bf02-cc507f8e7746', 'ahmed.test@gmail.com', 'dummy_hash', 'Ahmed Test')
      ON CONFLICT (id) DO NOTHING
    `);

        console.log('Moving envelopes...');
        const res = await client.query(`
      UPDATE public.envelopes SET "userId" = '33516dfe-52d9-41f7-bf02-cc507f8e7746' 
      WHERE "userId" = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    `);
        console.log(`Moved ${res.rowCount} envelopes.`);

        console.log('Deleting old user...');
        await client.query("DELETE FROM public.users WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'");

        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
