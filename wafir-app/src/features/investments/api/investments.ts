import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PRODUCTS_KEY = 'wafir_local_invest_products';
const PORTFOLIO_KEY = 'wafir_local_portfolio';

export interface Asset {
    id: string;
    name: string;
    type: string; // 'Sukuk', 'ETF', 'REIT', 'Stock', etc.
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

// قائمة المنتجات الاستثمارية المستوحاة من تمرة وملاءة وروبن هود
const initialProducts: Asset[] = [
    {
        id: 'p1',
        name: 'صكوك مصرف الراجحي',
        type: 'Sukuk',
        riskLevel: 'Low',
        expectedReturn: '5.5%',
        minInvestment: '1000',
        description: 'صكوك متوافقة مع الشريعة الإسلامية توفر عوائد دورية مستقرة.'
    },
    {
        id: 'p2',
        name: 'الإنماء ريت الفندقي',
        type: 'REIT',
        riskLevel: 'Medium',
        expectedReturn: '7.2%',
        minInvestment: '500',
        description: 'استثمار في أصول عقارية فندقية مدرة للدخل.'
    },
    {
        id: 'p3',
        name: 'مؤشر S&P 500 (مُطهر)',
        type: 'ETF',
        riskLevel: 'High',
        expectedReturn: '10.5%',
        minInvestment: '100',
        description: 'صندوق مؤشرات يتتبع أكبر 500 شركة أمريكية مع استبعاد الشركات غير المتوافقة شرعياً.'
    },
    {
        id: 'p4',
        name: 'صندوق الذهب الاستثماري',
        type: 'Commodity',
        riskLevel: 'Medium',
        expectedReturn: '4.0%',
        minInvestment: '1000',
        description: 'وسيلة آمنة للاستثمار في الذهب الفعلي والحماية من التضخم.'
    },
    {
        id: 'p5',
        name: 'سهم أرامكو السعودية',
        type: 'Stock',
        riskLevel: 'Medium',
        expectedReturn: '4.8% (توزيعات)',
        minInvestment: '35',
        description: 'أكبر شركة نفط في العالم مع توزيعات أرباح مستقرة.'
    }
];

const initialPortfolio: UserPortfolioItem[] = [
    {
        id: 'port_1',
        amount: '5000',
        purchasedAt: new Date().toISOString(),
        asset: initialProducts[0]
    },
    {
        id: 'port_2',
        amount: '2000',
        purchasedAt: new Date().toISOString(),
        asset: initialProducts[2]
    }
];

// Offline Fetchers
async function fetchProducts(): Promise<Asset[]> {
    await new Promise(r => setTimeout(r, 600));
    let prods = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || 'null');
    if (!prods) {
        prods = initialProducts;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(prods));
    }
    return prods;
}

async function fetchPortfolio(): Promise<UserPortfolioItem[]> {
    await new Promise(r => setTimeout(r, 600));
    let port = JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || 'null');
    if (!port) {
        port = initialPortfolio;
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(port));
    }
    return port;
}

async function fetchUserProfile(): Promise<{ riskProfile: string | null }> {
    const profile = JSON.parse(localStorage.getItem('wafir_user_profile') || '{}');
    return { riskProfile: profile.riskProfile || 'Aggressive' };
}

async function buyInvestment(dto: BuyInvestmentDto): Promise<any> {
    const prods = await fetchProducts();
    const port = await fetchPortfolio();
    const asset = prods.find(p => p.id === dto.productId);
    if (!asset) throw new Error('Product not found');

    const newItem: UserPortfolioItem = {
        id: Date.now().toString(),
        amount: dto.amount.toString(),
        purchasedAt: new Date().toISOString(),
        asset
    };

    port.push(newItem);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(port));
    return newItem;
}

async function sellInvestment(dto: BuyInvestmentDto): Promise<any> {
    const port = await fetchPortfolio();
    const filtered = port.filter(p => p.asset.id !== dto.productId);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(filtered));
    return { success: true };
}

async function rebalancePortfolio(): Promise<any> {
    await new Promise(r => setTimeout(r, 1500));
    return { success: true, message: 'تمت إعادة موازنة المحفظة بنجاح بناءً على ملفك الاستثماري' };
}

// Hooks
export const useInvestmentProducts = () => useQuery({ queryKey: ['investmentProducts'], queryFn: fetchProducts });
export const useUserPortfolio = () => useQuery({ queryKey: ['userPortfolio'], queryFn: fetchPortfolio });
export const useUserProfile = () => useQuery({ queryKey: ['userProfile'], queryFn: fetchUserProfile });

export const useBuyInvestment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: buyInvestment,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['userPortfolio'] }),
    });
};

export const useSellInvestment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: sellInvestment,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['userPortfolio'] }),
    });
};

export const useRebalancePortfolio = () => {
    return useMutation({ mutationFn: rebalancePortfolio });
};
