
import { supabase } from '../../../lib/supabase';

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
    const { data, error } = await supabase.auth.updateUser({
        data: {
            risk_profile: dto.riskProfile,
            monthly_income: dto.monthlyIncome,
            budget_limits: dto.budgetLimits,
            onboarding_completed: true
        }
    });

    if (error) throw new Error(error.message);
    return data.user;
}

export async function getUserProfile(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Map Supabase metadata to the expected profile structure
    return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        settings: {
            profile: {
                riskTolerance: user.user_metadata?.risk_profile,
                phone: user.user_metadata?.phone,
                age: user.user_metadata?.age,
            },
            currency: user.user_metadata?.currency || 'USD'
        }
    };
}

export async function updateSettings(settings: any): Promise<any> {
    // Merge settings into metadata
    const { data, error } = await supabase.auth.updateUser({
        data: settings // Assuming settings is a flattened object or we nest it? 
        // Legacy might have nested it. Let's assume passed object keys are what we want.
        // For safety, let's merge into 'settings' key if that's what legacy did, 
        // but getUserProfile maps it. Let's just spread it.
    });

    if (error) throw new Error(error.message);
    return data.user;
}

export async function updateCurrency(currency: string): Promise<any> {
    const { data, error } = await supabase.auth.updateUser({
        data: { currency }
    });

    if (error) throw new Error(error.message);
    return data.user;
}

export async function updateUserProfile(profile: any): Promise<any> {
    const { data, error } = await supabase.auth.updateUser({
        data: {
            name: profile.name,
            phone: profile.phone,
            age: profile.age,
            ...profile // Spread other fields
        }
    });

    if (error) throw new Error(error.message);
    return data.user;
}


