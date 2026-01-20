
import { getToken } from '../../auth/api/auth';

const API_URL = '/api';

export const RiskProfile = {
    CONSERVATIVE: 'Conservative',
    BALANCED: 'Balanced',
    AGGRESSIVE: 'Aggressive'
} as const;

export type RiskProfile = typeof RiskProfile[keyof typeof RiskProfile];

export interface UpdateOnboardingDto {
    riskProfile: RiskProfile;
    monthlyIncome: number;
    budgetLimits: Record<string, number>;
}

export async function updateOnboarding(dto: UpdateOnboardingDto): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/onboarding`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to update onboarding data');
    return res.json();
}

export async function getUserProfile(): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/profile?t=${Date.now()}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });
    if (!res.ok) return null;
    return res.json();
}
export async function updateSettings(settings: any): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/settings`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
}

export async function updateCurrency(currency: string): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/currency`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currency }),
    });
    if (!res.ok) throw new Error('Failed to update currency');
    return res.json();
}

export async function updateUserProfile(profile: any): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
}
