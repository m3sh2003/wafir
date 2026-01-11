import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../../auth/api/auth';

const API_URL = '/api';

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
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

async function fetchPortfolio(): Promise<UserPortfolioItem[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/portfolio`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    return res.json();
}

async function fetchUserProfile(): Promise<{ riskProfile: string | null }> {
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/risk-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
}

async function buyInvestment(dto: BuyInvestmentDto): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/invest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to buy investment');
    }
    return res.json();
}

async function sellInvestment(dto: BuyInvestmentDto): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/sell`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to sell investment');
    }
    return res.json();
}

async function rebalancePortfolio(): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/portfolio/rebalance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to rebalance portfolio');
    return res.json();
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
