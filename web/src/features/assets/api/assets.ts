import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api_client';

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
    const res = await apiClient('/assets/accounts');
    return res.json();
}

async function createAccount(dto: CreateAccountDto): Promise<Account> {
    const res = await apiClient('/assets/accounts', {
        method: 'POST',
        body: JSON.stringify(dto),
    });
    return res.json();
}

async function createHolding(accountId: number, dto: CreateHoldingDto): Promise<Holding> {
    const res = await apiClient(`/assets/accounts/${accountId}/holdings`, {
        method: 'POST',
        body: JSON.stringify(dto),
    });
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
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        },
    });
};

export const useAddHolding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { accountId: number; dto: CreateHoldingDto }) => createHolding(vars.accountId, vars.dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        },
    });
};

async function deleteAccount(id: number): Promise<void> {
    await apiClient(`/assets/accounts/${id}`, {
        method: 'DELETE',
    });
}

async function deleteHolding(id: number): Promise<void> {
    await apiClient(`/assets/holdings/${id}`, {
        method: 'DELETE',
    });
}

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        },
    });
};

export const useDeleteHolding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteHolding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        },
    });
};
