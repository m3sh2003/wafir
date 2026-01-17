import { Injectable } from '@nestjs/common';
import { AssetsService } from '../assets/assets.service';
import { ZakatRequestDto } from './dto/zakat-request.dto';



@Injectable()
export class ZakatService {
    constructor(private readonly assetsService: AssetsService) { }

    calculate(data: ZakatRequestDto) {
        // ... (existing logic)
        const { portfolio_valuation_usd, nisab_usd } = data;
        if (portfolio_valuation_usd < nisab_usd) {
            return {
                zakat_due_usd: 0,
                message: 'Total assets are below Nisab. No Zakat due.',
                nisab_status: 'Below Nisab'
            };
        }
        const zakatDue = portfolio_valuation_usd * 0.025;
        return {
            zakat_due_usd: zakatDue,
            currency: 'USD',
            calculation_basis: '2.5% of Portfolio Valuation',
            nisab_status: 'Above Nisab'
        };
    }

    async calculateFromSystem(userId: string) {
        const holdings = await this.assetsService.findAllHoldings(userId);
        const accounts = await this.assetsService.findAllAccounts(userId);

        // Helper for currency conversion (Same as InvestmentsService)
        const toSAR = (amount: number, currency: string) => {
            if (!currency || currency === 'SAR') return amount;
            if (currency === 'USD') return amount * 3.75;
            if (currency === 'EGP') return amount * 0.08; // Approx rate
            return amount;
        };

        // 1. Calculate Zakatable Cash (Accounts)
        let cashTotalSAR = 0;
        const zakatableAccountTypes = ['bank', 'cash', 'certificate', 'broker'];
        for (const account of accounts) {
            if (zakatableAccountTypes.includes(account.type.toLowerCase())) {
                cashTotalSAR += toSAR(Number(account.balance), account.currencyCode);
            }
        }

        // 2. Calculate Zakatable Investments (Holdings)
        let investmentsTotalSAR = 0;
        const details = [];

        for (const holding of holdings) {
            // Check exemptions
            if (holding.isPrimaryHome) continue;

            const currency = holding.account?.currencyCode || 'SAR';

            // Manual Holding (No linked Asset entity) - Assume Zakatable
            if (!holding.asset) {
                const value = Number(holding.units); // Assume units = value for manual entries if no price known
                const valueSAR = toSAR(value, currency);
                investmentsTotalSAR += valueSAR;
                details.push({
                    name: holding.instrumentCode || 'Manual Asset',
                    amount: valueSAR,
                    type: 'Manual',
                    originalCurrency: currency
                });
                continue;
            }

            // Linked Asset Zakatability
            if (holding.asset && holding.asset.isZakatable) {
                const rawValue = Number(holding.units) * Number(holding.asset.currentPrice);
                const valueSAR = toSAR(rawValue, currency);
                investmentsTotalSAR += valueSAR;
                details.push({
                    name: holding.asset.name,
                    amount: valueSAR,
                    type: holding.asset.type,
                    originalCurrency: currency
                });
            }
        }

        const totalAssetsSAR = cashTotalSAR + investmentsTotalSAR;

        // Conversion to USD for Zakat Threshold check (Approx 3.75 SAR = 1 USD)
        const totalAssetsUSD = totalAssetsSAR / 3.75;
        const NISAB_USD = 6125; // Approx Silver/Gold standard average

        const isZakatable = totalAssetsUSD >= NISAB_USD;
        const zakatDueSAR = isZakatable ? totalAssetsSAR * 0.025 : 0;
        const zakatDueUSD = isZakatable ? totalAssetsUSD * 0.025 : 0;

        return {
            total_assets_sar: totalAssetsSAR,
            total_assets_usd: totalAssetsUSD.toFixed(2),
            zakat_due_sar: zakatDueSAR.toFixed(2),
            zakat_due_usd: zakatDueUSD.toFixed(2),
            nisab_threshold_usd: NISAB_USD,
            is_above_nisab: isZakatable,
            breakdown: {
                cash_sar: cashTotalSAR,
                investments_sar: investmentsTotalSAR,
                details
            }
        };
    }
}
