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

        let targets: Record<string, number> = { 'Equity': 0.5, 'Sukuk': 0.5 };

        // Override with DB targets if available
        if (userTargets.length > 0) {
            targets = {};
            userTargets.forEach(t => targets[t.assetClass] = Number(t.targetPct));
        } else {
            // Fallback to Risk Profile
            if (riskProfile === 'Conservative') targets = { 'Equity': 0.2, 'Sukuk': 0.8 };
            if (riskProfile === 'Aggressive') targets = { 'Equity': 0.8, 'Sukuk': 0.2 };
        }

        // Calculate Current Allocation
        const totalValue = portfolio.reduce((sum, item) => sum + Number(item.amount), 0);
        if (totalValue === 0) return { message: 'Portfolio is empty, nothing to rebalance' };

        const currentAllocation = { 'Equity': 0, 'Sukuk': 0 };
        portfolio.forEach(item => {
            // Updated logic for Asset Types
            const type = item.asset.type as string;
            if (type === 'ETF' || type === 'Stock' || type === 'Equity') currentAllocation['Equity'] += Number(item.amount);
            else currentAllocation['Sukuk'] += Number(item.amount);
        });

        // Determine Deviations (Simplified)
        const actions = [];
        const equityDiff = (currentAllocation['Equity'] / totalValue) - targets['Equity'];

        if (Math.abs(equityDiff) > 0.05) { // 5% threshold
            if (equityDiff > 0) actions.push(`Sell ${Math.abs(equityDiff * totalValue).toFixed(2)} SAR of Equity`);
            else actions.push(`Buy ${Math.abs(equityDiff * totalValue).toFixed(2)} SAR of Equity`);
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
