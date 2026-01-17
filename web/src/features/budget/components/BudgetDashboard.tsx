import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnvelopes, useCreateEnvelope } from '../api/budget';
import { Plus, Wallet, X } from 'lucide-react';
import { AddTransactionModal } from './AddTransactionModal';

import { TransactionList } from './TransactionList';
import { CategoryManager } from './CategoryManager';
import { BudgetSummary } from './BudgetSummary';


import { useSettings } from '../../../contexts/SettingsContext';

export function BudgetDashboard() {
    const { data: envelopes, isLoading, error } = useEnvelopes();
    const createEnvelope = useCreateEnvelope();
    const { t } = useTranslation();
    const { formatPrice } = useSettings();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newEnvelope, setNewEnvelope] = useState({ name: '', limitAmount: 0 });

    const [transactionModalState, setTransactionModalState] = useState<{ isOpen: boolean; envelopeId: string; envelopeName: string } | null>(null);

    if (isLoading) return <div>Loading budget...</div>;
    if (isLoading) return <div>Loading budget...</div>;
    if (error) {
        console.error("Budget Loading Error:", error);
        return <div>Error loading budget. Details: {error.message}</div>;
    }

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        await createEnvelope.mutateAsync({
            name: newEnvelope.name,
            limitAmount: Number(newEnvelope.limitAmount),
            period: 'Monthly'
        });
        setIsCreateModalOpen(false);
        setNewEnvelope({ name: '', limitAmount: 0 });
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-primary">{t('budget')}</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-sm border border-input bg-background hover:bg-muted text-foreground px-4 py-2 rounded-md transition-colors"
                    >
                        {t('envelope_category')}
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        {t('create')} Envelope
                    </button>
                </div>
            </div>

            {/* Budget Summary Section */}
            <BudgetSummary />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {envelopes?.map((env) => (
                    <div key={env.id} className="bg-card text-card-foreground rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-xl flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-muted-foreground" />
                                        {t(env.name)}
                                    </h3>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">{env.period}</span>
                                </div>
                                <button
                                    onClick={() => setTransactionModalState({ isOpen: true, envelopeId: env.id, envelopeName: t(env.name) })}
                                    className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-full transition-colors font-medium"
                                >
                                    + {t('add_transaction')}
                                </button>
                            </div>

                            <div className="space-y-1">
                                <div className="text-2xl font-bold">
                                    <span className="text-sm font-normal text-muted-foreground mr-1">Limit:</span>
                                    {formatPrice(Number(env.limitAmount))}
                                </div>
                                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${(env.spent || 0) > Number(env.limitAmount) ? 'bg-red-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(((env.spent || 0) / Number(env.limitAmount)) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{formatPrice(Number(env.spent || 0))} {t('spent')}</span>
                                    <span>{Math.round(((env.spent || 0) / Number(env.limitAmount)) * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/10 p-4 border-t mt-auto">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Recent Transactions</h4>
                            <TransactionList envelopeId={env.id} />
                        </div>
                    </div>
                ))}
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{t('create')} Envelope</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('name')}</label>
                                <input
                                    autoFocus
                                    className="w-full p-2 rounded-md border bg-input"
                                    value={newEnvelope.name}
                                    onChange={e => setNewEnvelope({ ...newEnvelope, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Limit (SAR)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-md border bg-input"
                                    value={newEnvelope.limitAmount}
                                    onChange={e => setNewEnvelope({ ...newEnvelope, limitAmount: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-md hover:bg-muted"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                                >
                                    {t('create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {transactionModalState && (
                <AddTransactionModal
                    isOpen={transactionModalState.isOpen}
                    envelopeId={transactionModalState.envelopeId}
                    envelopeName={transactionModalState.envelopeName}
                    onClose={() => setTransactionModalState(null)}
                />
            )}

            {isCategoryModalOpen && <CategoryManager onClose={() => setIsCategoryModalOpen(false)} />}
        </div>
    );
}
