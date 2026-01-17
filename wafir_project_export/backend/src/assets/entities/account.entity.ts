import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Holding } from './holding.entity';

export enum AccountType {
    BANK = 'bank',
    BROKER = 'broker',
    CASH = 'cash',
    CERTIFICATE = 'certificate',
    REAL_ESTATE = 'real_estate'
}

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ length: 3, name: 'currency_code' })
    currencyCode: string;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    balance: number;

    @Column({
        type: 'enum',
        enum: AccountType,
        default: AccountType.BANK
    })
    type: AccountType;

    @Column({ name: 'is_primary', default: false })
    isPrimary: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @OneToMany(() => Holding, holding => holding.account)
    holdings: Holding[];
}
