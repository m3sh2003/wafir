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
const envelope_entity_1 = require("../budget/entities/envelope.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const holding_entity_1 = require("../assets/entities/holding.entity");
const transaction_entity_1 = require("../budget/entities/transaction.entity");
const bcrypt = __importStar(require("bcrypt"));
const path_1 = require("path");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'wafir',
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')],
    synchronize: true,
});
const arabicCategories = [
    { name: 'السكن', limit: 3000 },
    { name: 'المأكل والمشرب', limit: 1500 },
    { name: 'النقل والمواصلات', limit: 500 },
    { name: 'الفواتير والخدمات', limit: 800 },
    { name: 'الترفيه', limit: 400 },
    { name: 'التسوق', limit: 600 },
    { name: 'المطاعم والمقاهي', limit: 500 },
    { name: 'العناية الشخصية', limit: 300 },
    { name: 'صندوق الطوارئ', limit: 500 },
    { name: 'الاستثمار', limit: 1000 },
    { name: 'الادخار', limit: 500 },
    { name: 'الصدقة', limit: 200 },
    { name: 'زكاة المال', limit: 0 },
    { name: 'الهدايا', limit: 200 },
    { name: 'السفر', limit: 0 },
];
async function bootstrap() {
    await AppDataSource.initialize();
    console.log('Database connected for Arabic seeding...');
    const userRepository = AppDataSource.getRepository(user_entity_1.User);
    const envelopeRepository = AppDataSource.getRepository(envelope_entity_1.Envelope);
    const email = 'ahmed@example.com';
    let user = await userRepository.findOneBy({ email });
    if (!user) {
        console.log('Creating new user...');
        user = new user_entity_1.User();
        user.email = email;
        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash('password123', salt);
        user.name = 'Ahmed';
        user.settings = { currency: 'SAR', locale: 'ar-SA' };
        user.riskProfile = 'Balanced';
        await userRepository.save(user);
    }
    else {
        console.log('User found. Updating locale...');
        user.settings = { ...user.settings, locale: 'ar-SA' };
        await userRepository.save(user);
    }
    console.log('Seeding Arabic Envelopes...');
    const transactionRepository = AppDataSource.getRepository(transaction_entity_1.Transaction);
    await transactionRepository.createQueryBuilder().delete().where({ user: { id: user.id } }).execute();
    await envelopeRepository.delete({ user: { id: user.id } });
    for (const cat of arabicCategories) {
        const envelope = new envelope_entity_1.Envelope();
        envelope.name = cat.name;
        envelope.limitAmount = cat.limit;
        envelope.period = 'Monthly';
        envelope.user = user;
        await envelopeRepository.save(envelope);
        console.log(`Created envelope: ${cat.name}`);
    }
    console.log('Seeding Assets...');
    const assetRepository = AppDataSource.getRepository(asset_entity_1.Asset);
    const holdingRepository = AppDataSource.getRepository(holding_entity_1.Holding);
    await holdingRepository.createQueryBuilder().delete().execute();
    await assetRepository.createQueryBuilder().delete().execute();
    await AppDataSource.query('ALTER TABLE assets DROP COLUMN IF EXISTS "quantity"');
    await AppDataSource.query('ALTER TABLE assets DROP COLUMN IF EXISTS "portfolioId"');
    const assets = [
        {
            name: 'مصرف الراجحي',
            symbol: '1120.SR',
            type: asset_entity_1.AssetType.EQUITY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
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
            type: asset_entity_1.AssetType.EQUITY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
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
            type: asset_entity_1.AssetType.REIT,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
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
            type: asset_entity_1.AssetType.SUKUK,
            riskLevel: asset_entity_1.RiskLevel.LOW,
            currentPrice: 1000.00,
            expectedReturn: 4.5,
            minInvestment: 1000,
            description: 'صكوك حكومية، استثمار آمن ومنخفض المخاطر.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'بنك فيصل الإسلامي',
            symbol: 'FAIT.CA',
            type: asset_entity_1.AssetType.EQUITY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
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
            type: asset_entity_1.AssetType.EQUITY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
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
            type: asset_entity_1.AssetType.EQUITY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
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
            type: asset_entity_1.AssetType.EQUITY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
            currentPrice: 38.00,
            expectedReturn: 10.0,
            minInvestment: 100,
            description: 'مشغل الاتصالات المتكامل في مصر.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'شهادة بنك فيصل الإسلامي (3 سنوات)',
            symbol: 'FAIT-CERT-3Y',
            type: asset_entity_1.AssetType.CERTIFICATE,
            riskLevel: asset_entity_1.RiskLevel.LOW,
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
            type: asset_entity_1.AssetType.CERTIFICATE,
            riskLevel: asset_entity_1.RiskLevel.LOW,
            currentPrice: 1000.00,
            expectedReturn: 19.0,
            minInvestment: 1000,
            description: 'شهادة إسلامية بعائد متغير.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'جنيه مصري (نقد)',
            symbol: 'EGP',
            type: asset_entity_1.AssetType.CURRENCY,
            riskLevel: asset_entity_1.RiskLevel.LOW,
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
            type: asset_entity_1.AssetType.CURRENCY,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
            currentPrice: 48.50,
            expectedReturn: 0.0,
            minInvestment: 100,
            description: 'نقد أجنبي.',
            isZakatable: true,
            isShariaCompliant: true
        },
        {
            name: 'ذهب (جرام 24)',
            symbol: 'XAU',
            type: asset_entity_1.AssetType.CASH,
            riskLevel: asset_entity_1.RiskLevel.MEDIUM,
            currentPrice: 4000.00,
            expectedReturn: 12.0,
            minInvestment: 1000,
            description: 'ملاذ آمن وحفظ للثروة.',
            isZakatable: true,
            isShariaCompliant: true
        }
    ];
    for (const assetData of assets) {
        const asset = new asset_entity_1.Asset();
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
//# sourceMappingURL=seed-arabic.js.map