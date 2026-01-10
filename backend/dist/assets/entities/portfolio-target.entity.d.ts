import { User } from '../../users/entities/user.entity';
export declare class PortfolioTarget {
    id: number;
    assetClass: string;
    targetPct: number;
    user: User;
    userId: string;
}
