import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('user_portfolios')
export class UserPortfolio {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Asset)
    @JoinColumn({ name: 'assetId' })
    asset: Asset;

    @Column()
    assetId: string; // Renamed from productId

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number; // Amount invested in SAR

    @CreateDateColumn()
    purchasedAt: Date;
}
