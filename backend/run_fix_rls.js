const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        console.log('Enabling RLS...');
        await client.query(`ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY`);

        console.log('Creating Policies...');
        await client.query(`
      CREATE POLICY "Users can see own envelopes" ON public.envelopes FOR SELECT TO authenticated USING (auth.uid() = "userId");
      CREATE POLICY "Users can insert own envelopes" ON public.envelopes FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");
      CREATE POLICY "Users can update own envelopes" ON public.envelopes FOR UPDATE TO authenticated USING (auth.uid() = "userId");
      CREATE POLICY "Users can delete own envelopes" ON public.envelopes FOR DELETE TO authenticated USING (auth.uid() = "userId");
    `);

        console.log('Granting permissions...');
        await client.query(`GRANT ALL ON TABLE public.envelopes TO authenticated`);
        await client.query(`GRANT ALL ON TABLE public.users TO authenticated`); // Might need RLS on users too later

        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
        // Ignore "policy already exists" errors if re-run
    } finally {
        await client.end();
    }
}

run();
