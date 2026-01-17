
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { UpdateOnboardingDto, RiskProfile } from '../users/dto/update-onboarding.dto';
import { Envelope } from '../budget/entities/envelope.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
    console.log('Starting onboarding verification...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    const dataSource = app.get(DataSource);

    const testEmail = `onboard_${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);

    try {
        // 1. Register (Triggering initialization)
        const result = await authService.register({
            email: testEmail,
            password: 'password123',
            name: 'Onboarding Tester'
        });
        const userId = result.user.id;
        console.log('User registered. ID:', userId);

        // 2. Mock Frontend Payload
        const dto: UpdateOnboardingDto = {
            riskProfile: RiskProfile.AGGRESSIVE,
            monthlyIncome: 15000,
            budgetLimits: {
                'السكن': 5000,
                'المأكل والمشرب': 2000
            }
        };

        // 3. Call Service directly (simulating Controller)
        console.log(' calling updateOnboarding...');
        await usersService.updateOnboarding(userId, dto);

        // 4. Verify User Profile
        const updatedUser = await usersService.findOneById(userId);
        if (updatedUser?.riskProfile !== RiskProfile.AGGRESSIVE) {
            console.error('FAIL: Risk profile mismatch', updatedUser?.riskProfile);
            process.exit(1);
        }
        if (updatedUser.settings['monthlyIncome'] !== 15000) {
            console.error('FAIL: Monthly income mismatch');
            process.exit(1);
        }
        console.log('User profile updated successfully.');

        // 5. Verify Envelopes
        const envelopeRepo = dataSource.getRepository(Envelope);
        const envelopes = await envelopeRepo.find({ where: { userId } });

        const housing = envelopes.find(e => e.name === 'السكن');
        const food = envelopes.find(e => e.name === 'المأكل والمشرب');
        const transport = envelopes.find(e => e.name === 'النقل والمواصلات');

        if (Number(housing?.limitAmount) !== 5000) {
            console.error('FAIL: Housing limit not updated', housing?.limitAmount);
            process.exit(1);
        }
        if (Number(food?.limitAmount) !== 2000) {
            console.error('FAIL: Food limit not updated', food?.limitAmount);
            process.exit(1);
        }
        if (Number(transport?.limitAmount) !== 0) {
            console.error('FAIL: Transport limit should be 0 (untouched)', transport?.limitAmount);
            process.exit(1);
        }

        console.log('SUCCESS: Onboarding verification passed!');

    } catch (error) {
        console.error('Verification failed', error);
        process.exit(1);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
