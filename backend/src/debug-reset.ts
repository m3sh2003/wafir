import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const user = await usersService.findOneByEmail('ahmed@example.com');
    if (user) {
        console.log('Resetting settings for user:', user.id);
        // Clean reset
        await usersService['usersRepository'].query(
            `UPDATE users SET settings = '{"currency": "SAR", "language": "ar", "theme": "light"}'::jsonb WHERE id = $1`,
            [user.id]
        );
        console.log('Reset Done.');
    } else {
        console.log('User ahmed@example.com not found');
    }
    await app.close();
}
bootstrap();
