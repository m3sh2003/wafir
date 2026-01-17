import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Holding } from './entities/holding.entity';
import { PortfolioTarget } from './entities/portfolio-target.entity';
import { Asset } from './entities/asset.entity';
export declare class AssetsService {
    private accountRepo;
    private holdingRepo;
    private targetRepo;
    private assetRepo;
    constructor(accountRepo: Repository<Account>, holdingRepo: Repository<Holding>, targetRepo: Repository<PortfolioTarget>, assetRepo: Repository<Asset>);
    findAllAssets(): Promise<Asset[]>;
    findAssetById(id: string): Promise<Asset | null>;
    findAllAccounts(userId: string): Promise<Account[]>;
    createAccount(userId: string, data: Partial<Account>): Promise<Account>;
    findAllHoldings(userId: string): Promise<Holding[]>;
    createHolding(accountId: number, data: Partial<Holding>): Promise<Holding>;
    getPortfolioTargets(userId: string): Promise<PortfolioTarget[]>;
    setPortfolioTarget(userId: string, targets: Partial<PortfolioTarget>[]): Promise<PortfolioTarget[]>;
    updateAccount(id: string, userId: string, dto: any): Promise<Account>;
    removeAccount(id: string, userId: string): Promise<void>;
    removeHolding(id: string, userId: string): Promise<void>;
}
