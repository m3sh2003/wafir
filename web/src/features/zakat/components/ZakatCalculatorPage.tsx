import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../contexts/SettingsContext';
import { calculateZakat, calculateSystemZakat, type ZakatResult } from '../api/zakat';
import { Calculator, DollarSign, Database, PenTool } from 'lucide-react';

export function ZakatCalculatorPage() {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const [valuation, setValuation] = useState(10000);
    const [nisab, setNisab] = useState(6000);
    const [result, setResult] = useState<ZakatResult | any>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'system' | 'manual'>('system');

    const handleCalculate = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'manual') {
                const data = await calculateZakat({
                    portfolio_valuation_usd: valuation,
                    nisab_usd: nisab,
                    non_zakat_assets: []
                });
                setResult(data);
            } else {
                const data = await calculateSystemZakat();
                setResult(data);
            }
        } catch (err) {
            console.error(err);
            alert(`Calculation failed: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calculator className="w-8 h-8 text-primary" />
                    {t('zakat_calculator')}
                </h1>
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => { setMode('system'); setResult(null); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'system' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className="flex items-center gap-2"><Database size={16} /> {t('system_assets')}</span>
                    </button>
                    <button
                        onClick={() => { setMode('manual'); setResult(null); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className="flex items-center gap-2"><PenTool size={16} /> {t('manual_input')}</span>
                    </button>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {mode === 'system' ? (
                        <div className="bg-card p-6 rounded-lg shadow-sm border space-y-4">
                            <h2 className="text-xl font-semibold">{t('automatic_calculation')}</h2>
                            <p className="text-muted-foreground">
                                {t('automatic_calculation_desc')}
                            </p>
                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-md text-sm text-primary">
                                {t('automatic_calculation_note')}
                            </div>
                            <button
                                onClick={() => handleCalculate()}
                                disabled={loading}
                                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? t('scanning_assets') : t('calculate_my_zakat')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleCalculate} className="bg-card p-6 rounded-lg shadow-sm border space-y-4">
                            <h2 className="text-xl font-semibold mb-4">{t('manual_entry')}</h2>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('total_net_assets_usd')}</label>
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <input
                                        type="number"
                                        value={valuation}
                                        onChange={(e) => setValuation(Number(e.target.value))}
                                        className="w-full pl-9 p-2 rounded-md border bg-background"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">{t('current_nisab_usd')}</label>
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <input
                                        type="number"
                                        value={nisab}
                                        onChange={(e) => setNisab(Number(e.target.value))}
                                        className="w-full pl-9 p-2 rounded-md border bg-background"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('nisab_note')}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? t('calculating') : t('calculate_zakat')}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col justify-center items-center text-center min-h-[300px]">
                    {!result && (
                        <div className="text-muted-foreground">
                            <Calculator className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>{t('select_mode_msg')}</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4">
                            <div className={`text-lg font-medium inline-block px-3 py-1 rounded-full ${result.zakat_due_usd > 0 || result.zakat_due_sar > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {result.nisab_status || (result.is_above_nisab ? t('above_nisab') : t('below_nisab'))}
                            </div>

                            {/* Handle both system and manual result formats */}
                            {(result.zakat_due_usd > 0 || result.zakat_due_sar > 0) ? (
                                <div className="space-y-2">
                                    <div className="text-5xl font-bold text-primary track-tight dir-ltr">
                                        {result.zakat_due_sar ?
                                            <span className="flex flex-col items-center">
                                                {formatPrice(Number(result.zakat_due_sar))}
                                            </span>
                                            :
                                            formatPrice(result.zakat_due_usd)
                                        }
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('zakat_due')} ({result.calculation_basis || '2.5% of Zakatable Assets'})
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xl text-muted-foreground">
                                    {result.message || t('no_zakat_due')}
                                </p>
                            )}

                            {result.breakdown && (
                                <div className="mt-6 text-left w-full border-t pt-4">
                                    <h4 className="font-semibold mb-2">{t('breakdown')}</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>{t('cash_and_bank')}</span>
                                            <span className="dir-ltr">{formatPrice(Number(result.breakdown.cash_sar))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('investments')}</span>
                                            <span className="dir-ltr">{formatPrice(Number(result.breakdown.investments_sar))}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t">
                                            <span>{t('total_assets')}</span>
                                            <span className="dir-ltr">{formatPrice(Number(result.total_assets_sar))}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
