import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('portfolio_targets')
export class PortfolioTarget {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'asset_class' })
    assetClass: string;

    @Column('numeric', { precision: 5, scale: 2, name: 'target_pct' })
    targetPct: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;
}
