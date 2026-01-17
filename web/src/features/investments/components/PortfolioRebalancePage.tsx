import { useEffect } from 'react';
import { useRebalancePortfolio } from '../api/investments';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowRight, CheckCircle2, AlertTriangle, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PortfolioRebalancePage() {
    const { t } = useTranslation();
    const { mutate: rebalance, data: rebalanceResult, isPending, error } = useRebalancePortfolio();

    useEffect(() => {
        rebalance();
    }, [rebalance]);

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing portfolio structure...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-lg font-bold">Analysis Failed</h2>
                <p>{(error as Error).message}</p>
                <Link to="/investments" className="mt-4 inline-block text-sm underline hover:text-red-800">Return to Portfolio</Link>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Link to="/investments" className="text-muted-foreground hover:text-primary transition-colors">{t('investments')}</Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-bold">{t('rebalance')}</span>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">{t('portfolio_health_check')}</h1>
                    <p className="text-muted-foreground">
                        {t('optimized_based_on', { risk: t(rebalanceResult?.riskProfile || 'Balanced') })}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">{t('total_portfolio_value')}</div>
                    <div className="text-2xl font-bold font-mono">{Number(rebalanceResult?.totalValue || 0).toLocaleString()} SAR</div>
                </div>
            </div>

            {rebalanceResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Allocation Comparison */}
                    <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                        <h3 className="font-semibold flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            {t('allocation_strategy')}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t('equity_etf')}</span>
                                    <span className="font-mono">
                                        {t('current')}: {(Number(rebalanceResult.currentAllocation.Equity) * 100).toFixed(0)}%
                                        <span className="text-muted-foreground mx-1">/</span>
                                        {t('target')}: {(rebalanceResult.targetAllocation.Equity * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${rebalanceResult.currentAllocation.Equity * 100}%` }} title={t('current')} />
                                    <div className="bg-blue-200 h-full w-1 z-10" style={{ marginLeft: `-${(rebalanceResult.currentAllocation.Equity * 100)}%`, left: `${rebalanceResult.targetAllocation.Equity * 100}%`, position: 'relative' }} title={t('target')} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t('fixed_income_sukuk')}</span>
                                    <span className="font-mono">
                                        {t('current')}: {(Number(rebalanceResult.currentAllocation.Sukuk) * 100).toFixed(0)}%
                                        <span className="text-muted-foreground mx-1">/</span>
                                        {t('target')}: {(rebalanceResult.targetAllocation.Sukuk * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${rebalanceResult.currentAllocation.Sukuk * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Plan */}
                    <div className="bg-card p-6 rounded-xl border shadow-sm bg-primary/5 border-primary/20">
                        <h3 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                            {t('recommended_actions')}
                        </h3>

                        {rebalanceResult.recommendedActions.length === 0 || (rebalanceResult.recommendedActions.length === 1 && rebalanceResult.recommendedActions[0].includes('balanced')) ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <p className="font-medium text-green-800">{t('perfectly_balanced')}</p>
                                <p className="text-sm text-green-600">{t('no_actions_needed')}</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {rebalanceResult.recommendedActions.map((action: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border shadow-sm">
                                        <ArrowRight className="w-5 h-5 text-primary mt-0.5" />
                                        <span className="font-medium">{action}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-6 pt-4 border-t border-primary/10">
                            <p className="text-xs text-muted-foreground">
                                {t('recommendation_note', { risk: t(rebalanceResult.riskProfile) })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
