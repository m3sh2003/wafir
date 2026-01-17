"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const envelope_entity_1 = require("../budget/entities/envelope.entity");
const path_1 = require("path");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [
        (0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')
    ],
    synchronize: false,
});
async function run() {
    await AppDataSource.initialize();
    console.log('Connected to DB');
    const users = await AppDataSource.manager.find(user_entity_1.User);
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
        console.log(`- ${u.name} (${u.email}) ID: ${u.id}`);
        const envelopes = await AppDataSource.manager.find(envelope_entity_1.Envelope, { where: { userId: u.id } });
        console.log(`  Envelopes: ${envelopes.length}`);
        envelopes.forEach(e => console.log(`    - ${e.name} (${e.limitAmount})`));
    }
    const allEnvelopes = await AppDataSource.manager.find(envelope_entity_1.Envelope);
    console.log(`Total Envelopes in DB: ${allEnvelopes.length}`);
    process.exit(0);
}
run().catch(console.error);
//# sourceMappingURL=debug_check.js.map