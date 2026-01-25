const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

const NEW_ID = 'a59136e8-5f3f-4a73-a00e-2ac1ce8652b5'; // The latest ID
const EMAIL = 'ahmed.test@gmail.com';

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        console.log(`Confirming email for ${NEW_ID}...`);
        await client.query(`UPDATE auth.users SET email_confirmed_at = now() WHERE id = '${NEW_ID}'`);

        console.log(`Deleting conflicting public user ${EMAIL}...`);
        // Note: If envelopes reference this user, we might need to detach them first or CASCADE?
        // But since we are updating envelopes later, assume they are on OLD IDs.
        // If envelopes are on 'ahmed.test' (failed insert), delete works if no envelopes.
        // If envelopes exist, update them FIRST to NEW_ID (if NEW_ID existed?) No Newton ID is new.
        // If 'ahmed.test' exists with OTHER ID, update its envelopes to NEW_ID?
        // Let's just delete by email.

        // Safety: Update envelopes of EMAIL user to NEW_ID first if possible?
        // Get ID of email
        const res = await client.query(`SELECT id FROM public.users WHERE email = '${EMAIL}'`);
        if (res.rows.length > 0) {
            const existingId = res.rows[0].id;
            if (existingId !== NEW_ID) {
                console.log(`Found existing user for email with ID: ${existingId}. Renaming email...`);
                await client.query(`UPDATE public.users SET email = 'temp_${Date.now()}@temp.com' WHERE id = '${existingId}'`);

                console.log('Creating public user for NEW_ID...');
                await client.query(`
            INSERT INTO public.users (id, email, "passwordHash", name) 
            VALUES ('${NEW_ID}', '${EMAIL}', 'dummy_hash', 'Ahmed Test')
            ON CONFLICT (id) DO NOTHING
         `);

                console.log('Moving envelopes...');
                await client.query(`UPDATE public.envelopes SET "userId" = '${NEW_ID}' WHERE "userId" = '${existingId}'`);

                console.log(`Deleting old public user ${existingId}...`);
                await client.query(`DELETE FROM public.users WHERE id = '${existingId}'`);
            }
        } else {
            console.log('Creating public user for NEW_ID (No conflict)...');
            await client.query(`
            INSERT INTO public.users (id, email, "passwordHash", name) 
            VALUES ('${NEW_ID}', '${EMAIL}', 'dummy_hash', 'Ahmed Test')
            ON CONFLICT (id) DO NOTHING
         `);
        }

        console.log('Creating public user for NEW_ID...');
        await client.query(`
      INSERT INTO public.users (id, email, "passwordHash", name) 
      VALUES ('${NEW_ID}', '${EMAIL}', 'dummy_hash', 'Ahmed Test')
      ON CONFLICT (id) DO NOTHING
    `);

        // Also migrate from legacy ID
        console.log('Moving envelopes from OLD LEGACY ID...');
        const res2 = await client.query(`
      UPDATE public.envelopes SET "userId" = '${NEW_ID}' 
      WHERE "userId" = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    `);
        console.log(`Moved ${res2.rowCount} legacy envelopes.`);

        // Also migrate from 335... ID
        console.log('Moving envelopes from 335... ID...');
        const res3 = await client.query(`
       UPDATE public.envelopes SET "userId" = '${NEW_ID}' 
       WHERE "userId" = '33516dfe-52d9-41f7-bf02-cc507f8e7746'
    `);
        console.log(`Moved ${res3.rowCount} 335... envelopes.`);


        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
