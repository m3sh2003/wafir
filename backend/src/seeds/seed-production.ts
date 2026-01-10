import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Asset, AssetType, RiskLevel } from '../assets/entities/asset.entity';
import { Account, AccountType } from '../assets/entities/account.entity';
import { Holding } from '../assets/entities/holding.entity';
import { Category } from '../budget/entities/category.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
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

    const userRepo = AppDataSource.getRepository(User);
    const assetRepo = AppDataSource.getRepository(Asset);
    const accountRepo = AppDataSource.getRepository(Account);
    const holdingRepo = AppDataSource.getRepository(Holding);
    const categoryRepo = AppDataSource.getRepository(Category);

    // 1. User
    const email = 'ahmed@example.com';
    let user = await userRepo.findOneBy({ email });
    if (!user) {
        console.log('Creating User...');
        user = new User();
        user.email = email;
        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash('password123', salt);
        user.name = 'Ahmed';
        user.settings = { currency: 'SAR', locale: 'ar-SA' };
        user.riskProfile = 'Balanced';
        user = await userRepo.save(user);
    }

    // 2. Assets
    console.log('Seeding Assets...');
    const assetsData = [
        { name: 'Baraka Fund', symbol: 'BARAKA', type: AssetType.SUKUK, currentPrice: 100.0, isZakatable: true }, // Assumed
        { name: 'Bashayer Fund', symbol: 'BASHAYER', type: AssetType.FUND, currentPrice: 50.0, isZakatable: true },
        { name: 'Beltone Wafra', symbol: 'WAFRA', type: AssetType.FUND, currentPrice: 15.0, isZakatable: true },
        { name: 'Azimut Opportunities', symbol: 'AZIMUT', type: AssetType.EQUITY, currentPrice: 11.1, isZakatable: true }, // Assumed price
        { name: 'Baraka Bank Certificate', symbol: 'CERT-BARAKA', type: AssetType.CASH, currentPrice: 1000.0, isZakatable: true },
    ];

    const assetsMap: Record<string, Asset> = {};
    for (const data of assetsData) {
        let asset = await assetRepo.findOneBy({ symbol: data.symbol });
        if (!asset) {
            asset = assetRepo.create({
                ...data,
                riskLevel: RiskLevel.MEDIUM,
                expectedReturn: 10.0,
                minInvestment: 500
            });
            asset = await assetRepo.save(asset);
        }
        assetsMap[data.symbol] = asset;
    }

    // 3. Accounts
    console.log('Seeding Accounts...');
    let bankAccount = await accountRepo.findOneBy({ userId: user.id, name: 'Main Bank Account' });
    if (!bankAccount) {
        bankAccount = accountRepo.create({
            userId: user.id,
            name: 'Main Bank Account',
            currencyCode: 'SAR',
            type: AccountType.BANK,
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
            type: AccountType.BROKER,
            balance: 1000,
            isPrimary: false
        });
        investAccount = await accountRepo.save(investAccount);
    }

    // 4. Holdings (Linked to Investment Account)
    console.log('Seeding Holdings...');
    // Clear existing to avoid dupes logic for now
    await holdingRepo.delete({ accountId: investAccount.id });

    const holdingsData = [
        { symbol: 'BARAKA', units: 300 },
        { symbol: 'BASHAYER', units: 300 },
        { symbol: 'WAFRA', units: 13300 },
        { symbol: 'AZIMUT', units: 27036 },
        { symbol: 'CERT-BARAKA', units: 1000 } // treating certificate as holding unit 1000 EGP nominal
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

    // 5. Categories (Arabic)
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
