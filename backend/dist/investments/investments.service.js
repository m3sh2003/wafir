"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const portfolio_entity_1 = require("./entities/portfolio.entity");
const user_entity_1 = require("../users/entities/user.entity");
const assets_service_1 = require("../assets/assets.service");
let InvestmentsService = class InvestmentsService {
    portfolioRepository;
    userRepository;
    assetsService;
    constructor(portfolioRepository, userRepository, assetsService) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.assetsService = assetsService;
    }
    async findAllProducts() {
        return this.assetsService.findAllAssets();
    }
    async setRiskProfile(userId, score) {
        let profile = 'Balanced';
        if (score <= 5)
            profile = 'Conservative';
        else if (score >= 9)
            profile = 'Aggressive';
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.riskProfile = profile;
        return this.userRepository.save(user);
    }
    async getRiskProfile(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { riskProfile: user.riskProfile };
    }
    async getPortfolio(userId) {
        const directPortfolio = await this.portfolioRepository.find({
            where: { userId },
            relations: ['asset'],
        });
        const accounts = await this.assetsService.findAllAccounts(userId);
        const holdings = await this.assetsService.findAllHoldings(userId);
        const toSAR = (amount, currency) => {
            if (!currency || currency === 'SAR')
                return amount;
            if (currency === 'USD')
                return amount * 3.75;
            if (currency === 'EGP')
                return amount * 0.08;
            return amount;
        };
        const manualPortfolio = holdings
            .filter(h => h.assetId || h.instrumentCode)
            .map(h => {
            const rawValue = Number(h.units) * (Number(h.asset?.currentPrice) || 1);
            const currency = h.account?.currencyCode || 'SAR';
            const valueInSAR = toSAR(rawValue, currency);
            return {
                id: `manual-${h.id}`,
                amount: valueInSAR,
                asset: h.asset || {
                    id: 'manual',
                    name: h.instrumentCode || 'Unnamed Asset',
                    type: 'Manual Asset',
                    riskLevel: 'Unknown',
                    currentPrice: 1
                },
                isManual: true,
                purchasedAt: new Date()
            };
        });
        const cashPortfolio = accounts
            .filter(acc => Number(acc.balance) > 0)
            .map(acc => ({
            id: `account-${acc.id}`,
            amount: toSAR(Number(acc.balance), acc.currencyCode),
            asset: {
                id: `account-asset-${acc.id}`,
                name: acc.name,
                type: 'Cash Equivalent',
                riskLevel: 'Low',
                currentPrice: 1,
                description: `Balance in ${acc.name} (${acc.currencyCode})`
            },
            isManual: true,
            purchasedAt: new Date()
        }));
        return [...directPortfolio, ...manualPortfolio, ...cashPortfolio];
    }
    async invest(userId, assetId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be positive');
        const asset = await this.assetsService.findAssetById(assetId);
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        if (amount < Number(asset.minInvestment)) {
            throw new common_1.BadRequestException(`Minimum investment is ${asset.minInvestment}`);
        }
        let portfolioItem = await this.portfolioRepository.findOne({ where: { userId, assetId } });
        if (portfolioItem) {
            portfolioItem.amount = Number(portfolioItem.amount) + amount;
        }
        else {
            portfolioItem = this.portfolioRepository.create({
                userId,
                assetId,
                amount,
            });
        }
        return this.portfolioRepository.save(portfolioItem);
    }
    async rebalancePortfolio(userId) {
        const { riskProfile } = await this.getRiskProfile(userId);
        const portfolio = await this.getPortfolio(userId);
        const userTargets = await this.assetsService.getPortfolioTargets(userId);
        let targets = { 'Equity': 0.5, 'Sukuk': 0.4, 'Cash': 0.1 };
        if (userTargets.length > 0) {
            targets = {};
            userTargets.forEach(t => targets[t.assetClass] = Number(t.targetPct));
        }
        else {
            if (riskProfile === 'Conservative')
                targets = { 'Equity': 0.2, 'Sukuk': 0.6, 'Real Estate': 0.1, 'Cash': 0.1 };
            if (riskProfile === 'Aggressive')
                targets = { 'Equity': 0.7, 'Sukuk': 0.1, 'Real Estate': 0.15, 'Cash': 0.05 };
            if (riskProfile === 'Growth')
                targets = { 'Equity': 0.6, 'Sukuk': 0.2, 'Real Estate': 0.15, 'Cash': 0.05 };
        }
        const totalValue = portfolio.reduce((sum, item) => sum + Number(item.amount), 0);
        if (totalValue === 0)
            return {
                riskProfile,
                totalValue: 0,
                currentAllocation: {},
                targetAllocation: targets,
                recommendedActions: ['Portfolio is empty']
            };
        const currentAllocation = {};
        Object.keys(targets).forEach(k => currentAllocation[k] = 0);
        portfolio.forEach(item => {
            const type = item.asset.type;
            let category = 'Other';
            if (['ETF', 'Stock', 'Equity'].includes(type))
                category = 'Equity';
            else if (['Sukuk', 'Bond'].includes(type))
                category = 'Sukuk';
            else if (['Real Estate', 'REIT'].includes(type) || item.asset.name.includes('Real Estate'))
                category = 'Real Estate';
            else if (['Gold', 'Commodity'].includes(type))
                category = 'Gold';
            else if (['Cash Equivalent', 'Cash'].includes(type))
                category = 'Cash';
            if (!currentAllocation[category])
                currentAllocation[category] = 0;
            currentAllocation[category] += Number(item.amount);
        });
        const actions = [];
        const resultCurrentAlloc = {};
        for (const [key, targetPct] of Object.entries(targets)) {
            const currentVal = currentAllocation[key] || 0;
            const currentPct = currentVal / totalValue;
            resultCurrentAlloc[key] = Number(currentPct.toFixed(4));
            const diffVal = (targetPct * totalValue) - currentVal;
            const threshold = totalValue * 0.02;
            if (Math.abs(diffVal) > threshold) {
                if (diffVal > 0)
                    actions.push(`Buy ${diffVal.toFixed(0)} SAR of ${key}`);
                else
                    actions.push(`Sell ${Math.abs(diffVal).toFixed(0)} SAR of ${key}`);
            }
        }
        for (const [key, val] of Object.entries(currentAllocation)) {
            if (!targets[key] && val > 0) {
                resultCurrentAlloc[key] = Number((val / totalValue).toFixed(4));
                actions.push(`Sell ${val.toFixed(0)} SAR of ${key} (Not in target strategy)`);
            }
        }
        return {
            riskProfile,
            totalValue,
            currentAllocation: resultCurrentAlloc,
            targetAllocation: targets,
            recommendedActions: actions.length > 0 ? actions : ['Portfolio is balanced']
        };
    }
    async sellInvestment(userId, assetId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be positive');
        const portfolioItem = await this.portfolioRepository.findOne({ where: { userId, assetId } });
        if (!portfolioItem)
            throw new common_1.NotFoundException('Investment not found');
        if (Number(portfolioItem.amount) < amount) {
            throw new common_1.BadRequestException('Insufficient holdings to sell this amount');
        }
        const newAmount = Number(portfolioItem.amount) - amount;
        if (newAmount <= 0) {
            await this.portfolioRepository.remove(portfolioItem);
            return { message: 'Investment sold completely' };
        }
        else {
            portfolioItem.amount = newAmount;
            return this.portfolioRepository.save(portfolioItem);
        }
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(portfolio_entity_1.UserPortfolio)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        assets_service_1.AssetsService])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map