import { AssetsService } from './assets.service';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAccounts(req: any): Promise<import("./entities/account.entity").Account[]>;
    createAccount(req: any, body: any): Promise<import("./entities/account.entity").Account>;
    getHoldings(req: any): Promise<import("./entities/holding.entity").Holding[]>;
    addHolding(accountId: number, body: any): Promise<import("./entities/holding.entity").Holding>;
}
