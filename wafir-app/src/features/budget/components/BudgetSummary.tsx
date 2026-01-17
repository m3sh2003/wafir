import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnvelopes, useAllTransactions } from '../api/budget';
import { useSettings } from '../../../contexts/SettingsContext';
import { PenBox, PlusCircle } from 'lucide-react';
import { EditIncomeModal } from './EditIncomeModal';
import { AddIncomeModal } from './AddIncomeModal';

export function BudgetSummary() {
    const { t } = useTranslation();
    const { profile, currency } = useSettings();
    const { data: envelopes } = useEnvelopes();
    const { data: allTransactions } = useAllTransactions();

    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);

    // Currency Settings
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

        // Then convert to Target
        const rate = rates[displayCurrency] || 1;
        return inSAR * rate;
    };

    // Calculate total income
    const incomeTransactions = Array.isArray(allTransactions) ? allTransactions.filter(t => t.type === 'INCOME') : [];

    // Convert each transaction to Target Currency
    const totalIncomeExtra = incomeTransactions.reduce((sum, t) => {
        return sum + convert(Number(t.amount), t.currency || 'SAR');
    }, 0);

    // Base Income (Assumed SAR)
    const baseIncome = convert(Number(profile.monthlyIncome || 0), 'SAR'); // Assuming stored monthlyIncome is SAR based
    const totalIncome = baseIncome + totalIncomeExtra;

    // Budget Calculations (Envelopes are in SAR)
    const totalBudget = envelopes?.reduce((sum, env) => sum + convert(Number(env.limitAmount), 'SAR'), 0) || 0;
    const totalSpent = envelopes?.reduce((sum, env) => sum + convert((env.spent || 0), 'SAR'), 0) || 0;

    const remainingAfterExpenses = totalIncome - totalSpent;
    const remainingBudgetBalance = totalIncome - totalBudget;

    return (
        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('budget_summary') || 'ملخص الميزانية'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg relative group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm block">{t('total_income')}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setIsIncomeModalOpen(true)} title="Edit Base Salary" className="p-1 hover:bg-blue-200 rounded">
                                <PenBox size={14} className="opacity-50 hover:opacity-100" />
                            </button>
                            <button onClick={() => setIsAddIncomeModalOpen(true)} title="Add Extra Income" className="p-1 hover:bg-blue-200 rounded">
                                <PlusCircle size={14} className="opacity-50 hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                    <span className="text-2xl font-bold">
                        {totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} {displayCurrency}
                    </span>
                    {totalIncomeExtra > 0 && (
                        <span className="text-xs block mt-1 opacity-75">
                            Base: {baseIncome.toLocaleString()} + Extra: {totalIncomeExtra.toLocaleString()}
                        </span>
                    )}
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground block mb-1">{t('total_budget') || 'إجمالي الميزانية'}</span>
                    <span className="text-2xl font-bold">
                        {totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} {displayCurrency}
                    </span>
                </div>
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    <span className="text-sm block mb-1">{t('total_spent') || 'إجمالي المصروفات'}</span>
                    <span className="text-2xl font-bold">
                        {totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })} {displayCurrency}
                    </span>
                </div>
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                    <span className="text-sm block mb-1">{t('remaining_after_expenses')}</span>
                    <span className="text-2xl font-bold">
                        {remainingAfterExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })} {displayCurrency}
                    </span>
                    <span className="text-xs block mt-1 opacity-75">
                        {t('remaining_budget_balance')}: {remainingBudgetBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} {displayCurrency}
                    </span>
                </div>
            </div>

            <EditIncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
            <AddIncomeModal isOpen={isAddIncomeModalOpen} onClose={() => setIsAddIncomeModalOpen(false)} />
        </div>
    );
}
