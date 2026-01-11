import { InvestmentsService } from './investments.service';
export declare class InvestmentsController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    findAllProducts(): Promise<import("../assets/entities/asset.entity").Asset[]>;
    getPortfolio(req: any): Promise<any[]>;
    invest(req: any, body: {
        productId: string;
        amount: number;
    }): Promise<import("./entities/portfolio.entity").UserPortfolio>;
    sell(req: any, body: {
        productId: string;
        amount: number;
    }): Promise<import("./entities/portfolio.entity").UserPortfolio | {
        message: string;
    }>;
    getRiskProfile(req: any): Promise<{
        riskProfile: string;
    }>;
    setRiskProfile(req: any, body: {
        score: number;
    }): Promise<import("../users/entities/user.entity").User>;
    rebalance(req: any): Promise<any>;
}
