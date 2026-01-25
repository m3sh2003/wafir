
'use client'

import React, { useState, type FormEvent } from 'react';
import { Calculator, Coins, Database, PenTool, Loader2 } from 'lucide-react';
import DashboardNavbar from '@/components/DashboardNavbar';

interface ZakatResult {
    total_assets_sar?: number;
    total_assets_usd?: string;
    zakat_due_usd: number;
    zakat_due_sar?: string;
    currency: string;
    calculation_basis?: string;
    nisab_status?: string;
    is_above_nisab?: boolean;
    message?: string;
    breakdown?: {
        cash_sar: number;
        investments_sar: number;
        details: any[];
    }
}

export default function ZakatCalculatorPage() {
    const t = (key: string) => {
        const trans: Record<string, string> = {
            zakat_calculator: 'حاسبة الزكاة',
            system_assets: 'أصول النظام',
            manual_input: 'إدخال يدوي',
            automatic_calculation: 'الحساب التلقائي',
            automatic_calculation_desc: 'سوف نقوم بفحص حساباتك واستثماراتك المتصلة لحساب زكاتك.',
            automatic_calculation_note: 'ملاحظة: يتم استبعاد المنزل الرئيسي والأصول غير الخاضعة للزكاة تلقائيًا.',
            calculate_my_zakat: 'احسب زكاتي',
            scanning_assets: 'جاري فحص الأصول...',
            manual_entry: 'إدخال يدوي',
            total_net_assets_usd: 'إجمالي صافي الأصول (ريال)',
            current_nisab_usd: 'النصاب الحالي (ريال للفضة)',
            nisab_note: 'الحد الأدنى من الثروة التي يجب أن يمتلكها المسلم قبل أن تجب عليه الزكاة.',
            calculating: 'جاري الحساب...',
            calculate_zakat: 'حساب الزكاة',
            select_mode_msg: 'اختر طريقة الحساب للبدء.',
            above_nisab: 'فوق النصاب',
            below_nisab: 'دون النصاب',
            zakat_due: 'الزكاة المستحقة',
            no_zakat_due: 'لا تجب الزكاة',
            breakdown: 'تفاصيل الحساب',
            cash_and_bank: 'النقد والبنوك',
            investments: 'الاستثمارات',
            total_assets: 'إجمالي الأصول الزكوية',
            failed_calculate_zakat: 'فشل حساب الزكاة. يرجى المحاولة مرة أخرى.'
        };
        return trans[key] || key;
    };

    // Adjusted defaults for SAR
    const [valuation, setValuation] = useState(100000);
    const [nisab, setNisab] = useState(2500); // Silver nisab approx in SAR
    const [result, setResult] = useState<ZakatResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'system' | 'manual'>('system');

    const handleCalculate = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            let res;
            if (mode === 'manual') {
                res = await fetch('/api/zakat/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        portfolio_valuation_usd: valuation / 3.75, // Convert rough SAR input to USD for backend if needed, or backend handles it
                        nisab_usd: nisab / 3.75
                    })
                });
            } else {
                res = await fetch('/api/zakat/calculate/system');
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Error ${res.status}`);
            }

            const data = await res.json();
            setResult(data);

        } catch (err: any) {
            console.error(err);
            alert(t('failed_calculate_zakat') + ' (' + err.message + ')');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (amount: number | string | undefined) => {
        if (amount === undefined) return '0 SAR';
        return Number(amount).toLocaleString(undefined, { style: 'currency', currency: 'SAR' });
    }

    return (
        <div className="bg-background min-h-screen">
            <DashboardNavbar />
            <div className="p-6 space-y-8 animate-in fade-in container mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
                        <Calculator className="w-8 h-8" />
                        {t('zakat_calculator')}
                    </h1>
                    <div className="flex bg-muted p-1 rounded-lg border border-border">
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
                            <div className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-4">
                                <h2 className="text-xl font-semibold text-foreground">{t('automatic_calculation')}</h2>
                                <p className="text-muted-foreground">
                                    {t('automatic_calculation_desc')}
                                </p>
                                <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-sm text-primary">
                                    {t('automatic_calculation_note')}
                                </div>
                                <button
                                    onClick={() => handleCalculate()}
                                    disabled={loading}
                                    className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                    {loading ? t('scanning_assets') : t('calculate_my_zakat')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCalculate} className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-4">
                                <h2 className="text-xl font-semibold mb-4 text-foreground">{t('manual_entry')}</h2>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-foreground">{t('total_net_assets_usd')}</label>
                                    <div className="relative">
                                        <Coins className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                                        <input
                                            type="number"
                                            value={valuation}
                                            onChange={(e) => setValuation(Number(e.target.value))}
                                            className="w-full pr-9 p-2 rounded-md border border-input bg-background text-foreground"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-foreground">{t('current_nisab_usd')}</label>
                                    <div className="relative">
                                        <Coins className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                                        <input
                                            type="number"
                                            value={nisab}
                                            onChange={(e) => setNisab(Number(e.target.value))}
                                            className="w-full pr-9 p-2 rounded-md border border-input bg-background text-foreground"
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
                                    className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                    {loading ? t('calculating') : t('calculate_zakat')}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col justify-center items-center text-center min-h-[300px]">
                        {!result && (
                            <div className="text-muted-foreground">
                                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>{t('select_mode_msg')}</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4">
                                <div className={`text-lg font-medium inline-block px-3 py-1 rounded-full ${result.zakat_due_usd > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {result.nisab_status || (result.is_above_nisab ? t('above_nisab') : t('below_nisab'))}
                                </div>

                                {(result.zakat_due_usd > 0) ? (
                                    <div className="space-y-2">
                                        <div className="text-5xl font-bold text-foreground track-tight dir-ltr">
                                            {formatPrice(result.zakat_due_sar)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('zakat_due')}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xl text-muted-foreground">
                                        {result.message || t('no_zakat_due')}
                                    </p>
                                )}

                                {result.breakdown && (
                                    <div className="mt-6 text-right w-full border-t border-border pt-4">
                                        <h4 className="font-semibold mb-2 text-foreground">{t('breakdown')}</h4>
                                        <div className="space-y-2 text-sm text-foreground">
                                            <div className="flex justify-between">
                                                <span>{t('cash_and_bank')}</span>
                                                <span className="dir-ltr">{formatPrice(result.breakdown.cash_sar)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{t('investments')}</span>
                                                <span className="dir-ltr">{formatPrice(result.breakdown.investments_sar)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t border-border">
                                                <span>{t('total_assets')}</span>
                                                <span className="dir-ltr">{formatPrice(result.total_assets_sar)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
