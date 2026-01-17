import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACCOUNTS_KEY = 'wafir_local_accounts';

export interface Account {
    id: number;
    name: string;
    currencyCode: string;
    type: 'bank' | 'broker' | 'cash' | 'certificate' | 'real_estate';
    isPrimary: boolean;
    balance?: number;
    holdings?: Holding[];
}

export interface Holding {
    id: number;
    instrumentCode: string;
    units: number;
    isShariaCompliant: boolean;
    isPrimaryHome: boolean;
    accountId: number;
}

const initialAccounts: Account[] = [
    { id: 1, name: '🏦 مصرف الراجحي - جاري', currencyCode: 'SAR', type: 'bank', isPrimary: true, balance: 25000 },
    { id: 2, name: '💼 محفظة دراية المالية', currencyCode: 'SAR', type: 'broker', isPrimary: false, balance: 50000 },
    { id: 3, name: '🏠 فيلا سكنية', currencyCode: 'SAR', type: 'real_estate', isPrimary: false, balance: 1200000 },
    { id: 4, name: '💵 كاش (خزنة)', currencyCode: 'SAR', type: 'cash', isPrimary: false, balance: 5000 }
];

async function fetchAccounts(): Promise<Account[]> {
    await new Promise(r => setTimeout(r, 500));
    let accs = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || 'null');
    if (!accs) {
        accs = initialAccounts;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
    }
    return accs;
}

async function createAccount(dto: any): Promise<Account> {
    const accs = await fetchAccounts();
    const newAcc: Account = { ...dto, id: Date.now(), isPrimary: false, balance: 0 };
    accs.push(newAcc);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
    return newAcc;
}

async function createHolding(accountId: number, dto: any): Promise<Holding> {
    const accs = await fetchAccounts();
    const idx = accs.findIndex(a => a.id === accountId);
    if (idx === -1) throw new Error('Account not found');
    const newHolding = { ...dto, id: Date.now(), accountId };
    if (!accs[idx].holdings) accs[idx].holdings = [];
    accs[idx].holdings.push(newHolding);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
    return newHolding;
}

async function deleteAccount(id: number): Promise<void> {
    const accs = await fetchAccounts();
    const filtered = accs.filter(a => a.id !== id);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
}

async function deleteHolding(id: number): Promise<void> {
    const accs = await fetchAccounts();
    accs.forEach(acc => {
        if (acc.holdings) {
            acc.holdings = acc.holdings.filter(h => h.id !== id);
        }
    });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
}

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });

export const useCreateAccount = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: createAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) });
};

export const useAddHolding = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (v: any) => createHolding(v.accountId, v.dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) });
};

export const useDeleteAccount = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: deleteAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) });
};

export const useDeleteHolding = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: deleteHolding, onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) });
};
