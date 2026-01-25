
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Helper for currency conversion (Simplified for MVP)
const toSAR = (amount: number, currency: string) => {
    if (!currency || currency === 'SAR') return amount;
    if (currency === 'USD') return amount * 3.75;
    if (currency === 'EGP') return amount * 0.08;
    return amount;
};

export async function GET() {
    const supabase = await createClient();

    // Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch Accounts
        const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('*');

        if (accountsError) throw accountsError;

        // Fetch Holdings (via Accounts is tricky in one go if not joined, but we can fetch all holdings for user's accounts)
        // Since we have RLS on holdings based on accounts, we can just select from holdings?
        // Actually RLS says "exists in accounts where user_id = auth.uid()" so simple select work.
        const { data: holdings, error: holdingsError } = await supabase
            .from('holdings')
            .select(`
                *,
                asset:assets(*)
            `);

        if (holdingsError) throw holdingsError;

        // 1. Calculate Zakatable Cash (Accounts)
        let cashTotalSAR = 0;
        const zakatableAccountTypes = ['bank', 'cash', 'certificate', 'broker'];

        accounts?.forEach((account: any) => {
            if (zakatableAccountTypes.includes(account.type.toLowerCase())) {
                cashTotalSAR += toSAR(Number(account.balance), account.currency_code);
            }
        });

        // 2. Calculate Zakatable Investments (Holdings)
        let investmentsTotalSAR = 0;
        const details: any[] = [];

        holdings?.forEach((holding: any) => {
            if (holding.is_primary_home) return;

            // Find parent account for currency
            const account = accounts?.find((a: any) => a.id === holding.account_id);
            const currency = account?.currency_code || 'SAR';

            // Check Asset linkage
            if (holding.asset) {
                if (holding.asset.is_zakatable) {
                    const rawValue = Number(holding.units) * Number(holding.asset.current_price);
                    const valueSAR = toSAR(rawValue, currency);
                    investmentsTotalSAR += valueSAR;
                    details.push({
                        name: holding.asset.name,
                        amount: valueSAR,
                        type: holding.asset.type,
                        originalCurrency: currency
                    });
                }
            } else {
                // Manual/Unlinked Holding - Assume value = units (or need price field in holding? simplified assumption)
                const value = Number(holding.units);
                const valueSAR = toSAR(value, currency);
                investmentsTotalSAR += valueSAR;
                details.push({
                    name: holding.instrument_code,
                    amount: valueSAR,
                    type: 'Manual',
                    originalCurrency: currency
                });
            }
        });

        const totalAssetsSAR = cashTotalSAR + investmentsTotalSAR;
        const totalAssetsUSD = totalAssetsSAR / 3.75;
        const NISAB_USD = 6125;

        const isZakatable = totalAssetsUSD >= NISAB_USD;
        const zakatDueSAR = isZakatable ? totalAssetsSAR * 0.025 : 0;
        const zakatDueUSD = isZakatable ? totalAssetsUSD * 0.025 : 0;

        return NextResponse.json({
            total_assets_sar: totalAssetsSAR,
            total_assets_usd: totalAssetsUSD.toFixed(2),
            zakat_due_sar: zakatDueSAR.toFixed(2),
            zakat_due_usd: zakatDueUSD.toFixed(2),
            nisab_threshold_usd: NISAB_USD,
            is_above_nisab: isZakatable,
            breakdown: {
                cash_sar: cashTotalSAR,
                investments_sar: investmentsTotalSAR,
                details
            }
        });

    } catch (error: any) {
        console.error('Zakat System Calc Error Full:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
