
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
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // Need to fetch current settings to merge/update
    const { data: current } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.data.user.id)
        .single();

    const currentSettings = current?.settings || {};
    const newSettings = {
        ...currentSettings,
        monthlyIncome: dto.monthlyIncome,
        budgetLimits: dto.budgetLimits
    };

    const { data, error } = await supabase
        .from('users')
        .update({
            riskProfile: dto.riskProfile, // CamelCase Column
            settings: newSettings
        })
        .eq('id', user.data.user.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getUserProfile(): Promise<any> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.data.user.id)
        .single();

    if (error) {
        // Fallback if user missing in table but exists in Auth (shouldn't happen if synced)
        // Return basic structure
        return {
            id: user.data.user.id,
            email: user.data.user.email,
            name: user.data.user.user_metadata?.name,
            riskProfile: null,
            settings: { currency: 'USD' }
        };
    }

    // Map to expected structure
    return {
        id: data.id,
        email: data.email,
        name: data.name,
        riskProfile: data.riskProfile,
        settings: {
            ...data.settings,
            profile: {
                // If legacy code stored phone/age in settings.profile or root settings?
                // Emulating broad return
                ...data.settings?.profile,
                riskTolerance: data.riskProfile
            },
            currency: data.settings?.currency || 'USD'
        }
    };
}

export async function updateSettings(settings: any): Promise<any> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // Merge settings
    const { data: current } = await supabase.from('users').select('settings').eq('id', user.data.user.id).single();
    const currentSettings = current?.settings || {};
    const newSettings = { ...currentSettings, ...settings };

    const { data, error } = await supabase
        .from('users')
        .update({ settings: newSettings })
        .eq('id', user.data.user.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateCurrency(currency: string): Promise<any> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data: current } = await supabase.from('users').select('settings').eq('id', user.data.user.id).single();
    const currentSettings = current?.settings || {};
    const newSettings = { ...currentSettings, currency };

    const { data, error } = await supabase
        .from('users')
        .update({ settings: newSettings })
        .eq('id', user.data.user.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateUserProfile(profile: any): Promise<any> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // Profile updates (name, phone, age). 
    // Name is column. Phone/age likely in settings.
    const { data: current } = await supabase.from('users').select('settings').eq('id', user.data.user.id).single();
    const currentSettings = current?.settings || {};
    const newSettings = {
        ...currentSettings,
        // Assuming loose schema for extras
        phone: profile.phone || currentSettings.phone,
        age: profile.age || currentSettings.age
    };

    const updates: any = { settings: newSettings };
    if (profile.name) updates.name = profile.name;

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.data.user.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
