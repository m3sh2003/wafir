import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';
export declare class Envelope {
    id: string;
    name: string;
    limitAmount: number;
    period: string;
    transactions: Transaction[];
    user: User;
    userId: string;
}
