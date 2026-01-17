import { AssetsService } from './assets.service';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAccounts(req: any): Promise<import("./entities/account.entity").Account[]>;
    createAccount(req: any, body: any): Promise<import("./entities/account.entity").Account>;
    getHoldings(req: any): Promise<import("./entities/holding.entity").Holding[]>;
    addHolding(accountId: number, body: any): Promise<import("./entities/holding.entity").Holding>;
    updateAccount(req: any, id: string, body: any): Promise<import("./entities/account.entity").Account>;
    deleteAccount(req: any, id: string): Promise<void>;
    deleteHolding(req: any, id: string): Promise<void>;
}
