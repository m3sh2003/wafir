import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

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
    const { data, error } = await supabase
        .from('envelopes')
        .select('*');

    if (error) throw new Error(error.message);

    return data.map((e: any) => ({
        id: e.id,
        name: e.name,
        limitAmount: e.limit_amount,
        period: e.period,
        spent: e.spent_amount // Computed column or view? If raw table, might be null.
    }));
}

async function createEnvelope(dto: CreateEnvelopeDto): Promise<Envelope> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('envelopes')
        .insert({
            name: dto.name,
            limit_amount: dto.limitAmount,
            period: dto.period || 'MONTHLY',
            user_id: user.data.user.id
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        name: data.name,
        limitAmount: data.limit_amount,
        period: data.period,
        spent: 0
    };
}

async function fetchTransactions(envelopeId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('envelope_id', envelopeId)
        .order('date', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type,
        envelopeId: t.envelope_id,
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
        envelopeId: t.envelope_id,
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
            envelope_id: dto.envelopeId,
            date: dto.date || new Date().toISOString(),
            type: dto.type || 'EXPENSE',
            currency: dto.currency || 'USD',
            user_id: user.data.user.id
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Initial basic update for spent amount on envelope - ideally this should be a trigger in DB or handled by RLS/logic
    // For now we trust the client or triggers.

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

// Categories - Assuming 'categories' table exists, if not we might skip or fail.
async function fetchCategories(): Promise<Category[]> {
    // Check if table exists first? Or just try.
    // Assuming schema migration included categories if they existed. If not, this might fail.
    // Let's assume for now we skip categories or try.
    // The previous implementation used /budget/categories. 
    // If Supabase doesn't have it, we return empty.
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.warn('Categories fetch failed (might not exist)', error);
        return [];
    }
    return data;
}

async function createCategory(name: string): Promise<Category> {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('categories')
        .insert({ name, user_id: user.data.user?.id })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// Hooks

export const useEnvelopes = () => {
    return useQuery({
        queryKey: ['envelopes'],
        queryFn: fetchEnvelopes,
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
