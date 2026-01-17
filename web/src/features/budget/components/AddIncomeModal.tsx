import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useCreateTransaction } from '../api/budget';
import { useSettings } from '../../../contexts/SettingsContext';

interface AddIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
    const { t } = useTranslation();
    const createTransaction = useCreateTransaction();
    const { currency } = useSettings();
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createTransaction.mutateAsync({
                amount: Number(amount),
                description,
                type: 'INCOME',
                currency: selectedCurrency,
                // Explicitly undefined envelopeId for global income
                envelopeId: undefined as any
            });
            onClose();
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error('Failed to add income', error);
            alert('Failed to add income transaction');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-background p-6 rounded-lg w-full max-w-sm space-y-4 shadow-xl border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('add_income') || 'إضافة دخل إضافي'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('description')}</label>
                        <input
                            type="text"
                            className="w-full p-2 rounded-md border bg-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Bonus, Freelance"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">{t('amount')}</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="flex-1 p-2 rounded-md border bg-input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
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
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            {isLoading ? t('saving') : t('add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
