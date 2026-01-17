import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../../auth/api/auth';

const API_URL = '/api';

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
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/envelopes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch envelopes');
    return res.json();
}

async function createEnvelope(dto: CreateEnvelopeDto): Promise<Envelope> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/envelopes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to create envelope');
    return res.json();
}

async function fetchTransactions(envelopeId: string): Promise<Transaction[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/envelopes/${envelopeId}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

async function fetchAllTransactions(): Promise<Transaction[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

async function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
}

async function fetchCategories(): Promise<Category[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

async function createCategory(name: string): Promise<Category> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
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
            queryClient.invalidateQueries({ queryKey: ['transactions', 'all'] }); // Fix: Invalidate global transactions
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
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/transactions/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
}

async function deleteTransaction(id: string): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/budget/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
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
