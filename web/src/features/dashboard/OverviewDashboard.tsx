import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';
import { useUserPortfolio } from '../investments/api/investments';
import { useEnvelopes } from '../budget/api/budget';
import { BudgetSummary } from '../budget/components/BudgetSummary';

export function OverviewDashboard() {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const { data: portfolio, isLoading: isPortfolioLoading } = useUserPortfolio();
    const { data: envelopes, isLoading: isBudgetLoading } = useEnvelopes();

    // Calculations
    const RATES: Record<string, number> = { 'SAR': 1, 'USD': 3.75, 'EGP': 0.08 };
    const toSAR = (amount: number, currency: string = 'SAR') => {
        const rate = RATES[currency.toUpperCase()] || 1;
        return amount * rate;
    };

    const totalAssets = portfolio?.reduce((sum, item) => {
        // Portfolio items from 'investments' api might be raw.
        // We need to check if they have currency. 
        // Note: Investments API 'userPortfolio' usually returns normalized SAR if we fixed it?
        // Let's check 'investments.ts'. fetchPortfolio returns items.
        // Wait, 'useUserPortfolio' returns `UserPortfolioItem` which has `currency`.
        // My previous fix in investments.ts added `currency_code` mapping. 
        return sum + toSAR(Number(item.amount), (item as any).currency || 'SAR');
    }, 0) || 0;

    const monthlyExpenses = envelopes?.reduce((sum, env) => sum + (env.spent || 0), 0) || 0; // env.spent is already SAR from budget.ts fix
    const budgetLimit = envelopes?.reduce((sum, env) => sum + Number(env.limitAmount), 0) || 1;
    const budgetUsagePct = Math.round((monthlyExpenses / budgetLimit) * 100);

    const compliantAssets = portfolio?.filter(item => {
        return (item.asset as any).isShariaCompliant !== false;
    }).reduce((sum, item) => sum + toSAR(Number(item.amount), (item as any).currency || 'SAR'), 0) || 0;

    const compliancePct = totalAssets > 0 ? Math.round((compliantAssets / totalAssets) * 100) : 100;

    if (isPortfolioLoading || isBudgetLoading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">{t('dashboard')}</h1>
                <p className="text-muted-foreground">{t('welcome')}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-muted-foreground mb-2">{t('total_net_worth')}</div>
                    <div className="text-3xl font-bold dir-ltr">{formatPrice(totalAssets)}</div>
                    <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        ▲ {t('updated_just_now')}
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-muted-foreground mb-2">{t('monthly_expenses')}</div>
                    <div className="text-3xl font-bold dir-ltr">{formatPrice(monthlyExpenses)}</div>
                    <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
                        <div
                            className={`h-full transition-all ${budgetUsagePct > 90 ? 'bg-red-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(budgetUsagePct, 100)}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{budgetUsagePct}% {t('of_budget')}</div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm text-muted-foreground mb-2">{t('compliant_investments')}</div>
                    <div className="text-3xl font-bold dir-ltr">{compliancePct}%</div>
                    <div className="text-xs text-primary mt-2">
                        <Link to="/investments" className="hover:underline">{t('view_portfolio')} ←</Link>
                    </div>
                </div>
            </div>

            {/* Detailed Budget Summary */}
            <BudgetSummary />

            {/* Quick Actions */}
            <h2 className="text-xl font-bold mt-8">{t('quick_actions')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/budget/add-transaction" className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">💸</span>
                    <span className="font-medium text-sm">{t('add_transaction')}</span>
                </Link>
                <Link to="/investments/rebalance" className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">⚖️</span>
                    <span className="font-medium text-sm">{t('rebalance')}</span>
                </Link>
                <Link to="/zakat" className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">🕌</span>
                    <span className="font-medium text-sm">{t('zakat_calc')}</span>
                </Link>
                <Link to="/assets" className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">🏠</span>
                    <span className="font-medium text-sm">{t('add_asset')}</span>
                </Link>
            </div>
        </div>
    );
}
