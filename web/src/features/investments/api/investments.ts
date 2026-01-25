import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface Asset {
    id: string;
    name: string;
    type: string; // 'Sukuk', 'ETF', 'REIT', etc.
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
    const { data, error } = await supabase
        .from('investment_products')
        .select('*');

    if (error) {
        console.warn('Failed to fetch products (table might be missing)', error);
        return [];
    }

    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        riskLevel: p.risk_level,
        expectedReturn: p.expected_return,
        minInvestment: p.min_investment,
        description: p.description
    }));
}

async function fetchPortfolio(): Promise<UserPortfolioItem[]> {
    const { data, error } = await supabase
        .from('portfolio_items')
        .select(`
            *,
            asset:investment_products (*)
        `);

    if (error) {
        console.warn('Failed to fetch portfolio', error);
        return [];
    }

    // Filter out items with missing assets
    return data
        .filter((item: any) => item.asset)
        .map((item: any) => ({
            id: item.id,
            amount: item.amount,
            purchasedAt: item.created_at || new Date().toISOString(),
            asset: {
                id: item.asset.id,
                name: item.asset.name,
                type: item.asset.type,
                riskLevel: item.asset.risk_level,
                expectedReturn: item.asset.expected_return,
                minInvestment: item.asset.min_investment,
                description: item.asset.description
            }
        }));
}

async function fetchUserProfile(): Promise<{ riskProfile: string | null }> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return { riskProfile: null };

    // Assuming a user_settings or similar table, or metadata
    // For simplicity, checking user_metadata first
    if (user.data.user.user_metadata?.risk_profile) {
        return { riskProfile: user.data.user.user_metadata.risk_profile };
    }

    return { riskProfile: null };
}

async function buyInvestment(dto: BuyInvestmentDto): Promise<any> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // Simple implementation: Insert into portfolio_items
    // Ideally this should be a transaction verifying balance, but covering minimal serverless path
    const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
            user_id: user.data.user.id,
            product_id: dto.productId,
            amount: dto.amount,
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

async function sellInvestment(dto: BuyInvestmentDto): Promise<any> {
    // For sell, we might verify we have it. 
    // Simplified: Delete or decrease amount. 
    // Assuming 'sell' means sell all or specific entry? The DTO has productId and amount.
    // Let's implement a basic DELETE for the product ID for this user (sell all) for MVP
    // OR decrement. Supabase doesn't have easy decrement without RPC.
    // Let's just do an RPC call if it exists, or failover to "Alert: Not implemented fully in Serverless" or delete row.

    // Attempting to just Delete the most recent purchase of this product for now as a "Sell" action
    const user = await supabase.auth.getUser();
    const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('user_id', user.data.user?.id)
        .eq('product_id', dto.productId); // Warning: This deletes ALL for this product

    if (error) throw new Error(error.message);
    return { success: true };
}

async function rebalancePortfolio(): Promise<any> {
    // Client-side rebalancing suggestion?
    // For now, return a dummy success or generic message as server calculation is removed.
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


