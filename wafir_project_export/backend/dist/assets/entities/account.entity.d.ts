import { User } from '../../users/entities/user.entity';
import { Holding } from './holding.entity';
export declare enum AccountType {
    BANK = "bank",
    BROKER = "broker",
    CASH = "cash",
    CERTIFICATE = "certificate",
    REAL_ESTATE = "real_estate"
}
export declare class Account {
    id: number;
    name: string;
    currencyCode: string;
    balance: number;
    type: AccountType;
    isPrimary: boolean;
    user: User;
    userId: string;
    holdings: Holding[];
}
