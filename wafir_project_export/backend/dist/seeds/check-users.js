"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
});
async function check() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(user_entity_1.User);
    const users = await repo.find();
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (Hash: ${u.passwordHash ? 'YES' : 'NO'})`));
    process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
//# sourceMappingURL=check-users.js.map