"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const auth_service_1 = require("../auth/auth.service");
const users_service_1 = require("../users/users.service");
const envelope_entity_1 = require("../budget/entities/envelope.entity");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    console.log('Starting verification...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    const usersService = app.get(users_service_1.UsersService);
    const dataSource = app.get(typeorm_1.DataSource);
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
        const envelopeRepo = dataSource.getRepository(envelope_entity_1.Envelope);
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
//# sourceMappingURL=verify_user_init.js.map