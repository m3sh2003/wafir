
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { Envelope } from '../budget/entities/envelope.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
    console.log('Starting verification...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    const dataSource = app.get(DataSource);

    const testEmail = `verify_${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);

    try {
        const result = await authService.register({
            email: testEmail,
            password: 'password123',
            name: 'Verification User'
        });

        console.log('User registered via AuthService (simulating signup)');
        const user = result.user;

        console.log(`Checking envelopes for user ${user.id}...`);
        const envelopeRepo = dataSource.getRepository(Envelope);
        const envelopes = await envelopeRepo.find({ where: { userId: user.id } });

        console.log(`Found ${envelopes.length} envelopes.`);
        if (envelopes.length === 0) {
            console.error('FAIL: No envelopes created!');
            process.exit(1);
        }

        const nonZero = envelopes.filter(e => Number(e.limitAmount) > 0);
        if (nonZero.length > 0) {
            console.error('FAIL: Some envelopes have > 0 limit:', nonZero.map(e => `${e.name}: ${e.limitAmount}`));
            process.exit(1);
        }

        console.log('SUCCESS: Envelopes created with 0 limit.');
        envelopes.forEach(e => console.log(`- ${e.name}: ${e.limitAmount}`));

    } catch (error) {
        console.error('Verification failed', error);
        process.exit(1);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
