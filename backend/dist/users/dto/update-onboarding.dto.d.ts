export declare enum RiskProfile {
    CONSERVATIVE = "Conservative",
    BALANCED = "Balanced",
    AGGRESSIVE = "Aggressive"
}
export declare class UpdateOnboardingDto {
    riskProfile: RiskProfile;
    monthlyIncome: number;
    budgetLimits: Record<string, number>;
}
