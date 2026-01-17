import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { updateOnboarding, RiskProfile } from '../../users/api/users';
import { useSettings } from '../../../contexts/SettingsContext';

interface EditIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditIncomeModal({ isOpen, onClose }: EditIncomeModalProps) {
    const { t } = useTranslation();
    const { profile, setProfile, currency, setCurrency } = useSettings();
    const [income, setIncome] = useState(profile.monthlyIncome || 0);
    const [selectedCurrency, setSelectedCurrency] = useState<'SAR' | 'USD' | 'EGP'>(currency);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Map string to Enum if needed, though DTO uses string values of Enum
            // RiskProfile enum values are 'Capital Preservation', 'Conservative', 'Balanced', 'Growth', 'Aggressive' ?
            // Let's check the DTO import. It imports RiskProfile from API.
            // DTO says enum: RiskProfile.
            // User profile might have lowercase 'balanced'.
            // Simple fix: Title case or valid mapping.
            const validRiskProfile = Object.values(RiskProfile).includes(profile.riskTolerance as any)
                ? profile.riskTolerance
                : RiskProfile.BALANCED;

            await updateOnboarding({
                monthlyIncome: Number(income),
                riskProfile: validRiskProfile as any,
                budgetLimits: {}
            });

            // Update local context
            setProfile({ ...profile, monthlyIncome: Number(income) });
            setCurrency(selectedCurrency); // Update global currency setting
            onClose();
        } catch (error) {
            console.error('Failed to update income', error);
            alert('Failed to update income');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-background p-6 rounded-lg w-full max-w-sm space-y-4 shadow-xl border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('update_income') || 'تحديث الدخل'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">{t('total_income')}</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="flex-1 p-2 rounded-md border bg-input"
                                value={income}
                                onChange={(e) => setIncome(Number(e.target.value))}
                                autoFocus
                            />
                            <select
                                className="p-2 rounded-md border bg-input w-24"
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                            >
                                <option value="SAR">SAR</option>
                                <option value="USD">USD</option>
                                <option value="EGP">EGP</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md hover:bg-muted"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
                        >
                            {isLoading ? t('saving') : t('save_settings')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
