import { useState, type FormEvent } from 'react';
import { useInvestmentProducts, useUserPortfolio, useBuyInvestment, useSellInvestment, useUserProfile, useRebalancePortfolio } from '../api/investments';
import { TrendingUp, ShieldCheck, X, Target, Scale, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../contexts/SettingsContext';
import { RiskAssessmentModal } from './RiskAssessmentModal';

export function InvestmentsDashboard() {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const { data: products, isLoading: productsLoading } = useInvestmentProducts();
    const { data: portfolio, isLoading: portfolioLoading } = useUserPortfolio();
    const { data: userProfile } = useUserProfile();
    const buyMutation = useBuyInvestment();
    const sellMutation = useSellInvestment();

    const [buyModalOpen, setBuyModalOpen] = useState<{ isOpen: boolean; product: any | null } | null>(null);
    const [sellModalOpen, setSellModalOpen] = useState<{ isOpen: boolean; item: any | null } | null>(null);
    const [riskModalOpen, setRiskModalOpen] = useState(false);
    const [rebalanceModalOpen, setRebalanceModalOpen] = useState(false);
    const [rebalanceResult, setRebalanceResult] = useState<any>(null);
    const [amount, setAmount] = useState<number>(0);

    const rebalanceMutation = useRebalancePortfolio();

    const handleRebalance = async () => {
        try {
            const result = await rebalanceMutation.mutateAsync();
            setRebalanceResult(result);
            setRebalanceModalOpen(true);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleBuy = async (e: FormEvent) => {
        e.preventDefault();
        if (!buyModalOpen?.product) return;
        try {
            await buyMutation.mutateAsync({
                productId: buyModalOpen.product.id,
                amount: Number(amount)
            });
            setBuyModalOpen(null);
            setAmount(0);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSell = async (e: FormEvent) => {
        e.preventDefault();
        if (!sellModalOpen?.item) return;
        try {
            await sellMutation.mutateAsync({
                productId: sellModalOpen.item.asset.id,
                amount: Number(amount)
            });
            setSellModalOpen(null);
            setAmount(0);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (productsLoading || portfolioLoading) return <div className="p-6">Loading investments...</div>;

    const { profile, currency } = useSettings(); // Use profile settings if needed
    const displayCurrency = currency || 'SAR';

    const rates: Record<string, number> = {
        'SAR': 1,
        'USD': 0.266, // 1 SAR = 0.266 USD
        'EGP': 12.5   // 1 SAR = 12.5 EGP
    };

    const convert = (amount: number, fromCurrency = 'SAR') => {
        // Convert to Base (SAR) first
        let inSAR = amount;
        if (fromCurrency === 'USD') inSAR = amount / 0.266;
        else if (fromCurrency === 'EGP') inSAR = amount / 12.5;

        // Then convert to Target (if different)
        // For Dashboard Totals, we usually show in User's Preferred Currency (displayCurrency)
        // But for "Total Net Worth" typically it's Base. 

        // Let's assume user wants to see everything in 'displayCurrency'
        const rate = rates[displayCurrency] || 1;

        // If fromCurrency is same as display, just return
        if (fromCurrency === displayCurrency) return amount;

        // If fromCurrency and displayCurrency both exist in rates (relative to SAR)
        // converting 100 EGP to USD?
        // 100 EGP / 12.5 = 8 SAR -> 8 * 0.266 = 2.128 USD

        return inSAR * (rates[displayCurrency] || 1); // This logic needs to align with BudgetSummary. 
        // BudgetSummary: totalBudget = ... + convert(..., 'SAR'). 
        // BudgetSummary converts EVERYTHING to 'SAR' first? No.
        // BudgetSummary: 
        // const convert = (amount: number, fromCurrency = 'SAR') => {
        //    let inSAR = amount;
        //    if (fromCurrency === 'USD') inSAR = amount / 0.266;
        //    else if (fromCurrency === 'EGP') inSAR = amount / 12.5;
        //    const rate = rates[displayCurrency] || 1;
        //    return inSAR * rate;
        // };
        // Wait, if 1 SAR = 12.5 EGP.
        // If I have 1 SAR, I have 12.5 EGP.
        // So SAR -> EGP is * 12.5.
        // Correct.
    };

    if (productsLoading || portfolioLoading) return <div className="p-6">Loading investments...</div>;

    const totalPortfolioValue = portfolio?.reduce((sum, item) => {
        return sum + convert(Number(item.amount), item.currency || 'SAR'); // Default to SAR logic if missing
    }, 0) || 0;

    return (
        <div className="p-6 space-y-8 animate-in fade-in">
            {/* Header & Portfolio Summary */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-8 h-8" />
                    {t('halal_investments')}
                </h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <div>
                        <p className="text-emerald-100 text-sm uppercase tracking-wider mb-1">{t('total_net_worth')}</p>
                        <p className="text-4xl font-bold dir-ltr">{formatPrice(totalPortfolioValue)}</p>
                    </div>
                </div>
                <button
                    onClick={handleRebalance}
                    disabled={rebalanceMutation.isPending}
                    className="mt-4 bg-emerald-800/50 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-600/30 transition-colors"
                >
                    <Scale size={16} />
                    {rebalanceMutation.isPending ? t('processing') : t('check_portfolio_balance')}
                </button>
                {/* Risk Profile Banner inside Header */}
                <div className="mt-6 pt-6 border-t border-emerald-600/50 flex justify-between items-center">
                    <div>
                        <p className="text-emerald-100 text-sm">{t('risk_profile')}</p>
                        <p className="font-bold text-lg">{userProfile?.riskProfile || t('not_assessed')}</p>
                    </div>
                    <button
                        onClick={() => setRiskModalOpen(true)}
                        className="bg-white text-emerald-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                        <Target size={16} />
                        {userProfile?.riskProfile ? t('retake_assessment') : t('start_assessment')}
                    </button>
                </div>
            </div>

            {/* My Portfolio */}
            {portfolio && portfolio.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4 text-primary">{t('your_holdings')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolio.map(item => (
                            <div key={item.id} className="bg-card border p-4 rounded-xl shadow-sm flex justify-between items-center group">
                                <div>
                                    <h3 className="font-semibold">{item.asset.name}</h3>
                                    <p className="text-xs text-muted-foreground">{t(item.asset.type)}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-bold text-lg dir-ltr">{formatPrice(Number(item.amount))}</p>
                                    <button
                                        onClick={() => setSellModalOpen({ isOpen: true, item })}
                                        className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors bg-destructive/5 px-2 py-1 rounded-full"
                                    >
                                        <Minus size={12} /> {t('Sell')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Manual Entry Action */}
            <div className="flex justify-end">
                <Link
                    to="/assets"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    + {t('add_asset')}
                </Link>
            </div>

            {/* Available Opportunities */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-primary">{t('investment_opportunities')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map(product => {
                        const isRecommended =
                            userProfile?.riskProfile === 'Aggressive' && product.riskLevel === 'High' ||
                            userProfile?.riskProfile === 'Balanced' && (product.riskLevel === 'Medium' || product.riskLevel === 'Low') ||
                            userProfile?.riskProfile === 'Conservative' && product.riskLevel === 'Low';
                        return (
                            <div key={product.id} className={`bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative ${isRecommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                {isRecommended && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg z-10 font-medium">
                                        {t('recommended')}
                                    </div>
                                )}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded-full border ${product.riskLevel === 'Low' ? 'bg-green-50 text-green-700 border-green-200' : product.riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {product.riskLevel} {t('risk_level')}
                                            </span>
                                            <h3 className="text-lg font-bold mt-2">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{t(product.type)}</p>
                                        </div>
                                        <ShieldCheck className="text-emerald-600 w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                    <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">{t('exp_return')}</p>
                                            <p className="font-bold text-emerald-600">{product.expectedReturn}%</p>
                                        </div>
                                        <div className="h-8 w-px bg-border" />
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">{t('min_invest')}</p>
                                            <p className="font-bold dir-ltr">{formatPrice(Number(product.minInvestment))}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t bg-muted/5">
                                    <button
                                        onClick={() => setBuyModalOpen({ isOpen: true, product })}
                                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        {t('invest_now')}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div >

            {riskModalOpen && <RiskAssessmentModal onClose={() => setRiskModalOpen(false)} />}

            {/* Buy Modal */}
            {buyModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{t('invest_now')} - {buyModalOpen.product.name}</h2>
                            <button onClick={() => setBuyModalOpen(null)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleBuy} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('value_units')}</label>
                                <input
                                    type="number"
                                    autoFocus
                                    className="w-full p-2 rounded-md border bg-input"
                                    min={Number(buyModalOpen.product.minInvestment)}
                                    value={amount || ''}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">{t('min_invest')}: {formatPrice(Number(buyModalOpen.product.minInvestment))}</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setBuyModalOpen(null)} className="px-4 py-2 rounded-md hover:bg-muted">{t('cancel')}</button>
                                <button type="submit" disabled={buyMutation.isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50">
                                    {buyMutation.isPending ? t('processing') : t('confirm_investment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sell Modal */}
            {sellModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-red-600">{t('sell_investment')} - {sellModalOpen.item.asset.name}</h2>
                            <button onClick={() => setSellModalOpen(null)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSell} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('amount_to_sell')}</label>
                                <input
                                    type="number"
                                    autoFocus
                                    className="w-full p-2 rounded-md border bg-input"
                                    max={Number(sellModalOpen.item.amount)}
                                    value={amount || ''}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">{t('available')}: {formatPrice(Number(sellModalOpen.item.amount))}</p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setSellModalOpen(null)} className="px-4 py-2 rounded-md hover:bg-muted">{t('cancel')}</button>
                                <button type="submit" disabled={sellMutation.isPending} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50">
                                    {sellMutation.isPending ? t('processing') : t('confirm_sell')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rebalance Modal */}
            {rebalanceModalOpen && rebalanceResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl border">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Scale className="text-primary" /> Portfolio Analysis
                            </h2>
                            <button onClick={() => setRebalanceModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground">Current Allocation</p>
                                    <p className="font-bold">Equity: {(Number(rebalanceResult.currentAllocation.Equity) * 100).toFixed(0)}%</p>
                                    <p className="font-bold">Sukuk: {(Number(rebalanceResult.currentAllocation.Sukuk) * 100).toFixed(0)}%</p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <p className="text-xs text-muted-foreground">Target ({rebalanceResult.riskProfile})</p>
                                    <p className="font-bold text-primary">Equity: {rebalanceResult.targetAllocation.Equity * 100}%</p>
                                    <p className="font-bold text-primary">Sukuk: {rebalanceResult.targetAllocation.Sukuk * 100}%</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-2 text-sm uppercase text-muted-foreground">Recommended Actions</h3>
                                <ul className="space-y-2">
                                    {rebalanceResult.recommendedActions.map((action: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2 p-2 bg-card border rounded-md text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
