// import React from 'react'; // React not needed with new transform
import { useTransactions } from '../api/budget';
import { format } from 'date-fns';

interface TransactionListProps {
    envelopeId: string;
}

export function TransactionList({ envelopeId }: TransactionListProps) {
    const { data: transactions, isLoading } = useTransactions(envelopeId);

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading transactions...</div>;
    if (!transactions?.length) return <div className="p-4 text-sm text-muted-foreground text-center">No transactions yet</div>;

    return (
        <div className="border-t">
            <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className="text-left font-medium p-2">Date</th>
                            <th className="text-left font-medium p-2">Description</th>
                            <th className="text-right font-medium p-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id} className="border-t last:border-0 hover:bg-muted/30">
                                <td className="p-2 text-muted-foreground">{format(new Date(tx.date), 'MMM d')}</td>
                                <td className="p-2">{tx.description}</td>
                                <td className="p-2 text-right font-medium">-{Number(tx.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
