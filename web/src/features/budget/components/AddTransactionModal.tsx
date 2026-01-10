import { useState, type FormEvent } from 'react';
import { useCreateTransaction } from '../api/budget';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
    envelopeId: string;
    envelopeName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AddTransactionModal({ envelopeId, envelopeName, isOpen, onClose }: AddTransactionModalProps) {
    const createTransaction = useCreateTransaction();
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await createTransaction.mutateAsync({
            envelopeId,
            description: formData.description,
            amount: Number(formData.amount),
            date: new Date(formData.date).toISOString(),
        });
        setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Add Transaction</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-muted-foreground">
                    Adding to envelope: <span className="font-semibold text-foreground">{envelopeName}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                            autoFocus
                            className="w-full p-2 rounded-md border bg-input"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g. Grocery Store"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount (SAR)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-2 rounded-md border bg-input"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full p-2 rounded-md border bg-input"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                            disabled={createTransaction.isPending}
                        >
                            {createTransaction.isPending ? 'Adding...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
