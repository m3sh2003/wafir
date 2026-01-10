import { Account } from './account.entity';
import { Asset } from './asset.entity';
export declare class Holding {
    id: number;
    instrumentCode: string;
    asset: Asset;
    assetId: string;
    units: number;
    isPrimaryHome: boolean;
    account: Account;
    accountId: number;
}
