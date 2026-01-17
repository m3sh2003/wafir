import { User } from '../../users/entities/user.entity';
import { Envelope } from './envelope.entity';
import { Account } from '../../assets/entities/account.entity';
export declare class Transaction {
    id: string;
    description: string;
    amount: number;
    currency: string;
    date: Date;
    type: string;
    user: User;
    userId: string;
    envelope: Envelope;
    envelopeId: string;
    account: Account;
    accountId: number;
    createdAt: Date;
}
