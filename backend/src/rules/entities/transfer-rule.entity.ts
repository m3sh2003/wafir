import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RuleConditionType {
    INCOME_RECEIVED = 'INCOME_RECEIVED',
    MONTHLY_DATE = 'MONTHLY_DATE',
    BALANCE_ABOVE = 'BALANCE_ABOVE',
    BALANCE_BELOW = 'BALANCE_BELOW'
}

export enum RuleActionType {
    TRANSFER_PERCENTAGE = 'TRANSFER_PERCENTAGE',
    TRANSFER_FIXED = 'TRANSFER_FIXED',
    ALERT_ONLY = 'ALERT_ONLY',
    CATEGORIZE = 'CATEGORIZE'
}

@Entity('transfer_rules')
export class TransferRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({
        type: 'enum',
        enum: RuleConditionType,
        default: RuleConditionType.MONTHLY_DATE
    })
    conditionType: RuleConditionType;

    @Column('jsonb', { nullable: true })
    conditionValue: any; // e.g. { day: 3 } or { amount: 5000 }

    @Column({
        type: 'enum',
        enum: RuleActionType,
        default: RuleActionType.TRANSFER_PERCENTAGE
    })
    actionType: RuleActionType;

    @Column('jsonb', { nullable: true })
    actionValue: any; // e.g. { percent: 10, toAccount: 'Savings' }

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
