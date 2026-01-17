import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { Asset } from './asset.entity';

@Entity('holdings')
export class Holding {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'instrument_code' })
    instrumentCode: string;

    @ManyToOne(() => Asset, asset => asset.holdings, { nullable: true })
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @Column({ name: 'asset_id', nullable: true })
    assetId: string;

    @Column('numeric', { precision: 18, scale: 6 })
    units: number;

    // Use asset property as default, but allow override if needed? 
    // For now, removing isShariaCompliant generic flag as it belongs to Asset type usually.
    // Keeping isPrimaryHome for Zakat exemptions on Property
    @Column({ name: 'is_primary_home', default: false })
    isPrimaryHome: boolean;

    @ManyToOne(() => Account, account => account.holdings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @Column({ name: 'account_id' })
    accountId: number;
}
