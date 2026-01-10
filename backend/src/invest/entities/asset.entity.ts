import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Portfolio } from './portfolio.entity';

@Entity('assets')
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    symbol: string;

    @Column()
    name: string;

    @Column()
    type: string; // Stock, Fund, RealEstate, etc.

    @Column('decimal', { precision: 15, scale: 4 })
    quantity: number;

    @Column('decimal', { precision: 15, scale: 4, default: 0 })
    averageCost: number;

    @Column('boolean', { default: true })
    isZakatEligible: boolean;

    @Column('boolean', { default: false })
    isResidence: boolean; // For Real Estate

    @ManyToOne(() => Portfolio, (portfolio) => portfolio.assets)
    @JoinColumn({ name: 'portfolioId' })
    portfolio: Portfolio;

    @Column()
    portfolioId: string;
}
