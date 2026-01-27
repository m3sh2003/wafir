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
    currency?: string;
    isGoldLivePrice?: boolean;
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

    // Query new Holdings table (joined with Assets via asset_id if possible, or just raw)
    // Note: The new Holding entity has 'instrument_code'. If we want rich data, we need to join 'assets' table on instrument_code matching name or similar?
    // Actually, in the new system, 'Holdings' are raw user assets. 'Assets' table contains 'Investment Products'.
    // We should try to match them if possible, OR just return them as generic assets.

    // Let's fetch holdings linked to user's accounts
    const { data: accounts, error } = await supabase
        .from('accounts')
        .select(`
            id,
            type,
            currency_code,
            is_gold_live_price,
            holdings (
                id,
                instrument_code,
                units,
                asset_id
            )
        `)
        .eq('user_id', user.data.user.id);

    if (error) throw new Error(error.message);

    // Context: The Investments page expects 'Asset' details (Risk, Return, etc.).
    // If the user added a custom holding (e.g. "Cash"), it might not match an 'Asset' product.
    // However, to show it in the list, we can fabricate a generic asset wrapper.

    const portfolioItems: UserPortfolioItem[] = [];

    accounts?.forEach((acc: any) => {
        acc.holdings?.forEach((h: any) => {
            portfolioItems.push({
                id: h.id.toString(),
                amount: h.units.toString(),
                purchasedAt: new Date().toISOString(),
                currency: acc.currency_code || acc.currencyCode || 'SAR',
                isGoldLivePrice: acc.is_gold_live_price,
                asset: {
                    id: h.asset_id || 'manual-' + h.id,
                    name: h.instrument_code,
                    type: acc.type === 'bank' ? 'Cash' : 'Investment', // Derby type from Account
                    riskLevel: 'Low', // Default
                    expectedReturn: '0',
                    minInvestment: '0',
                    description: 'Manual Asset'
                }
            });
        });
    });

    return portfolioItems;
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
