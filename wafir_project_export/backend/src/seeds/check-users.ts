import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // IMPORTANT: Ensure this matches app config
});

async function check() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    const users = await repo.find();
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (Hash: ${u.passwordHash ? 'YES' : 'NO'})`));
    process.exit(0);
}

check().catch(err => { console.error(err); process.exit(1); });
