import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface Asset {
    id: string;
    name: string;
    type: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    expectedReturn: string;
    minInvestment: string;
    description: string;
}

export interface UserPortfolioItem {
    id: string;
    amount: string;
    purchasedAt: string;
    asset: Asset;
}

export interface BuyInvestmentDto {
    productId: string;
    amount: number;
}

// Fetchers
async function fetchProducts(): Promise<Asset[]> {
    const { data, error } = await supabase.from('assets').select('*');
    if (error) {
        console.warn('Investment products (assets) fetch failed', error);
        return [];
    }
    return data;
}

async function fetchPortfolio(): Promise<UserPortfolioItem[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    const { data, error } = await supabase
        .from('user_portfolios')
        .select(`
            *,
            asset:assetId (*)
        `)
        .eq('userId', user.data.user.id);

    if (error) throw new Error(error.message);

    return data.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        purchasedAt: p.purchasedAt,
        asset: p.asset
    }));
}

async function fetchUserProfile(): Promise<{ riskProfile: string | null }> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return { riskProfile: null };

    const { data, error } = await supabase
        .from('users')
        .select('riskProfile')
        .eq('id', user.data.user.id)
        .single();

    if (error) return { riskProfile: null };
    return { riskProfile: data.riskProfile };
}

async function buyInvestment(dto: BuyInvestmentDto): Promise<any> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('user_portfolios')
        .insert({
            userId: user.data.user.id,
            assetId: dto.productId,
            amount: dto.amount,
            purchasedAt: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

async function sellInvestment(_dto: BuyInvestmentDto): Promise<any> {
    throw new Error('Sell not fully migrated to serverless yet');
}

async function rebalancePortfolio(): Promise<any> {
    return { message: "Rebalancing analysis is currently available only in Premium (Serverless Mode Restriction)." };
}

// Hooks
export const useInvestmentProducts = () => {
    return useQuery({
        queryKey: ['investmentProducts'],
        queryFn: fetchProducts,
    });
};

export const useUserPortfolio = () => {
    return useQuery({
        queryKey: ['userPortfolio'],
        queryFn: fetchPortfolio,
    });
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
    });
};

export const useBuyInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: buyInvestment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPortfolio'] });
        },
    });
};

export const useSellInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sellInvestment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPortfolio'] });
        },
    });
};

export const useRebalancePortfolio = () => {
    return useMutation({
        mutationFn: rebalancePortfolio
    });
};
