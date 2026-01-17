import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ENVELOPES_KEY = 'wafir_local_envelopes';
const TRANSACTIONS_KEY = 'wafir_local_transactions';
const CATEGORIES_KEY = 'wafir_local_categories';

export interface Envelope {
    id: string;
    name: string;
    limitAmount: string;
    period: string;
    spent?: number;
}

export interface CreateEnvelopeDto {
    name: string;
    limitAmount: number;
    period?: string;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    envelopeId: string;
}

export interface CreateTransactionDto {
    description: string;
    amount: number;
    envelopeId: string;
    date?: string;
    currency?: string;
    type?: 'INCOME' | 'EXPENSE';
}

export interface Category {
    id: string;
    name: string;
    type: string;
}

// قائمة الأظرف الافتراضية المستوحاة من مصاريف و YNAB
const initialEnvelopes: Envelope[] = [
    // الاحتياجات الأساسية (Essential Needs - YNAB Style)
    { id: 'env_1', name: '🏠 السكن والإيجار', limitAmount: '3000', period: 'monthly', spent: 0 },
    { id: 'env_2', name: '⚡ فواتير (كهرباء، ماء، غاز)', limitAmount: '500', period: 'monthly', spent: 0 },
    { id: 'env_3', name: '🛒 مقاضي البيت (تموين)', limitAmount: '1500', period: 'monthly', spent: 0 },
    { id: 'env_4', name: '📶 إنترنت واتصالات', limitAmount: '300', period: 'monthly', spent: 0 },
    
    // مصاريف متغيرة (Variable Expenses - Masarif Style)
    { id: 'env_5', name: '🚗 بنزين ومواصلات', limitAmount: '600', period: 'monthly', spent: 0 },
    { id: 'env_6', name: '☕ مطاعم ومقاهي', limitAmount: '800', period: 'monthly', spent: 0 },
    { id: 'env_7', name: '🏥 الصحة والأدوية', limitAmount: '200', period: 'monthly', spent: 0 },
    { id: 'env_8', name: '🧼 عناية شخصية ومنظفات', limitAmount: '200', period: 'monthly', spent: 0 },
    
    // نمط الحياة والالتزامات (True Expenses)
    { id: 'env_9', name: '🎁 هدايا ومناسبات', limitAmount: '200', period: 'monthly', spent: 0 },
    { id: 'env_10', name: '🎭 ترفيه وهوايات', limitAmount: '400', period: 'monthly', spent: 0 },
    { id: 'env_11', name: '🕋 زكاة وصدقات', limitAmount: '100', period: 'monthly', spent: 0 },
    
    // أهداف مالية وطوارئ (Savings Goals)
    { id: 'env_12', name: '🚨 صندوق الطوارئ', limitAmount: '500', period: 'monthly', spent: 0 },
    { id: 'env_13', name: '🛠 صيانة (بيت/سيارة)', limitAmount: '300', period: 'monthly', spent: 0 },
    { id: 'env_14', name: '✈️ ادخار للسفر', limitAmount: '500', period: 'monthly', spent: 0 }
];

const initialCategories: Category[] = [
    { id: 'cat_1', name: '💵 الراتب الرسمي', type: 'INCOME' },
    { id: 'cat_2', name: '💻 عمل حر (Freelance)', type: 'INCOME' },
    { id: 'cat_3', name: '📈 عوائد استثمارية', type: 'INCOME' },
    { id: 'cat_4', name: '🎁 دخل إضافي/هدايا', type: 'INCOME' }
];

async function fetchEnvelopes(): Promise<Envelope[]> {
    await new Promise(r => setTimeout(r, 600));
    let envs = JSON.parse(localStorage.getItem(ENVELOPES_KEY) || 'null');
    if (!envs) {
        envs = initialEnvelopes;
        localStorage.setItem(ENVELOPES_KEY, JSON.stringify(envs));
    }
    
    const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    return envs.map((e: Envelope) => ({
        ...e,
        spent: transactions
            .filter((t: any) => t.envelopeId === e.id && t.type === 'EXPENSE')
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    }));
}

async function createEnvelope(dto: CreateEnvelopeDto): Promise<Envelope> {
    const envs = await fetchEnvelopes();
    const newEnv: Envelope = {
        id: Date.now().toString(),
        name: dto.name,
        limitAmount: dto.limitAmount.toString(),
        period: dto.period || 'monthly',
        spent: 0
    };
    envs.push(newEnv);
    localStorage.setItem(ENVELOPES_KEY, JSON.stringify(envs));
    return newEnv;
}

async function fetchAllTransactions(): Promise<Transaction[]> {
    await new Promise(r => setTimeout(r, 400));
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
}

async function fetchTransactions(envelopeId: string): Promise<Transaction[]> {
    const all = await fetchAllTransactions();
    return all.filter(t => t.envelopeId === envelopeId);
}

async function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const all = await fetchAllTransactions();
    const newTx: Transaction = {
        id: Date.now().toString(),
        description: dto.description,
        amount: dto.amount,
        envelopeId: dto.envelopeId,
        date: dto.date || new Date().toISOString(),
        type: dto.type || 'EXPENSE'
    };
    all.push(newTx);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
    return newTx;
}

async function fetchCategories(): Promise<Category[]> {
    let cats = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || 'null');
    if (!cats) {
        cats = initialCategories;
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
    }
    return cats;
}

async function createCategory(name: string): Promise<Category> {
    const cats = await fetchCategories();
    const newCat = { id: Date.now().toString(), name, type: 'INCOME' };
    cats.push(newCat);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
    return newCat;
}

async function updateTransaction(id: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> {
    const all = await fetchAllTransactions();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');
    all[idx] = { ...all[idx], ...dto };
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
    return all[idx];
}

async function deleteTransaction(id: string): Promise<void> {
    const all = await fetchAllTransactions();
    const filtered = all.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
}

// Hooks
export const useEnvelopes = () => {
    return useQuery({ queryKey: ['envelopes'], queryFn: fetchEnvelopes });
};

export const useCreateEnvelope = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEnvelope,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['envelopes'] }),
    });
};

export const useTransactions = (envelopeId: string) => {
    return useQuery({
        queryKey: ['transactions', envelopeId],
        queryFn: () => fetchTransactions(envelopeId),
        enabled: !!envelopeId,
    });
};

export const useAllTransactions = () => {
    return useQuery({ queryKey: ['transactions', 'all'], queryFn: fetchAllTransactions });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
    });
};

export const useCategories = () => {
    return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateTransactionDto> }) => updateTransaction(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
    });
};
