import { NestFactory } from '@nestjs/core';
import { AppModule as MainModule } from '../app.module';
// Actually we need the main AppModule to access repositories via context or just create a standalone context

import { UsersService } from '../users/users.service';
import { Envelope } from '../budget/entities/envelope.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { arabicCategories } from '../config/initial-data';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MainModule);
    const usersRepository = app.get(getRepositoryToken(User));
    const envelopeRepository = app.get(getRepositoryToken(Envelope));

    console.log('Starting envelope repair...');

    const users = await usersRepository.find();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        const count = await envelopeRepository.count({ where: { userId: user.id } });
        if (count === 0) {
            console.log(`User ${user.email} has 0 envelopes. Initializing...`);
            for (const cat of arabicCategories) {
                const envelope = envelopeRepository.create({
                    name: cat.name,
                    limitAmount: 0,
                    period: 'Monthly',
                    userId: user.id
                });
                await envelopeRepository.save(envelope);
            }
            console.log(`Initialized envelopes for ${user.email}`);
        } else {
            console.log(`User ${user.email} already has ${count} envelopes.`);
        }
    }

    console.log('Repair complete.');
    await app.close();
}

bootstrap();
