import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface Envelope {
    id: string;
    name: string;
    limitAmount: string;
    period: string;
    spent?: number;
    isVisible?: boolean;
}

export interface CreateEnvelopeDto {
    name: string;
    limitAmount: number;
    period?: string;
    isVisible?: boolean;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    envelopeId: string;
    currency?: string;
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
    userId?: string;
}

// Fetchers

async function fetchEnvelopes(): Promise<Envelope[]> {
    // Fetch envelopes
    const { data: envelopesData, error: envelopesError } = await supabase
        .from('envelopes')
        .select('*')
        .order('id', { ascending: true });

    if (envelopesError) throw new Error(envelopesError.message);

    // Fetch all transactions for calculation
    const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, amount, envelopeId, type');

    if (transactionsError) throw new Error(transactionsError.message);

    const transactions = transactionsData || [];

    // Exchange Rates (Hardcoded for now to match other files)

    const toSAR = (amount: number, currency: string = 'SAR') => {
        const code = currency.toUpperCase();
        if (code === 'SAR') return amount;
        if (code === 'USD') return amount * 3.75; // Standard Fixed
        if (code === 'EGP') return amount / 12.5; // Matches other files logic
        return amount;
    };

    return envelopesData.map((e: any) => {
        // Calculate spent amount for this envelope
        const envelopeTransactions = transactions.filter((t: any) => t.envelopeId === e.id && t.type === 'EXPENSE');
        const spent = envelopeTransactions.reduce((sum: number, t: any) => {
            return sum + toSAR(Number(t.amount), t.currency || 'USD'); // Default to USD if missing? Or SAR? Transactions usually default to USD in some createdto.
            // In createTransactionDto, default is 'USD'.
        }, 0);

        return {
            id: e.id,
            name: e.name,
            limitAmount: e.limitAmount,
            period: e.period,
            spent: spent,
            isVisible: e.isVisible !== false // Default to true if null/undefined
        };
    });
}

// Default Envelopes List
const DEFAULT_ENVELOPES = [
    { name: 'Housing', limitAmount: 0 },
    { name: 'Utilities', limitAmount: 0 },
    { name: 'Groceries', limitAmount: 0 },
    { name: 'Transportation', limitAmount: 0 },
    { name: 'Insurance', limitAmount: 0 },
    { name: 'Healthcare', limitAmount: 0 },
    { name: 'Savings', limitAmount: 0 },
    { name: 'Personal', limitAmount: 0 },
    { name: 'Entertainment', limitAmount: 0 },
    { name: 'Zakat', limitAmount: 0 },
    { name: 'Taxes', limitAmount: 0 },
    { name: 'Decoration', limitAmount: 0 },
    { name: 'Procedures', limitAmount: 0 },
];

async function checkAndCreateDefaultEnvelopes(): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { count, error } = await supabase
        .from('envelopes')
        .select('id', { count: 'exact', head: true });

    if (!error && count === 0) {
        // Create defaults
        const envelopesToInsert = DEFAULT_ENVELOPES.map(env => ({
            name: env.name, // Will be localized in UI
            limitAmount: env.limitAmount, // 0 initially
            period: 'MONTHLY',
            userId: user.data.user?.id, // Legacy camelCase column if matching DB
            // RLS policies might require correct column naming. User is auto-injected by RLS usually? 
            // The API function creates envelopes with `userId: user.data.user.id`. 
            // In `budget.ts` `createEnvelope` uses `userId: user.data.user.id`.
            // The DB schema showed `userId` (camelCase) column in Envelopes for authenticated checks.
            isVisible: true
        }));

        // We can't bulk insert if the API expects one by one? 
        // Supabase `insert` supports array.
        // However, we need to be careful about column names.
        // `createEnvelope` uses `userId` (camelCase).

        await supabase.from('envelopes').insert(envelopesToInsert);
    }
}

async function createEnvelope(dto: CreateEnvelopeDto): Promise<Envelope> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('envelopes')
        .insert({
            name: dto.name,
            limitAmount: dto.limitAmount,
            period: dto.period || 'MONTHLY',
            userId: user.data.user.id,
            isVisible: dto.isVisible ?? true
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        name: data.name,
        limitAmount: data.limitAmount,
        period: data.period,
        spent: 0,
        isVisible: data.isVisible
    };
}

async function fetchTransactions(envelopeId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('"envelopeId"', envelopeId)
        .order('date', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type,
        envelopeId: t.envelopeId,
        currency: t.currency
    }));
}

async function fetchAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type,
        envelopeId: t.envelopeId,
        currency: t.currency
    }));
}

async function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            description: dto.description,
            amount: dto.amount,
            envelopeId: dto.envelopeId,
            date: dto.date || new Date().toISOString(),
            type: dto.type || 'EXPENSE',
            currency: dto.currency || 'USD',
            userId: user.data.user.id
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        envelopeId: data.envelopeId,
        currency: data.currency
    };
}

// Categories
async function fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.warn('Categories fetch failed', error);
        return [];
    }
    return data;
}

async function createCategory(name: string): Promise<Category> {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('categories')
        .insert({ name, userId: user.data.user?.id })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// Visibility Toggle
async function toggleEnvelopeVisibility({ id, isVisible }: { id: string; isVisible: boolean }) {
    const { error } = await supabase
        .from('envelopes')
        .update({ isVisible }) // ensure column isVisible is in DB
        .eq('id', id);

    if (error) throw new Error(error.message);
}

// Hooks

export const useEnvelopes = () => {
    return useQuery({
        queryKey: ['envelopes'],
        queryFn: fetchEnvelopes,
    });
};

export const useCheckAndCreateDefaultEnvelopes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkAndCreateDefaultEnvelopes,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
    });
};

export const useCreateEnvelope = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEnvelope,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
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
    return useQuery({
        queryKey: ['transactions', 'all'],
        queryFn: fetchAllTransactions,
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.envelopeId] });
            queryClient.invalidateQueries({ queryKey: ['transactions', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useToggleEnvelopeVisibility = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleEnvelopeVisibility,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['envelopes'] });
        },
    });
};

// Update/Delete API
async function updateTransaction(id: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> {
    const { data, error } = await supabase
        .from('transactions')
        .update({
            description: dto.description,
            amount: dto.amount,
            date: dto.date,
            type: dto.type,
            envelope_id: dto.envelopeId
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        envelopeId: data.envelope_id,
        currency: data.currency
    };
}

async function deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

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
