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

import { supabase } from '../../../lib/supabase';

export const calculateSystemZakat = async (): Promise<any> => {
    // 1. Fetch User Holdings
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data: accounts, error } = await supabase
        .from('accounts')
        .select(`
            *,
            holdings (
                units,
                is_sharia_compliant,
                is_primary_home,
                instrument_code
            )
        `)
        .eq('user_id', user.data.user.id);

    if (error) throw new Error(error.message);

    // 2. Sum up Zakatable Assets
    let totalAssetsSAR = 0;
    const breakdown = {
        cash_sar: 0,
        investments_sar: 0,
        real_estate_sar: 0
    };

    accounts?.forEach((acc: any) => {
        acc.holdings?.forEach((h: any) => {
            const val = Number(h.units);

            // Logic: Exclude Primary Home by default
            if (h.is_primary_home) return;

            // Categorize
            if (acc.type === 'bank' || acc.type === 'cash' || h.instrument_code.toLowerCase().includes('cash')) {
                breakdown.cash_sar += val;
                totalAssetsSAR += val;
            } else if (acc.type === 'real_estate') {
                breakdown.real_estate_sar += val;
                totalAssetsSAR += val;
            } else {
                breakdown.investments_sar += val;
                totalAssetsSAR += val;
            }
        });
    });

    // 3. Nisab Logic (Silver Standard is safer for Zakat, but User requested Gold in old code. Using Gold ~85g)
    // Gold Price (Mock approx). TODO: Fetch live price.
    const GOLD_PRICE_SAR_PER_GRAM = 300;
    const NISAB_SAR = 85 * GOLD_PRICE_SAR_PER_GRAM; // ~25,500 SAR

    const zakatDue = totalAssetsSAR >= NISAB_SAR ? totalAssetsSAR * 0.025 : 0;

    return {
        zakat_due_sar: zakatDue,
        total_assets_sar: totalAssetsSAR,
        nisab_sar: NISAB_SAR,
        currency: 'SAR',
        breakdown: breakdown,
        is_above_nisab: totalAssetsSAR >= NISAB_SAR,
        calculation_basis: '2.5% of Zakatable Assets (Hijri)',
        message: totalAssetsSAR >= NISAB_SAR
            ? 'Your wealth exceeds the Nisab threshold. Zakat is due.'
            : 'Total zakatable assets are below the Nisab threshold. No Zakat due.'
    };
};
