import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPortfolio } from './entities/portfolio.entity';
import { User } from '../users/entities/user.entity';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';

@Injectable()
export class InvestmentsService {
    constructor(
        @InjectRepository(UserPortfolio)
        private portfolioRepository: Repository<UserPortfolio>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private assetsService: AssetsService,
    ) { }

    async findAllProducts(): Promise<Asset[]> {
        return this.assetsService.findAllAssets();
    }

    async setRiskProfile(userId: string, score: number): Promise<User> {
        let profile = 'Balanced';
        if (score <= 5) profile = 'Conservative';
        else if (score >= 9) profile = 'Aggressive';

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        user.riskProfile = profile;
        return this.userRepository.save(user);
    }

    async getRiskProfile(userId: string): Promise<{ riskProfile: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        return { riskProfile: user.riskProfile };
    }

    async getPortfolio(userId: string): Promise<any[]> {
        const directPortfolio = await this.portfolioRepository.find({
            where: { userId },
            relations: ['asset'],
        });

        const accounts = await this.assetsService.findAllAccounts(userId);
        const holdings = await this.assetsService.findAllHoldings(userId);

        // Helper for currency conversion
        const toSAR = (amount: number, currency: string) => {
            if (!currency || currency === 'SAR') return amount;
            if (currency === 'USD') return amount * 3.75;
            if (currency === 'EGP') return amount * 0.08; // Approx rate, adjust as needed
            return amount;
        };

        // Map holdings to portfolio shape
        const manualPortfolio = holdings
            .filter(h => h.assetId || h.instrumentCode) // Allow manual holdings
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
                    purchasedAt: new Date() // Fallback
                };
            });

        // Map cash accounts to portfolio shape
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

    async invest(userId: string, assetId: string, amount: number): Promise<UserPortfolio> {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        const asset = await this.assetsService.findAssetById(assetId);
        if (!asset) throw new NotFoundException('Asset not found');

        if (amount < Number(asset.minInvestment)) {
            throw new BadRequestException(`Minimum investment is ${asset.minInvestment}`);
        }

        // Check if already invested in this asset, if so update amount
        let portfolioItem = await this.portfolioRepository.findOne({ where: { userId, assetId } });

        if (portfolioItem) {
            portfolioItem.amount = Number(portfolioItem.amount) + amount;
        } else {
            portfolioItem = this.portfolioRepository.create({
                userId,
                assetId,
                amount,
            });
        }

        return this.portfolioRepository.save(portfolioItem);
    }

    async rebalancePortfolio(userId: string): Promise<any> {
        const { riskProfile } = await this.getRiskProfile(userId);
        const portfolio = await this.getPortfolio(userId);
        const userTargets = await this.assetsService.getPortfolioTargets(userId);

        let targets: Record<string, number> = { 'Equity': 0.5, 'Sukuk': 0.4, 'Cash': 0.1 };

        // Override with DB targets if available
        if (userTargets.length > 0) {
            targets = {};
            userTargets.forEach(t => targets[t.assetClass] = Number(t.targetPct));
        } else {
            // Fallback to Risk Profile
            if (riskProfile === 'Conservative') targets = { 'Equity': 0.2, 'Sukuk': 0.6, 'Real Estate': 0.1, 'Cash': 0.1 };
            if (riskProfile === 'Aggressive') targets = { 'Equity': 0.7, 'Sukuk': 0.1, 'Real Estate': 0.15, 'Cash': 0.05 };
            if (riskProfile === 'Growth') targets = { 'Equity': 0.6, 'Sukuk': 0.2, 'Real Estate': 0.15, 'Cash': 0.05 };
        }

        // Calculate Current Allocation
        const totalValue = portfolio.reduce((sum, item) => sum + Number(item.amount), 0);
        if (totalValue === 0) return {
            riskProfile,
            totalValue: 0,
            currentAllocation: {},
            targetAllocation: targets,
            recommendedActions: ['Portfolio is empty']
        };

        const currentAllocation: Record<string, number> = {};
        // Initialize all target keys to 0
        Object.keys(targets).forEach(k => currentAllocation[k] = 0);

        portfolio.forEach(item => {
            const type = item.asset.type;
            let category = 'Other';

            if (['ETF', 'Stock', 'Equity'].includes(type)) category = 'Equity';
            else if (['Sukuk', 'Bond'].includes(type)) category = 'Sukuk';
            else if (['Real Estate', 'REIT'].includes(type) || item.asset.name.includes('Real Estate')) category = 'Real Estate';
            else if (['Gold', 'Commodity'].includes(type)) category = 'Gold';
            else if (['Cash Equivalent', 'Cash'].includes(type)) category = 'Cash';

            if (!currentAllocation[category]) currentAllocation[category] = 0;
            currentAllocation[category] += Number(item.amount);
        });

        const actions: string[] = [];
        const resultCurrentAlloc: Record<string, number> = {};

        // Calculate deviations
        for (const [key, targetPct] of Object.entries(targets)) {
            const currentVal = currentAllocation[key] || 0;
            const currentPct = currentVal / totalValue;
            resultCurrentAlloc[key] = Number(currentPct.toFixed(4));

            const diffVal = (targetPct * totalValue) - currentVal;
            const threshold = totalValue * 0.02; // 2% threshold

            if (Math.abs(diffVal) > threshold) {
                if (diffVal > 0) actions.push(`Buy ${diffVal.toFixed(0)} SAR of ${key}`);
                else actions.push(`Sell ${Math.abs(diffVal).toFixed(0)} SAR of ${key}`);
            }
        }

        // Check for assets not in target
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

    async sellInvestment(userId: string, assetId: string, amount: number): Promise<UserPortfolio | { message: string }> {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        const portfolioItem = await this.portfolioRepository.findOne({ where: { userId, assetId } });
        if (!portfolioItem) throw new NotFoundException('Investment not found');

        if (Number(portfolioItem.amount) < amount) {
            throw new BadRequestException('Insufficient holdings to sell this amount');
        }

        const newAmount = Number(portfolioItem.amount) - amount;

        if (newAmount <= 0) {
            await this.portfolioRepository.remove(portfolioItem);
            return { message: 'Investment sold completely' };
        } else {
            portfolioItem.amount = newAmount;
            return this.portfolioRepository.save(portfolioItem);
        }
    }
}
