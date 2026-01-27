import { useState, type FormEvent } from 'react';
import { useAccounts, useCreateAccount, useAddHolding, useDeleteAccount, useDeleteHolding, type Account, type Holding } from '../api/assets';
import { Plus, Building2, Wallet, Landmark, Home, Loader2, X, Coins, Trash2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../contexts/SettingsContext';

export function AssetsDashboard() {
    const { t } = useTranslation();
    const { formatPrice } = useSettings();
    const { data: accounts, isLoading } = useAccounts();
    const createAccount = useCreateAccount();
    const addHolding = useAddHolding();
    const deleteAccount = useDeleteAccount();
    const deleteHolding = useDeleteHolding();

    // Modals
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [selectedAccountForHolding, setSelectedAccountForHolding] = useState<Account | null>(null);

    // Forms
    const [newAccount, setNewAccount] = useState({ name: '', type: 'bank', currencyCode: 'SAR' });
    const [newHolding, setNewHolding] = useState({ instrumentCode: '', units: 0, isShariaCompliant: true, isPrimaryHome: false });

    if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-primary" /></div>;

    const handleCreateAccount = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await createAccount.mutateAsync(newAccount);
            setIsAccountModalOpen(false);
            setNewAccount({ name: '', type: 'bank', currencyCode: 'SAR' });
        } catch (err: any) {
            alert(`Failed to create account: ${err.message || err}`);
        }
    };

    const handleAddHolding = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAccountForHolding) return;
        try {
            await addHolding.mutateAsync({
                accountId: selectedAccountForHolding.id,
                dto: newHolding
            });
            setSelectedAccountForHolding(null); // Close modal
            setNewHolding({ instrumentCode: '', units: 0, isShariaCompliant: true, isPrimaryHome: false });
        } catch (err: any) {
            alert(`Failed to add holding: ${err.message || err}`);
        }
    };

    const handleDeleteAccount = async (id: number) => {
        if (confirm(t('confirm_delete_account') || 'Delete this account?')) {
            await deleteAccount.mutateAsync(id);
        }
    };

    const handleDeleteHolding = async (id: number) => {
        if (confirm(t('confirm_delete_holding') || 'Delete this asset?')) {
            await deleteHolding.mutateAsync(id);
        }
    };

    // Helper to calculate account total
    const getAccountTotal = (h: Holding[] = []) => h.reduce((sum, item) => sum + Number(item.units), 0);

    // Normalize to SAR for global total
    const getNormalizedAccountTotal = (acc: Account) => {
        const total = getAccountTotal(acc.holdings);
        // Fixed Rates (TODO: Sync with Settings/Backend)
        const RATE_USD = 3.75;
        const RATE_EGP = 0.08; // 1 EGP = 0.08 SAR (1/12.5)

        if (acc.currencyCode === 'USD') return total * RATE_USD;
        if (acc.currencyCode === 'EGP') return total * RATE_EGP;
        return total;
    };

    const totalNetWorth = accounts?.reduce((sum, acc) => sum + getNormalizedAccountTotal(acc), 0) || 0;

    const getIcon = (type: string) => {
        if (type === 'bank') return <Landmark className="w-5 h-5" />;
        if (type === 'broker' || type === 'stock' || type === 'equity_fund') return <Building2 className="w-5 h-5" />;
        if (type === 'real_estate' || type === 'rental_property') return <Home className="w-5 h-5" />;
        if (type === 'gold') return <Coins className="w-5 h-5 text-yellow-600" />;
        return <Wallet className="w-5 h-5" />;
    };



    return (
        <div className="p-6 space-y-8 animate-in fade-in">
            {/* Header & Net Worth */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary mb-1">{t('assets')}</h1>
                    <p className="text-muted-foreground">{t('manage_real_world_assets')}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('total_net_worth')}</p>
                    <p className="text-3xl font-bold flex items-center justify-end gap-1 dir-ltr">
                        {formatPrice(totalNetWorth)}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsAccountModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    {t('add_new_account')}
                </button>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {accounts?.map((acc) => (
                    <div key={acc.id} className="bg-card text-card-foreground rounded-lg border shadow-sm flex flex-col hover:border-primary/50 transition-colors group/card">
                        {/* Card Header */}
                        <div className="p-6 pb-3 flex justify-between items-start border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    {getIcon(acc.type)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{acc.name}</h3>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">{t(acc.type)}</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <p className="font-bold text-xl dir-ltr">
                                    {Number(getAccountTotal(acc.holdings)).toLocaleString()}
                                    <span className="text-xs font-normal text-muted-foreground"> {acc.currencyCode}</span>
                                </p>
                                {acc.currencyCode !== 'SAR' && (
                                    <p className="text-xs text-emerald-600">
                                        ≈ {formatPrice(getNormalizedAccountTotal(acc))}
                                    </p>
                                )}
                                <button
                                    onClick={() => handleDeleteAccount(acc.id)}
                                    className="text-destructive/70 hover:text-destructive transition-colors p-1"
                                    title={t('delete_account')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Holdings List */}
                        < div className="p-6 pt-4 flex-1 space-y-3" >
                            {
                                acc.holdings && acc.holdings.length > 0 ? (
                                    acc.holdings.map(h => (
                                        <div key={h.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50 transition-colors group/holding">
                                            <div className="flex items-center gap-2">
                                                <Coins className="w-4 h-4 text-muted-foreground" />
                                                <span>{h.instrumentCode}</span>
                                                {h.isPrimaryHome && <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">Home</span>}
                                                {!h.isShariaCompliant && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Not Compliant</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-mono">
                                                        {acc.type === 'gold'
                                                            ? `${Number(h.units).toLocaleString()}g`
                                                            : Number(h.units).toLocaleString()}
                                                    </span>
                                                    {acc.type === 'gold' && (acc as any).isGoldLivePrice && (
                                                        <span className="text-[10px] text-yellow-600">
                                                            ≈ {formatPrice(Number(h.units) * 300)} {/* Mock Price 300 SAR/g */}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteHolding(h.id)}
                                                    className="text-red-400 hover:text-red-600 transition-opacity p-1"
                                                    title={t('delete_asset')}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">{t('no_holdings')}</p>
                                )
                            }
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-muted/20 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedAccountForHolding(acc)}
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                <Plus size={14} /> {t('add_asset')}
                            </button>
                        </div>
                    </div>
                ))
                }
            </div >

            {/* Create Account Modal */}
            {
                isAccountModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">{t('add_new_account')}</h2>
                                <button onClick={() => setIsAccountModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateAccount} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('account_name')}</label>
                                    <input
                                        autoFocus
                                        className="w-full p-2 rounded-md border bg-input"
                                        placeholder="e.g. Al Rajhi Main"
                                        value={newAccount.name}
                                        onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('type')}</label>
                                        <select
                                            className="w-full p-2 rounded-md border bg-input"
                                            value={newAccount.type}
                                            onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}
                                        >
                                            <option value="bank">{t('bank')}</option>
                                            <option value="cash">{t('Cash')}</option>
                                            <option value="gold">{t('Gold')}</option>
                                            <option value="stock">{t('Stock')}</option>
                                            <option value="equity_fund">{t('Equity Fund')}</option>
                                            <option value="real_estate_fund">{t('Real Estate Fund')}</option>
                                            <option value="real_estate">{t('Real Estate')}</option>
                                            <option value="rental_property">{t('Rental Property')}</option>
                                            <option value="broker">{t('broker')}</option>
                                            <option value="certificate">{t('Certificate')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('currency')}</label>
                                        <select
                                            className="w-full p-2 rounded-md border bg-input"
                                            value={newAccount.currencyCode}
                                            onChange={e => setNewAccount({ ...newAccount, currencyCode: e.target.value })}
                                        >
                                            <option value="SAR">SAR</option>
                                            <option value="USD">USD</option>
                                            <option value="EGP">EGP</option>
                                        </select>
                                    </div>
                                </div>

                                {newAccount.type === 'gold' && (
                                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                        <label className="flex items-center gap-2 cursor-pointer text-yellow-800">
                                            <input
                                                type="checkbox"
                                                checked={(newAccount as any).isGoldLivePrice}
                                                onChange={e => setNewAccount({ ...newAccount, isGoldLivePrice: e.target.checked } as any)}
                                                className="rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm font-medium">{t('use_live_gold_price')} (Auto-update)</span>
                                        </label>
                                        <p className="text-xs text-yellow-600 mt-1 pl-6">
                                            {t('if_checked_units_are_grams')}
                                        </p>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 rounded-md hover:bg-muted">{t('cancel')}</button>
                                    <button type="submit" disabled={createAccount.isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                                        {createAccount.isPending ? t('processing') : t('create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Add Holding Modal */}
            {
                selectedAccountForHolding && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Plus size={20} className="text-primary" />
                                    {t('add_holding_to')} {selectedAccountForHolding.name}
                                </h2>
                                <button onClick={() => setSelectedAccountForHolding(null)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddHolding} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('asset_name_code')}</label>
                                    <input
                                        autoFocus
                                        className="w-full p-2 rounded-md border bg-input"
                                        placeholder="e.g. CASH, SUKUK1, APARTMENT-A"
                                        value={newHolding.instrumentCode}
                                        onChange={e => setNewHolding({ ...newHolding, instrumentCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {selectedAccountForHolding.type === 'gold' ? t('weight_grams') : t('value_units')}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-2 rounded-md border bg-input"
                                        placeholder={selectedAccountForHolding.type === 'gold' ? "e.g. 50" : "0.00"}
                                        value={newHolding.units}
                                        onChange={e => setNewHolding({ ...newHolding, units: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newHolding.isPrimaryHome}
                                            onChange={e => setNewHolding({ ...newHolding, isPrimaryHome: e.target.checked })}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{t('is_primary_home')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newHolding.isShariaCompliant}
                                            onChange={e => setNewHolding({ ...newHolding, isShariaCompliant: e.target.checked })}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{t('is_sharia_compliant')}</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setSelectedAccountForHolding(null)} className="px-4 py-2 rounded-md hover:bg-muted">{t('cancel')}</button>
                                    <button type="submit" disabled={addHolding.isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                                        {addHolding.isPending ? t('adding') : t('add_asset')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
