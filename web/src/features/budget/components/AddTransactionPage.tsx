import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEnvelopes, useCreateTransaction, type Envelope } from '../api/budget';
import { useSettings } from '../../../contexts/SettingsContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export function AddTransactionPage() {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const navigate = useNavigate();
    const { data: envelopes, isLoading } = useEnvelopes();
    const createTransaction = useCreateTransaction();

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        envelopeId: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTransaction.mutateAsync({
                description: formData.description,
                amount: Number(formData.amount),
                envelopeId: formData.envelopeId,
                date: new Date(formData.date).toISOString()
            });
            navigate('/budget');
        } catch (error) {
            console.error('Failed to add transaction', error);
            alert(t('failed_add_transaction'));
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-md mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
                <ArrowLeft size={16} /> {t('back')}
            </button>

            <div>
                <h1 className="text-2xl font-bold">{t('register_new_expense')}</h1>
                <p className="text-muted-foreground">{t('track_spending_desc')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <label className="block text-sm font-medium mb-1">{t('description')}</label>
                    <input
                        autoFocus
                        required
                        className="w-full p-2 rounded-md border bg-input"
                        placeholder={t('weekly_groceries_placeholder')}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">{t('value_units')}</label>
                    <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full p-2 rounded-md border bg-input"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">{t('envelope_category')}</label>
                    <select
                        required
                        className="w-full p-2 rounded-md border bg-input"
                        value={formData.envelopeId}
                        onChange={e => setFormData({ ...formData, envelopeId: e.target.value })}
                    >
                        <option value="">{t('select_envelope')}</option>
                        {envelopes?.map((env: Envelope) => (
                            <option key={env.id} value={env.id}>
                                {env.name} ({t('remaining')}: {formatPrice(Number(env.limitAmount) - (env.spent || 0))})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">{t('date')}</label>
                    <input
                        type="date"
                        required
                        className="w-full p-2 rounded-md border bg-input"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={createTransaction.isPending}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                        {createTransaction.isPending ? t('saving') : t('save_transaction')}
                    </button>
                </div>
            </form>
        </div>
    );

}
