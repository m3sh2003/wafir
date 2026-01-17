import { useTransactions, type Transaction, useDeleteTransaction, useUpdateTransaction } from '../api/budget';

import { Loader2, Trash2, Edit2, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

// import { format } from 'date-fns';
import { useSettings } from '../../../contexts/SettingsContext';

interface TransactionListProps {
    envelopeId: string;
}

export function TransactionList({ envelopeId }: TransactionListProps) {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const { data: transactions, isLoading } = useTransactions(envelopeId);
    const deleteTransaction = useDeleteTransaction();
    const updateTransaction = useUpdateTransaction();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ description: '', amount: '', currency: 'SAR' });

    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

    const handleDelete = async (id: string) => {
        if (confirm(t('confirm_delete') || 'Are you sure?')) {
            await deleteTransaction.mutateAsync(id);
        }
    };

    const startEdit = (t: Transaction) => {
        setEditingId(t.id);
        setEditForm({ description: t.description, amount: String(t.amount), currency: (t as any).currency || 'SAR' });
    };

    const handleUpdate = async (id: string) => {
        await updateTransaction.mutateAsync({
            id,
            dto: {
                description: editForm.description,
                amount: Number(editForm.amount),
                currency: editForm.currency,
                envelopeId // keeping same envelope for now
            }
        });
        setEditingId(null);
    };

    return (
        <div className="space-y-2">
            {!transactions?.length && <p className="text-center text-muted-foreground py-4 text-sm">{t('no_transactions')}</p>}

            {transactions?.map(trx => (
                <div key={trx.id} className="flex justify-between items-center p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group">
                    {editingId === trx.id ? (
                        <div className="flex-1 flex gap-2 items-center flex-wrap">
                            <input
                                className="border rounded p-1 text-sm flex-grow"
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <input
                                className="border rounded p-1 text-sm w-24"
                                type="number"
                                value={editForm.amount}
                                onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                            />
                            <select
                                className="border rounded p-1 text-sm w-20"
                                value={editForm.currency}
                                onChange={e => setEditForm({ ...editForm, currency: e.target.value })}
                            >
                                <option value="SAR">SAR</option>
                                <option value="USD">USD</option>
                                <option value="EGP">EGP</option>
                            </select>
                            <button onClick={() => handleUpdate(trx.id)} className="text-green-600 hover:bg-green-100 p-1.5 rounded"><Check size={16} /></button>
                            <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-100 p-1.5 rounded"><X size={16} /></button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="font-medium text-sm">{trx.description}</p>
                                <p className="text-xs text-muted-foreground">{new Date(trx.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold dir-ltr ${trx.type === 'INCOME' ? 'text-green-600' : ''}`}>
                                    {trx.type === 'EXPENSE' ? '-' : '+'}{formatPrice(Number(trx.amount))}
                                </span>
                                <div className="flex gap-1">
                                    <button onClick={() => startEdit(trx)} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors" title={t('edit')}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(trx.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors" title={t('delete')}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
