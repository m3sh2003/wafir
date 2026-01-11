import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Envelope } from '../budget/entities/envelope.entity';
import { Asset, AssetType, RiskLevel } from '../assets/entities/asset.entity';
import { Holding } from '../assets/entities/holding.entity';
import { Transaction } from '../budget/entities/transaction.entity';
import * as bcrypt from 'bcrypt';
import { join } from 'path';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    synchronize: true,
});

const arabicCategories = [
    // Essentials
    { name: 'السكن', limit: 3000 },
    { name: 'المأكل والمشرب', limit: 1500 },
    { name: 'النقل والمواصلات', limit: 500 },
    { name: 'الفواتير والخدمات', limit: 800 },

    // Lifestyle
    { name: 'الترفيه', limit: 400 },
    { name: 'التسوق', limit: 600 },
    { name: 'المطاعم والمقاهي', limit: 500 },
    { name: 'العناية الشخصية', limit: 300 },

    // Financial Goals
    { name: 'صندوق الطوارئ', limit: 500 },
    { name: 'الاستثمار', limit: 1000 },
    { name: 'الادخار', limit: 500 },

    // Giving
    { name: 'الصدقة', limit: 200 },
    { name: 'زكاة المال', limit: 0 }, // Calculated elsewhere usually, but good to have a bucket

    // Occasional
    { name: 'الهدايا', limit: 200 },
    { name: 'السفر', limit: 0 },
];

