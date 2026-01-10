import { Portfolio } from './portfolio.entity';
export declare class Asset {
    id: string;
    symbol: string;
    name: string;
    type: string;
    quantity: number;
    averageCost: number;
    isZakatEligible: boolean;
    isResidence: boolean;
    portfolio: Portfolio;
    portfolioId: string;
}
