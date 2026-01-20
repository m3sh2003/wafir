import { useEffect } from 'react';
import { useRebalancePortfolio } from '../api/investments';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSettings } from '../../../contexts/SettingsContext';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']; // Emerald, Blue, Amber, Red

export function PortfolioRebalancePage() {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const { mutate: rebalance, data: rebalanceResult, isPending, error } = useRebalancePortfolio();

    useEffect(() => {
        rebalance();
    }, [rebalance]);

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('analyzing_portfolio') || "Analyzing portfolio..."}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-lg font-bold">{t('analysis_failed') || "Analysis Failed"}</h2>
                <p>{(error as Error).message}</p>
                <button onClick={() => rebalance()} className="mt-4 flex items-center gap-2 mx-auto text-sm bg-white border border-red-200 px-4 py-2 rounded-md hover:bg-red-50">
                    <RefreshCw className="w-4 h-4" />
                    {t('retry') || "Retry"}
                </button>
            </div>
        );
    }

    if (!rebalanceResult) return null;

    // Prepare Data for Charts
    const currentData = [
        { name: t('equity_etf'), value: rebalanceResult.currentAllocation.Equity },
        { name: t('fixed_income_sukuk'), value: rebalanceResult.currentAllocation.Sukuk },
        { name: t('real_estate'), value: rebalanceResult.currentAllocation.RealEstate || 0 },
        { name: t('cash'), value: rebalanceResult.currentAllocation.Cash || 0 },
    ].filter(d => d.value > 0);

    const targetData = [
        { name: t('equity_etf'), value: rebalanceResult.targetAllocation.Equity },
        { name: t('fixed_income_sukuk'), value: rebalanceResult.targetAllocation.Sukuk },
        { name: t('real_estate'), value: rebalanceResult.targetAllocation.RealEstate || 0 },
        { name: t('cash'), value: rebalanceResult.targetAllocation.Cash || 0 },
    ].filter(d => d.value > 0);

    // Calculate Table Data
    const totalValue = Number(rebalanceResult.totalValue || 0);
    const tableRows = [
        {
            key: 'Equity',
            label: t('equity_etf'),
            currentPct: rebalanceResult.currentAllocation.Equity,
            targetPct: rebalanceResult.targetAllocation.Equity,
        },
        {
            key: 'Sukuk',
            label: t('fixed_income_sukuk'),
            currentPct: rebalanceResult.currentAllocation.Sukuk,
            targetPct: rebalanceResult.targetAllocation.Sukuk,
        },
        // Add others if needed
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Link to="/investments" className="hover:text-primary transition-colors">{t('investments')}</Link>
                        <span>/</span>
                        <span className="font-semibold text-foreground">{t('rebalance')}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{t('portfolio_health_check')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('optimized_based_on', { risk: t(rebalanceResult.riskProfile || 'Balanced') })}
                    </p>
                </div>
                <div className="text-right bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{t('total_portfolio_value')}</div>
                    <div className="text-3xl font-bold font-mono text-primary">{formatPrice(totalValue)}</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Allocation */}
                <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center">
                    <h3 className="font-semibold text-lg mb-4">{t('current_allocation')}</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={currentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {currentData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: any) => `${(Number(value) * 100).toFixed(1)}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Target Allocation */}
                <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-xl">TARGET</div>
                    <h3 className="font-semibold text-lg mb-4">{t('target_allocation')} ({t(rebalanceResult.riskProfile)})</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={targetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {targetData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: any) => `${(Number(value) * 100).toFixed(1)}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Analysis Table */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-lg">{t('detailed_analysis') || "Detailed Analysis"}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-4 text-start font-medium">{t('asset_class')}</th>
                                <th className="p-4 text-center font-medium">{t('current')} %</th>
                                <th className="p-4 text-center font-medium">{t('target')} %</th>
                                <th className="p-4 text-end font-medium">{t('current_value')}</th>
                                <th className="p-4 text-end font-medium">{t('target_value')}</th>
                                <th className="p-4 text-center font-medium">{t('diff')}</th>
                                <th className="p-4 text-end font-medium">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {tableRows.map((row) => {
                                const currentVal = totalValue * row.currentPct;
                                const targetVal = totalValue * row.targetPct;
                                const diffVal = targetVal - currentVal;
                                const isBalanced = Math.abs(diffVal) < (totalValue * 0.01); // 1% threshold

                                return (
                                    <tr key={row.key} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4 font-medium">{row.label}</td>
                                        <td className="p-4 text-center">{(row.currentPct * 100).toFixed(1)}%</td>
                                        <td className="p-4 text-center font-mono text-muted-foreground">{(row.targetPct * 100).toFixed(0)}%</td>
                                        <td className="p-4 text-end">{formatPrice(currentVal)}</td>
                                        <td className="p-4 text-end text-muted-foreground">{formatPrice(targetVal)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${diffVal > 0 ? 'bg-green-100 text-green-700' : diffVal < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {diffVal > 0 ? '+' : ''}{(diffVal / totalValue * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-end">
                                            {isBalanced ? (
                                                <span className="text-muted-foreground flex items-center justify-end gap-1">
                                                    <CheckCircle2 className="w-4 h-4" /> {t('balanced')}
                                                </span>
                                            ) : (
                                                <span className={`font-bold flex items-center justify-end gap-1 ${diffVal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {diffVal > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                    {diffVal > 0 ? t('buy') : t('sell')} {formatPrice(Math.abs(diffVal))}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Plan */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                    {t('recommended_action_plan')}
                </h3>

                {rebalanceResult.recommendedActions.length === 0 || (rebalanceResult.recommendedActions.length === 1 && rebalanceResult.recommendedActions[0].includes('balanced')) ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-lg text-green-800">{t('portfolio_is_balanced')}</h4>
                        <p className="text-green-700">{t('no_actions_needed_desc')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-foreground/80 mb-4">{t('to_align_with_risk_profile')}:</p>
                        <div className="grid gap-3">
                            {rebalanceResult.recommendedActions.map((action: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-lg">{action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
