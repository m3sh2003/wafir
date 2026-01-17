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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZakatService = void 0;
const common_1 = require("@nestjs/common");
const assets_service_1 = require("../assets/assets.service");
let ZakatService = class ZakatService {
    assetsService;
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    calculate(data) {
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
    async calculateFromSystem(userId) {
        const holdings = await this.assetsService.findAllHoldings(userId);
        const accounts = await this.assetsService.findAllAccounts(userId);
        const toSAR = (amount, currency) => {
            if (!currency || currency === 'SAR')
                return amount;
            if (currency === 'USD')
                return amount * 3.75;
            if (currency === 'EGP')
                return amount * 0.08;
            return amount;
        };
        let cashTotalSAR = 0;
        const zakatableAccountTypes = ['bank', 'cash', 'certificate', 'broker'];
        for (const account of accounts) {
            if (zakatableAccountTypes.includes(account.type.toLowerCase())) {
                cashTotalSAR += toSAR(Number(account.balance), account.currencyCode);
            }
        }
        let investmentsTotalSAR = 0;
        const details = [];
        for (const holding of holdings) {
            if (holding.isPrimaryHome)
                continue;
            const currency = holding.account?.currencyCode || 'SAR';
            if (!holding.asset) {
                const value = Number(holding.units);
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
        const totalAssetsUSD = totalAssetsSAR / 3.75;
        const NISAB_USD = 6125;
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
};
exports.ZakatService = ZakatService;
exports.ZakatService = ZakatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], ZakatService);
//# sourceMappingURL=zakat.service.js.map