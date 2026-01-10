import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
});

async function bootstrap() {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepository = AppDataSource.getRepository(User);

    const email = 'ahmed@example.com';
    let user = await userRepository.findOneBy({ email });

    if (user) {
        console.log('User exists. Updating password...');
    } else {
        console.log('Creating new user...');
        user = new User();
        user.email = email;
    }

    const salt = await bcrypt.genSalt();
    user.passwordHash = await bcrypt.hash('password123', salt);
    user.name = 'Ahmed';
    user.settings = { currency: 'SAR', locale: 'ar-SA' };
    user.riskProfile = 'Balanced';

    await userRepository.save(user);

    console.log('Seeding complete! User: ahmed@example.com / password123');
    process.exit(0);
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
