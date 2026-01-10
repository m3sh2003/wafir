import { Repository } from 'typeorm';
import { UserPortfolio } from './entities/portfolio.entity';
import { User } from '../users/entities/user.entity';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';
export declare class InvestmentsService {
    private portfolioRepository;
    private userRepository;
    private assetsService;
    constructor(portfolioRepository: Repository<UserPortfolio>, userRepository: Repository<User>, assetsService: AssetsService);
    findAllProducts(): Promise<Asset[]>;
    setRiskProfile(userId: string, score: number): Promise<User>;
    getRiskProfile(userId: string): Promise<{
        riskProfile: string;
    }>;
    getPortfolio(userId: string): Promise<any[]>;
    invest(userId: string, assetId: string, amount: number): Promise<UserPortfolio>;
    rebalancePortfolio(userId: string): Promise<any>;
}
