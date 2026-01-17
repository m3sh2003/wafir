"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const users_service_1 = require("./users/users.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    const user = await usersService.findOneByEmail('ahmed@example.com');
    if (user) {
        console.log('Resetting settings for user:', user.id);
        await usersService['usersRepository'].query(`UPDATE users SET settings = '{"currency": "SAR", "language": "ar", "theme": "light"}'::jsonb WHERE id = $1`, [user.id]);
        console.log('Reset Done.');
    }
    else {
        console.log('User ahmed@example.com not found');
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=debug-reset.js.map