import { Holding } from './holding.entity';
export declare enum AssetType {
    SUKUK = "Sukuk",
    EQUITY = "Equity",
    FUND = "Fund",
    REAL_ESTATE = "Real Estate",
    CASH = "Cash",
    ETF = "ETF",
    REIT = "REIT",
    STOCK = "Stock",
    CERTIFICATE = "Certificate",
    CURRENCY = "Currency"
}
export declare enum RiskLevel {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}
export declare class Asset {
    id: string;
    name: string;
    symbol: string;
    type: AssetType;
    riskLevel: RiskLevel;
    currentPrice: number;
    expectedReturn: number;
    minInvestment: number;
    description: string;
    isZakatable: boolean;
    isShariaCompliant: boolean;
    holdings: Holding[];
    createdAt: Date;
    updatedAt: Date;
}
