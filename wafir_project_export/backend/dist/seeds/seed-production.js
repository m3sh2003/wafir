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
const asset_entity_1 = require("../assets/entities/asset.entity");
const account_entity_1 = require("../assets/entities/account.entity");
const holding_entity_1 = require("../assets/entities/holding.entity");
const category_entity_1 = require("../budget/entities/category.entity");
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
    console.log('Database connected for production seeding...');
    const userRepo = AppDataSource.getRepository(user_entity_1.User);
    const assetRepo = AppDataSource.getRepository(asset_entity_1.Asset);
    const accountRepo = AppDataSource.getRepository(account_entity_1.Account);
    const holdingRepo = AppDataSource.getRepository(holding_entity_1.Holding);
    const categoryRepo = AppDataSource.getRepository(category_entity_1.Category);
    const email = 'ahmed@example.com';
    let user = await userRepo.findOneBy({ email });
    if (!user) {
        console.log('Creating User...');
        user = new user_entity_1.User();
        user.email = email;
        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash('password123', salt);
        user.name = 'Ahmed';
        user.settings = { currency: 'SAR', locale: 'ar-SA' };
        user.riskProfile = 'Balanced';
        user = await userRepo.save(user);
    }
    console.log('Seeding Assets...');
    const assetsData = [
        { name: 'Baraka Fund', symbol: 'BARAKA', type: asset_entity_1.AssetType.SUKUK, currentPrice: 100.0, isZakatable: true },
        { name: 'Bashayer Fund', symbol: 'BASHAYER', type: asset_entity_1.AssetType.FUND, currentPrice: 50.0, isZakatable: true },
        { name: 'Beltone Wafra', symbol: 'WAFRA', type: asset_entity_1.AssetType.FUND, currentPrice: 15.0, isZakatable: true },
        { name: 'Azimut Opportunities', symbol: 'AZIMUT', type: asset_entity_1.AssetType.EQUITY, currentPrice: 11.1, isZakatable: true },
        { name: 'Baraka Bank Certificate', symbol: 'CERT-BARAKA', type: asset_entity_1.AssetType.CASH, currentPrice: 1000.0, isZakatable: true },
    ];
    const assetsMap = {};
    for (const data of assetsData) {
        let asset = await assetRepo.findOneBy({ symbol: data.symbol });
        if (!asset) {
            asset = assetRepo.create({
                ...data,
                riskLevel: asset_entity_1.RiskLevel.MEDIUM,
                expectedReturn: 10.0,
                minInvestment: 500
            });
            asset = await assetRepo.save(asset);
        }
        assetsMap[data.symbol] = asset;
    }
    console.log('Seeding Accounts...');
    let bankAccount = await accountRepo.findOneBy({ userId: user.id, name: 'Main Bank Account' });
    if (!bankAccount) {
        bankAccount = accountRepo.create({
            userId: user.id,
            name: 'Main Bank Account',
            currencyCode: 'SAR',
            type: account_entity_1.AccountType.BANK,
            balance: 50000,
            isPrimary: true
        });
        await accountRepo.save(bankAccount);
    }
    let investAccount = await accountRepo.findOneBy({ userId: user.id, name: 'Investment Account' });
    if (!investAccount) {
        investAccount = accountRepo.create({
            userId: user.id,
            name: 'Investment Account',
            currencyCode: 'SAR',
            type: account_entity_1.AccountType.BROKER,
            balance: 1000,
            isPrimary: false
        });
        investAccount = await accountRepo.save(investAccount);
    }
    console.log('Seeding Holdings...');
    await holdingRepo.delete({ accountId: investAccount.id });
    const holdingsData = [
        { symbol: 'BARAKA', units: 300 },
        { symbol: 'BASHAYER', units: 300 },
        { symbol: 'WAFRA', units: 13300 },
        { symbol: 'AZIMUT', units: 27036 },
        { symbol: 'CERT-BARAKA', units: 1000 }
    ];
    for (const item of holdingsData) {
        const holding = holdingRepo.create({
            accountId: investAccount.id,
            assetId: assetsMap[item.symbol].id,
            units: item.units,
            isPrimaryHome: false
        });
        await holdingRepo.save(holding);
    }
    console.log('Seeding Categories...');
    const categories = [
        'طعام (Food)',
        'مواصلات (Transport)',
        'فواتير (Utilities)',
        'سكن (Housing)',
        'ترفيه (Leisure)',
        'صحة (Health)',
        'تسوق (Shopping)'
    ];
    for (const catName of categories) {
        const exists = await categoryRepo.findOneBy({ name: catName, userId: user.id });
        if (!exists) {
            await categoryRepo.save(categoryRepo.create({
                name: catName,
                type: 'EXPENSE',
                userId: user.id
            }));
        }
    }
    console.log('Seeding Complete!');
    process.exit(0);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-production.js.map