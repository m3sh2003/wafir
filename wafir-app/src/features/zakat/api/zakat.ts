import { getToken } from '../../auth/api/auth';

const API_URL = '/api';

export interface ZakatRequest {
    portfolio_valuation_usd: number;
    non_zakat_assets: string[];
    nisab_usd: number;
}

export interface ZakatResult {
    zakat_due_usd: number;
    currency: string;
    calculation_basis: string;
    nisab_status: string;
    message?: string;
}

export const calculateZakat = async (data: ZakatRequest): Promise<ZakatResult> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/zakat/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to calculate Zakat');
    return res.json();
    if (!res.ok) throw new Error('Failed to calculate Zakat');
    return res.json();
};

export const calculateSystemZakat = async (): Promise<any> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/zakat/calculate/system`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch system zakat');
    return res.json();
};
