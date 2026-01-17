import { User } from '../../users/entities/user.entity';
import { Asset } from '../../assets/entities/asset.entity';
export declare class UserPortfolio {
    id: string;
    user: User;
    userId: string;
    asset: Asset;
    assetId: string;
    amount: number;
    purchasedAt: Date;
}
