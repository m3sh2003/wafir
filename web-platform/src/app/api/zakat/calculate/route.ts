
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { portfolio_valuation_usd, nisab_usd = 6125 } = body;

        // Validate inputs
        if (portfolio_valuation_usd === undefined || portfolio_valuation_usd === null) {
            return NextResponse.json({ error: 'portfolio_valuation_usd is required' }, { status: 400 });
        }

        const valuation = Number(portfolio_valuation_usd);
        const nisab = Number(nisab_usd);

        if (valuation < nisab) {
            return NextResponse.json({
                zakat_due_usd: 0,
                message: 'Total assets are below Nisab. No Zakat due.',
                nisab_status: 'Below Nisab',
                is_above_nisab: false
            });
        }

        const zakatDue = valuation * 0.025;

        return NextResponse.json({
            zakat_due_usd: zakatDue,
            currency: 'USD',
            calculation_basis: '2.5% of Portfolio Valuation',
            nisab_status: 'Above Nisab',
            is_above_nisab: true
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
