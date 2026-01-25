import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

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
    const { data, error } = await supabase
        .from('accounts')
        .select(`
            *,
            holdings (*)
        `);

    if (error) throw new Error(error.message);

    return data.map((a: any) => ({
        id: a.id,
        name: a.name,
        currencyCode: a.currency_code || a.currencyCode || 'USD', // Handle snake_case DB
        type: a.type,
        isPrimary: a.is_primary || false,
        holdings: a.holdings?.map((h: any) => ({
            id: h.id,
            instrumentCode: h.instrument_code,
            units: h.units,
            isShariaCompliant: h.is_sharia_compliant,
            isPrimaryHome: h.is_primary_home,
            accountId: h.account_id
        })) || []
    }));
}

async function createAccount(dto: CreateAccountDto): Promise<Account> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('accounts')
        .insert({
            name: dto.name,
            type: dto.type,
            currency_code: dto.currencyCode,
            user_id: user.data.user.id
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        name: data.name,
        currencyCode: data.currency_code,
        type: data.type,
        isPrimary: data.is_primary,
        holdings: []
    };
}

async function createHolding(accountId: number, dto: CreateHoldingDto): Promise<Holding> {
    const { data, error } = await supabase
        .from('holdings')
        .insert({
            account_id: accountId,
            instrument_code: dto.instrumentCode,
            units: dto.units,
            is_sharia_compliant: dto.isShariaCompliant || false,
            is_primary_home: dto.isPrimaryHome || false
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        instrumentCode: data.instrument_code,
        units: data.units,
        isShariaCompliant: data.is_sharia_compliant,
        isPrimaryHome: data.is_primary_home,
        accountId: data.account_id
    };
}

async function deleteAccount(id: number): Promise<void> {
    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

async function deleteHolding(id: number): Promise<void> {
    const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
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


