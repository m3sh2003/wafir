
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Envelope } from '../budget/entities/envelope.entity';
import { join } from 'path';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [
        join(__dirname, '..', '**', '*.entity{.ts,.js}')
    ],
    synchronize: false,
});

async function run() {
    await AppDataSource.initialize();
    console.log('Connected to DB');

    const users = await AppDataSource.manager.find(User);
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
        console.log(`- ${u.name} (${u.email}) ID: ${u.id}`);
        // Count envelopes
        const envelopes = await AppDataSource.manager.find(Envelope, { where: { userId: u.id } });
        console.log(`  Envelopes: ${envelopes.length}`);
        envelopes.forEach(e => console.log(`    - ${e.name} (${e.limitAmount})`));
    }

    const allEnvelopes = await AppDataSource.manager.find(Envelope);
    console.log(`Total Envelopes in DB: ${allEnvelopes.length}`);

    process.exit(0);
}

run().catch(console.error);
