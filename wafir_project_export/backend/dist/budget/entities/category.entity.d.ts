import { User } from '../../users/entities/user.entity';
export declare class Category {
    id: string;
    name: string;
    type: string;
    user: User | null;
    userId: string | null;
}
