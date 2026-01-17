import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    passwordHash: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'jsonb', default: {} })
    settings: Record<string, any>;

    @Column({ nullable: true })
    riskProfile: string; // 'Conservative' | 'Balanced' | 'Aggressive'

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
