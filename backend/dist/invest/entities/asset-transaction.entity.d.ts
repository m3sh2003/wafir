import { Asset } from './asset.entity';
export declare class AssetTransaction {
    id: string;
    type: string;
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
    date: Date;
    asset: Asset;
    assetId: string;
    createdAt: Date;
}
