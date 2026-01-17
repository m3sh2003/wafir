"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const envelope_entity_1 = require("../budget/entities/envelope.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const initial_data_1 = require("../config/initial-data");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    const envelopeRepository = app.get((0, typeorm_1.getRepositoryToken)(envelope_entity_1.Envelope));
    console.log('Starting envelope repair...');
    const users = await usersRepository.find();
    console.log(`Found ${users.length} users.`);
    for (const user of users) {
        const count = await envelopeRepository.count({ where: { userId: user.id } });
        if (count === 0) {
            console.log(`User ${user.email} has 0 envelopes. Initializing...`);
            for (const cat of initial_data_1.arabicCategories) {
                const envelope = envelopeRepository.create({
                    name: cat.name,
                    limitAmount: 0,
                    period: 'Monthly',
                    userId: user.id
                });
                await envelopeRepository.save(envelope);
            }
            console.log(`Initialized envelopes for ${user.email}`);
        }
        else {
            console.log(`User ${user.email} already has ${count} envelopes.`);
        }
    }
    console.log('Repair complete.');
    await app.close();
}
bootstrap();
//# sourceMappingURL=repair-envelopes.js.map