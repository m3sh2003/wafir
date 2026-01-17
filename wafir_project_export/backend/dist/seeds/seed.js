"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const AppDataSource = new typeorm_1.DataSource({
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
    const userRepository = AppDataSource.getRepository(user_entity_1.User);
    const email = 'ahmed@example.com';
    let user = await userRepository.findOneBy({ email });
    if (user) {
        console.log('User exists. Updating password...');
    }
    else {
        console.log('Creating new user...');
        user = new user_entity_1.User();
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
//# sourceMappingURL=seed.js.map