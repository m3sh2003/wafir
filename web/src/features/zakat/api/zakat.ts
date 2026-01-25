// Client-side Zakat Calculation (Serverless)

export interface ZakatRequest {
    portfolio_valuation_usd: number;
    non_zakat_assets: string[];
    nisab_usd: number;
}

export interface ZakatResult {
    zakat_due_usd: number;
    currency: string;
    calculation_basis: string;
    nisab_status: string;
    message?: string;
}

export const calculateZakat = async (data: ZakatRequest): Promise<ZakatResult> => {
    // Simulate async delay for UI consistency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic Logic: 2.5% of Portfolio Value if > Nisab
    // In a real app, we would subtract liabilities or non-zakat assets if passed as values.
    // Here we treat portfolio_valuation_usd as the zakatable amount.

    const zakatableAmount = data.portfolio_valuation_usd;
    const isEligible = zakatableAmount >= data.nisab_usd;
    const ZAKAT_RATE = 0.025;

    return {
        zakat_due_usd: isEligible ? zakatableAmount * ZAKAT_RATE : 0,
        currency: 'USD',
        calculation_basis: '2.5% of Portfolio Value (Hijri Year Basis)',
        nisab_status: isEligible ? 'Above Nisab' : 'Below Nisab',
        message: isEligible
            ? 'Your wealth exceeds the Nisab threshold. Zakat is due.'
            : 'Total zakatable assets are below the Nisab threshold. No Zakat due.'
    };
};

export const calculateSystemZakat = async (): Promise<any> => {
    // Serverless Mock for Nisab (Gold Standard)
    // 85 grams of Gold * ~$85/gram (Approx market rate) = ~$7225
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        nisab_usd: 7225,
        gold_price_usd: 85,
        currency: 'USD',
        last_updated: new Date().toISOString()
    };
};
