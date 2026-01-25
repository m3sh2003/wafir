
'use client'

import { useState, type FormEvent } from 'react';
import { Plus, Building2, Wallet, Landmark, Home, Loader2, X, Coins, Trash2 } from 'lucide-react';
import DashboardNavbar from '@/components/DashboardNavbar';

// Mock Interfaces
interface Holding {
    id: number;
    instrument_code: string;
    units: number;
    is_sharia_compliant: boolean;
    is_primary_home: boolean;
}

interface Account {
    id: number;
    name: string;
    type: string;
    currency_code: string;
    holdings: Holding[];
}

export default function DashboardPage() {
    const formatPrice = (p: number, currency: string = 'SAR') => `${p.toLocaleString()} ${currency}`;
    const usdRate = 3.75;
    const egpRate = 50.0;

    // Mock State for accounts
    const [accounts, setAccounts] = useState<Account[]>([
        {
            id: 1,
            name: 'الراجحي - توفير',
            type: 'bank',
            currency_code: 'SAR',
            holdings: [
                { id: 101, instrument_code: 'CASH', units: 50000, is_sharia_compliant: true, is_primary_home: false }
            ]
        }
    ]);
    const isLoading = false;

    // Modals
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [selectedAccountForHolding, setSelectedAccountForHolding] = useState<Account | null>(null);

    // Forms
    const [newAccount, setNewAccount] = useState({ name: '', type: 'bank', currency_code: 'SAR' });
    const [newHolding, setNewHolding] = useState({ instrument_code: '', units: 0, is_sharia_compliant: true, is_primary_home: false });

    if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-primary" /></div>;

    const handleCreateAccount = async (e: FormEvent) => {
        e.preventDefault();
        const newId = Math.random();
        setAccounts([...accounts, { ...newAccount, id: newId, holdings: [] }]);
        setIsAccountModalOpen(false);
        setNewAccount({ name: '', type: 'bank', currency_code: 'SAR' });
    };

    const handleAddHolding = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAccountForHolding) return;

        const updatedAccounts = accounts.map(acc => {
            if (acc.id === selectedAccountForHolding.id) {
                return {
                    ...acc,
                    holdings: [...acc.holdings, { ...newHolding, id: Math.random() }]
                }
            }
            return acc;
        });
        setAccounts(updatedAccounts);
        setSelectedAccountForHolding(null);
        setNewHolding({ instrument_code: '', units: 0, is_sharia_compliant: true, is_primary_home: false });
    };

    const handleDeleteAccount = async (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
            setAccounts(accounts.filter(a => a.id !== id));
        }
    };

    const handleDeleteHolding = async (accId: number, holdingId: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الأصل؟')) {
            const updatedAccounts = accounts.map(acc => {
                if (acc.id === accId) {
                    return {
                        ...acc,
                        holdings: acc.holdings.filter(h => h.id !== holdingId)
                    }
                }
                return acc;
            });
            setAccounts(updatedAccounts);
        }
    };

    const getAccountTotal = (h: Holding[] = []) => h.reduce((sum, item) => sum + Number(item.units), 0);

    const getNormalizedAccountTotal = (acc: Account) => {
        const total = getAccountTotal(acc.holdings);
        if (acc.currency_code === 'USD') return total * usdRate;
        if (acc.currency_code === 'EGP') return total / egpRate;
        return total;
    };

    const totalNetWorth = accounts?.reduce((sum, acc) => sum + getNormalizedAccountTotal(acc), 0) || 0;

    const getIcon = (type: string) => {
        if (type === 'bank') return <Landmark className="w-5 h-5" />;
        if (type === 'broker') return <Building2 className="w-5 h-5" />;
        if (type === 'real_estate') return <Home className="w-5 h-5" />;
        return <Wallet className="w-5 h-5" />;
    };

    const translateType = (type: string) => {
        const types: any = { 'bank': 'بنك', 'broker': 'محفظة', 'cash': 'نقد', 'real_estate': 'عقار' };
        return types[type] || type;
    }

    return (
        <div className="bg-background min-h-screen">
            <DashboardNavbar />
            <div className="p-6 space-y-8 animate-in fade-in container mx-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">لوحة التحكم</h1>
                        <p className="text-muted-foreground">إدارة أصولك المالية</p>
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-muted-foreground">إجمالي الأصول</p>
                        <p className="text-3xl font-bold flex items-center justify-end gap-1 dir-ltr text-foreground">
                            {formatPrice(totalNetWorth)}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => setIsAccountModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        إضافة حساب جديد
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {accounts?.map((acc) => (
                        <div key={acc.id} className="bg-card text-card-foreground border border-border rounded-lg shadow-sm flex flex-col hover:border-primary/50 transition-colors group/card">
                            <div className="p-6 pb-3 flex justify-between items-start border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        {getIcon(acc.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{acc.name}</h3>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">{translateType(acc.type)}</span>
                                    </div>
                                </div>
                                <div className="text-left flex flex-col items-end gap-1">
                                    <p className="font-bold text-xl dir-ltr">{Number(getAccountTotal(acc.holdings)).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{acc.currency_code}</span></p>
                                    <button
                                        onClick={() => handleDeleteAccount(acc.id)}
                                        className="text-destructive/70 hover:text-destructive transition-colors p-1"
                                        title="حذف الحساب"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 pt-4 flex-1 space-y-3">
                                {acc.holdings && acc.holdings.length > 0 ? (
                                    acc.holdings.map(h => (
                                        <div key={h.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50 transition-colors group/holding">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <Coins className="w-4 h-4 text-muted-foreground" />
                                                <span>{h.instrument_code}</span>
                                                {h.is_primary_home && <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">منزل رئيسي</span>}
                                                {!h.is_sharia_compliant && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">غير متوافق</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono">{Number(h.units).toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleDeleteHolding(acc.id, h.id)}
                                                    className="text-red-400 hover:text-red-600 transition-opacity p-1"
                                                    title="حذف الأصل"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">لا توجد أصول</p>
                                )}
                            </div>

                            <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
                                <button
                                    onClick={() => setSelectedAccountForHolding(acc)}
                                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> إضافة أصل
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modals omitted for brevity, logic exists in Artifact */}
                {/* Create Account Modal */}
                {isAccountModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border border-border">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">إضافة حساب جديد</h2>
                                <button onClick={() => setIsAccountModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateAccount} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">اسم الحساب</label>
                                    <input
                                        autoFocus
                                        className="w-full p-2 rounded-md border border-input bg-background"
                                        placeholder="مثال: محفظة الأسهم"
                                        value={newAccount.name}
                                        onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">النوع</label>
                                        <select
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            value={newAccount.type}
                                            onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}
                                        >
                                            <option value="bank">بنك</option>
                                            <option value="broker">محفظة استثمارية</option>
                                            <option value="cash">نقد / كاش</option>
                                            <option value="real_estate">عقار</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">العملة</label>
                                        <select
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                            value={newAccount.currency_code}
                                            onChange={e => setNewAccount({ ...newAccount, currency_code: e.target.value })}
                                        >
                                            <option value="SAR">ريال سعودي</option>
                                            <option value="USD">دولار أمريكي</option>
                                            <option value="EGP">جنيه مصري</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 rounded-md text-muted-foreground hover:bg-muted">إلغاء</button>
                                    <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                                        إنشاء الحساب
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Holding Modal */}
                {selectedAccountForHolding && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border border-border">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Plus size={20} className="text-primary" />
                                    إضافة أصل لـ {selectedAccountForHolding.name}
                                </h2>
                                <button onClick={() => setSelectedAccountForHolding(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddHolding} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">اسم الأصل / الرمز</label>
                                    <input
                                        autoFocus
                                        className="w-full p-2 rounded-md border border-input bg-background"
                                        placeholder="مثال: أرامكو, Bitcoin, شقة 1"
                                        value={newHolding.instrument_code}
                                        onChange={e => setNewHolding({ ...newHolding, instrument_code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">الكمية / القيمة</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 rounded-md border border-input bg-background"
                                        placeholder="0.00"
                                        value={newHolding.units}
                                        onChange={e => setNewHolding({ ...newHolding, units: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2 pt-2 border-t border-border">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newHolding.is_primary_home}
                                            onChange={e => setNewHolding({ ...newHolding, is_primary_home: e.target.checked })}
                                            className="rounded border-input text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">هل هذا منزل رئيسي؟ (معفى من الزكاة)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newHolding.is_sharia_compliant}
                                            onChange={e => setNewHolding({ ...newHolding, is_sharia_compliant: e.target.checked })}
                                            className="rounded border-input text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">هل الأصل متوافق مع الشريعة؟</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setSelectedAccountForHolding(null)} className="px-4 py-2 rounded-md text-muted-foreground hover:bg-muted">إلغاء</button>
                                    <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                                        إضافة الأصل
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
