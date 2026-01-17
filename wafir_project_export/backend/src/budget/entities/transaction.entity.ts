import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Envelope } from './envelope.entity';
import { Account } from '../../assets/entities/account.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ nullable: true })
    type: string; // INCOME, EXPENSE, TRANSFER

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Envelope, { nullable: true })
    @JoinColumn({ name: 'envelopeId' })
    envelope: Envelope;

    @Column({ nullable: true })
    envelopeId: string;

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'accountId' })
    account: Account;

    @Column({ nullable: true })
    accountId: number;

    @CreateDateColumn()
    createdAt: Date;
}
