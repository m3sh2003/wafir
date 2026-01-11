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
        const holdings = await this.assetsService.findAllHoldings(userId);
        const manualPortfolio = holdings
            .filter(h => h.assetId || h.instrumentCode)
            .map(h => ({
            id: `manual-${h.id}`,
            amount: Number(h.units) * (Number(h.asset?.currentPrice) || 1),
            asset: h.asset || {
                id: 'manual',
                name: h.instrumentCode || 'Unnamed Asset',
                type: 'Manual Asset',
                riskLevel: 'Unknown',
                currentPrice: 1
            },
            isManual: true,
            purchasedAt: new Date()
        }));
        return [...directPortfolio, ...manualPortfolio];
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
        let targets = { 'Equity': 0.5, 'Sukuk': 0.5 };
        if (userTargets.length > 0) {
            targets = {};
            userTargets.forEach(t => targets[t.assetClass] = Number(t.targetPct));
        }
        else {
            if (riskProfile === 'Conservative')
                targets = { 'Equity': 0.2, 'Sukuk': 0.8 };
            if (riskProfile === 'Aggressive')
                targets = { 'Equity': 0.8, 'Sukuk': 0.2 };
        }
        const totalValue = portfolio.reduce((sum, item) => sum + Number(item.amount), 0);
        if (totalValue === 0)
            return { message: 'Portfolio is empty, nothing to rebalance' };
        const currentAllocation = { 'Equity': 0, 'Sukuk': 0 };
        portfolio.forEach(item => {
            const type = item.asset.type;
            if (type === 'ETF' || type === 'Stock' || type === 'Equity')
                currentAllocation['Equity'] += Number(item.amount);
            else
                currentAllocation['Sukuk'] += Number(item.amount);
        });
        const actions = [];
        const equityDiff = (currentAllocation['Equity'] / totalValue) - targets['Equity'];
        if (Math.abs(equityDiff) > 0.05) {
            if (equityDiff > 0)
                actions.push(`Sell ${Math.abs(equityDiff * totalValue).toFixed(2)} SAR of Equity`);
            else
                actions.push(`Buy ${Math.abs(equityDiff * totalValue).toFixed(2)} SAR of Equity`);
        }
        return {
            riskProfile,
            totalValue,
            currentAllocation: {
                Equity: (currentAllocation['Equity'] / totalValue).toFixed(2),
                Sukuk: (currentAllocation['Sukuk'] / totalValue).toFixed(2)
            },
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