async function bootstrap() {
    await AppDataSource.initialize();
    console.log('Database connected for Arabic seeding...');

    const userRepository = AppDataSource.getRepository(User);
    const envelopeRepository = AppDataSource.getRepository(Envelope);

    const email = 'ahmed@example.com';
    let user = await userRepository.findOneBy({ email });

    if (!user) {
        console.log('Creating new user...');
        user = new User();
        user.email = email;
        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash('password123', salt);
        user.name = 'Ahmed';
        user.settings = { currency: 'SAR', locale: 'ar-SA' };
        user.riskProfile = 'Balanced';
        await userRepository.save(user);
    } else {
        console.log('User found. Updating locale...');
        user.settings = { ...user.settings, locale: 'ar-SA' };
        await userRepository.save(user);
    }

    console.log('Seeding Arabic Envelopes...');

    // Clear existing envelopes (and transactions due to constraint)
    const transactionRepository = AppDataSource.getRepository(Transaction);
    await transactionRepository.createQueryBuilder().delete().where({ user: { id: user.id } }).execute();
    await envelopeRepository.delete({ user: { id: user.id } });

    for (const cat of arabicCategories) {
        const envelope = new Envelope();
        envelope.name = cat.name;
        envelope.limitAmount = cat.limit;
        envelope.period = 'Monthly';
        envelope.user = user;
        // userId auto-set by relation or explicit column if needed, but entity has both now so relation is safer

        await envelopeRepository.save(envelope);
        console.log(`Created envelope: ${cat.name}`);
    }

    console.log('Seeding Assets...');
    const assetRepository = AppDataSource.getRepository(Asset);
    const holdingRepository = AppDataSource.getRepository(Holding);

    // Clear existing data (Holdings first due to FK)
    await holdingRepository.createQueryBuilder().delete().execute();
    await assetRepository.createQueryBuilder().delete().execute();

    // Fix schema drift: Drop orphan columns if they exist
    await AppDataSource.query('ALTER TABLE assets DROP COLUMN IF EXISTS "quantity"');
    await AppDataSource.query('ALTER TABLE assets DROP COLUMN IF EXISTS "portfolioId"');

    const assets = [
        // Saudi Market (Tadawul)
        {
            name: 'مصرف الراجحي',
            symbol: '1120.SR',
            type: AssetType.EQUITY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 88.50,
            expectedReturn: 8.5,
            minInvestment: 100,
            description: 'أكبر مصرف إسلامي في العالم من حيث القيمة السوقية.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'سابك للمغذايات الزراعية',
            symbol: '2020.SR',
            type: AssetType.EQUITY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 130.20,
            expectedReturn: 9.0,
            minInvestment: 150,
            description: 'شركة رائدة في مجال صناعة الأسمدة، متوافقة مع الشريعة.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'صندوق الراجحي ريت',
            symbol: '4340.SR',
            type: AssetType.REIT,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 9.80,
            expectedReturn: 6.0,
            minInvestment: 50,
            description: 'صندوق استثمار عقاري متداول متوافق مع الشريعة.',
            isZakatable: false,
            isShariaCompliant: true
        },
        {
            name: 'صكوك حكومة المملكة العربية السعودية',
            symbol: 'KSA-SUKUK',
            type: AssetType.SUKUK,
            riskLevel: RiskLevel.LOW,
            currentPrice: 1000.00,
            expectedReturn: 4.5,
            minInvestment: 1000,
            description: 'صكوك حكومية، استثمار آمن ومنخفض المخاطر.',
            isZakatable: true,
            isShariaCompliant: true
        },

        // Egyptian Market (EGX)
        {
            name: 'بنك فيصل الإسلامي',
            symbol: 'FAIT.CA',
            type: AssetType.EQUITY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 32.50,
            expectedReturn: 12.0,
            minInvestment: 100,
            description: 'أول بنك إسلامي مصري.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'أبو قير للأسمدة',
            symbol: 'ABUK.CA',
            type: AssetType.EQUITY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 85.00,
            expectedReturn: 15.0,
            minInvestment: 100,
            description: 'شركة رائدة في مجال الأسمدة في مصر.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'السويدي إليكتريك',
            symbol: 'SWDY.CA',
            type: AssetType.EQUITY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 45.00,
            expectedReturn: 14.0,
            minInvestment: 100,
            description: 'شركة رائدة في مجال الطاقة والبنية التحتية.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'المصرية للاتصالات',
            symbol: 'ETEL.CA',
            type: AssetType.EQUITY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 38.00,
            expectedReturn: 10.0,
            minInvestment: 100,
            description: 'مشغل الاتصالات المتكامل في مصر.',
            isZakatable: true,
            isShariaCompliant: true
        },
        // Islamic Certificates (Egypt)
        {
            name: 'شهادة بنك فيصل الإسلامي (3 سنوات)',
            symbol: 'FAIT-CERT-3Y',
            type: AssetType.CERTIFICATE,
            riskLevel: RiskLevel.LOW,
            currentPrice: 1000.00,
            expectedReturn: 18.0,
            minInvestment: 1000,
            description: 'شهادة ادخار إسلامية بعائد ربع سنوي.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'شهادة "كنانة" المعاملات الإسلامية (بنك مصر)',
            symbol: 'BM-KENANA',
            type: AssetType.CERTIFICATE,
            riskLevel: RiskLevel.LOW,
            currentPrice: 1000.00,
            expectedReturn: 19.0,
            minInvestment: 1000,
            description: 'شهادة إسلامية بعائد متغير.',
            isZakatable: true,
            isShariaCompliant: true
        },

        // Currencies & Commodities
        {
            name: 'جنيه مصري (نقد)',
            symbol: 'EGP',
            type: AssetType.CURRENCY,
            riskLevel: RiskLevel.LOW,
            currentPrice: 1.00,
            expectedReturn: 0.0,
            minInvestment: 0,
            description: 'سيولة نقدية بالعملة المحلية.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'دولار أمريكي',
            symbol: 'USD',
            type: AssetType.CURRENCY,
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 48.50, // Approx EGP rate or base rate depending on user settings, treating as asset here
            expectedReturn: 0.0,
            minInvestment: 100,
            description: 'نقد أجنبي.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'ذهب (جرام 24)',
            symbol: 'XAU',
            type: AssetType.CASH, // Keeping as Cash/Commodity
            riskLevel: RiskLevel.MEDIUM,
            currentPrice: 4000.00, // EGP approx for 24k
            expectedReturn: 12.0,
            minInvestment: 1000,
            description: 'ملاذ آمن وحفظ للثروة.',
            isZakatable: true,
            isShariaCompliant: true
        }
    ];

    for (const assetData of assets) {
        const asset = new Asset();
        Object.assign(asset, assetData);
        await assetRepository.save(asset);
        console.log(`Created asset: ${asset.name}`);
    }

    console.log('Arabic Seeding Complete!');
    process.exit(0);
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
