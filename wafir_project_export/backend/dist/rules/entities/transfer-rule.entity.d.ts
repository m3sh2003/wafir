import { User } from '../../users/entities/user.entity';
export declare enum RuleConditionType {
    INCOME_RECEIVED = "INCOME_RECEIVED",
    MONTHLY_DATE = "MONTHLY_DATE",
    BALANCE_ABOVE = "BALANCE_ABOVE",
    BALANCE_BELOW = "BALANCE_BELOW"
}
export declare enum RuleActionType {
    TRANSFER_PERCENTAGE = "TRANSFER_PERCENTAGE",
    TRANSFER_FIXED = "TRANSFER_FIXED",
    ALERT_ONLY = "ALERT_ONLY",
    CATEGORIZE = "CATEGORIZE"
}
export declare class TransferRule {
    id: string;
    name: string;
    user: User;
    userId: string;
    conditionType: RuleConditionType;
    conditionValue: any;
    actionType: RuleActionType;
    actionValue: any;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
