"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const auth_service_1 = require("../auth/auth.service");
const users_service_1 = require("../users/users.service");
const update_onboarding_dto_1 = require("../users/dto/update-onboarding.dto");
const envelope_entity_1 = require("../budget/entities/envelope.entity");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    console.log('Starting onboarding verification...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    const usersService = app.get(users_service_1.UsersService);
    const dataSource = app.get(typeorm_1.DataSource);
    const testEmail = `onboard_${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);
    try {
        const result = await authService.register({
            email: testEmail,
            password: 'password123',
            name: 'Onboarding Tester'
        });
        const userId = result.user.id;
        console.log('User registered. ID:', userId);
        const dto = {
            riskProfile: update_onboarding_dto_1.RiskProfile.AGGRESSIVE,
            monthlyIncome: 15000,
            budgetLimits: {
                'السكن': 5000,
                'المأكل والمشرب': 2000
            }
        };
        console.log(' calling updateOnboarding...');
        await usersService.updateOnboarding(userId, dto);
        const updatedUser = await usersService.findOneById(userId);
        if (updatedUser?.riskProfile !== update_onboarding_dto_1.RiskProfile.AGGRESSIVE) {
            console.error('FAIL: Risk profile mismatch', updatedUser?.riskProfile);
            process.exit(1);
        }
        if (updatedUser.settings['monthlyIncome'] !== 15000) {
            console.error('FAIL: Monthly income mismatch');
            process.exit(1);
        }
        console.log('User profile updated successfully.');
        const envelopeRepo = dataSource.getRepository(envelope_entity_1.Envelope);
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
    }
    catch (error) {
        console.error('Verification failed', error);
        process.exit(1);
    }
    finally {
        await app.close();
        process.exit(0);
    }
}
bootstrap();
//# sourceMappingURL=verify_onboarding.js.map