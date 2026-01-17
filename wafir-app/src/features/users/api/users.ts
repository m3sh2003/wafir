
// استخدام LocalStorage لتخزين بيانات المستخدم محلياً
const PROFILE_KEY = 'wafir_user_profile';

export enum RiskProfile {
    CONSERVATIVE = 'Conservative',
    BALANCED = 'Balanced',
    AGGRESSIVE = 'Aggressive'
}

export interface UpdateOnboardingDto {
    riskProfile: RiskProfile;
    monthlyIncome: number;
    budgetLimits: Record<string, number>;
}

export async function updateOnboarding(dto: UpdateOnboardingDto): Promise<any> {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));

    // جلب البروفايل الحالي أو إنشاء واحد جديد
    const currentProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    
    // دمج البيانات الجديدة
    const updatedProfile = {
        ...currentProfile,
        ...dto,
        onboardingCompleted: true
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
}

export async function getUserProfile(): Promise<any> {
    const profile = localStorage.getItem(PROFILE_KEY);
    if (!profile) {
        // إذا لم يوجد بروفايل، نرجع بيانات افتراضية
        return {
            name: "المستخدم",
            email: "user@example.com",
            onboardingCompleted: false
        };
    }
    return JSON.parse(profile);
}

export async function updateSettings(settings: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const currentProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    const updatedProfile = { ...currentProfile, settings: { ...currentProfile.settings, ...settings } };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
}

export async function updateCurrency(currency: string): Promise<any> {
    return updateSettings({ currency });
}
