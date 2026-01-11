import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../../auth/api/auth';

const API_URL = '/api';

export interface Account {
    id: number;
    name: string;
    currencyCode: string;
    type: 'bank' | 'broker' | 'cash' | 'certificate' | 'real_estate';
    isPrimary: boolean;
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

export interface CreateAccountDto {
    name: string;
    type: string;
    currencyCode: string;
}

export interface CreateHoldingDto {
    instrumentCode: string;
    units: number;
    isShariaCompliant?: boolean;
    isPrimaryHome?: boolean;
}

// Fetchers
async function fetchAccounts(): Promise<Account[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}/assets/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
}

async function createAccount(dto: CreateAccountDto): Promise<Account> {
    const token = getToken();
    const res = await fetch(`${API_URL}/assets/accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to create account');
    return res.json();
}

async function createHolding(accountId: number, dto: CreateHoldingDto): Promise<Holding> {
    const token = getToken();
    const res = await fetch(`${API_URL}/assets/accounts/${accountId}/holdings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to add holding');
    return res.json();
}

// Hooks

export const useAccounts = () => {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: fetchAccounts,
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

export const useAddHolding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { accountId: number; dto: CreateHoldingDto }) => createHolding(vars.accountId, vars.dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Detailed accounts include holdings often, or we invalidate specific keys
        },
    });
};

async function deleteAccount(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/assets/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete account');
}

async function deleteHolding(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/assets/holdings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete holding');
}

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

export const useDeleteHolding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteHolding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};
