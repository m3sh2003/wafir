const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

const AUTH_ID = '33516dfe-52d9-41f7-bf02-cc507f8e7746'; // The ID that can login
const OTHER_IDS = ['a59136e8-5f3f-4a73-a00e-2ac1ce8652b5', 'd7238656-d5b2-476b-a97a-faba64a9b2bc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'];

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        console.log('Resolving email conflict...');
        const emailRes = await client.query(`SELECT id FROM public.users WHERE email = 'ahmed.test@gmail.com'`);
        if (emailRes.rows.length > 0) {
            const conflictId = emailRes.rows[0].id;
            console.log(`Email belongs to ${conflictId}.`);
            if (conflictId !== AUTH_ID) {
                console.log(`Renaming conflict email...`);
                await client.query(`UPDATE public.users SET email = 'temp_${Date.now()}@temp.com' WHERE id = '${conflictId}'`);

                console.log('Restoring public user for AUTH_ID...');
                await client.query(`
                INSERT INTO public.users (id, email, "passwordHash", name) 
                VALUES ('${AUTH_ID}', 'ahmed.test@gmail.com', 'dummy_hash', 'Ahmed Test')
                ON CONFLICT (id) DO NOTHING
             `);

                console.log(`Moving envelopes from conflict user to AUTH_ID...`);
                await client.query(`UPDATE public.envelopes SET "userId" = '${AUTH_ID}' WHERE "userId" = '${conflictId}'`);

                console.log(`Deleting ${conflictId}...`);
                await client.query(`DELETE FROM public.users WHERE id = '${conflictId}'`);
            } else {
                // Already correct user holding email
                console.log('Email holder is AUTH_ID. Good.');
            }
        } else {
            console.log('Restoring public user for AUTH_ID (No conflict)...');
            await client.query(`
            INSERT INTO public.users (id, email, "passwordHash", name) 
            VALUES ('${AUTH_ID}', 'ahmed.test@gmail.com', 'dummy_hash', 'Ahmed Test')
            ON CONFLICT (id) DO NOTHING
         `);
        }

        console.log('Moving envelopes from OTHER_IDS to AUTH_ID...');
        let totalMoved = 0;

        // Move from any other ID (cleanup)
        for (const oldId of OTHER_IDS) {
            // Skip if this OLD_ID was the ConflictID we just cleaned
            // Update: We only deleted conflictId. Other IDs might still have envelopes?
            // Just run update.
            // But if oldId does not exist in users, but envelopes reference it? Wait constraint?
            // Envelopes FK constraint requires user to exist.
            // If envelopes reference oldId, oldId MUST exist (or we broke integrity).
            // So update is safe.
            const res = await client.query(`UPDATE public.envelopes SET "userId" = '${AUTH_ID}' WHERE "userId" = '${oldId}'`);
            totalMoved += res.rowCount;
        }
        console.log(`Moved ${totalMoved} envelopes to ${AUTH_ID}`);

        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
