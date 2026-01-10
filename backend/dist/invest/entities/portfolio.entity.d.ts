import { User } from '../../users/entities/user.entity';
import { Asset } from './asset.entity';
export declare class Portfolio {
    id: string;
    name: string;
    user: User;
    userId: string;
    assets: Asset[];
}
