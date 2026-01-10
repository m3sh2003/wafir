import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_transactions')
export class AssetTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string; // BUY, SELL, DIVIDEND

    @Column('decimal', { precision: 15, scale: 4 })
    quantity: number;

    @Column('decimal', { precision: 15, scale: 4 })
    pricePerUnit: number;

    @Column('decimal', { precision: 15, scale: 2 })
    totalAmount: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @ManyToOne(() => Asset)
    @JoinColumn({ name: 'assetId' })
    asset: Asset;

    @Column()
    assetId: string;

    @CreateDateColumn()
    createdAt: Date;
}
