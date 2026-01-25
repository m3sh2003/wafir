const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.uustktapnkmmbvzcpdxn:Mody%40mody123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        console.log('Enabling RLS on transactions...');
        await client.query(`ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY`);

        console.log('Creating Policies...');
        await client.query(`
      CREATE POLICY "Users can see own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = "userId");
      CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");
      CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = "userId");
      CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = "userId");
    `);

        console.log('Granting permissions...');
        await client.query(`GRANT ALL ON TABLE public.transactions TO authenticated`);

        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
