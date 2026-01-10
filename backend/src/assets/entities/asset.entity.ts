import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Holding } from './holding.entity';

export enum AssetType {
    SUKUK = 'Sukuk',
    EQUITY = 'Equity',
    FUND = 'Fund',
    REAL_ESTATE = 'Real Estate',
    CASH = 'Cash',
    ETF = 'ETF',
    REIT = 'REIT',
    STOCK = 'Stock'
}

export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
}

@Entity('assets')
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    symbol: string;

    @Column({
        type: 'enum',
        enum: AssetType,
        default: AssetType.ETF
    })
    type: AssetType;

    @Column({
        type: 'enum',
        enum: RiskLevel,
        default: RiskLevel.MEDIUM
    })
    riskLevel: RiskLevel;

    @Column('decimal', { precision: 10, scale: 2, default: 10.0 })
    currentPrice: number;

    @Column('decimal', { precision: 5, scale: 2 })
    expectedReturn: number;

    @Column('decimal', { precision: 10, scale: 2 })
    minInvestment: number;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isZakatable: boolean;

    @Column({ default: true })
    isShariaCompliant: boolean;

    @OneToMany(() => Holding, holding => holding.asset)
    holdings: Holding[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
