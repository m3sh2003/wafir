
export interface UserProfile {
    id: string
    email: string
    name?: string
    role?: string
    riskProfile?: string
    settings?: UserSettings
    created_at?: string
}

export interface UserSettings {
    currency?: string
    monthlyIncome?: number
    theme?: 'light' | 'dark'
    profile?: {
        age?: number
        phone?: string
    }
    [key: string]: any
}

export interface UpdateOnboardingDto {
    riskProfile: string
    monthlyIncome: number
    budgetLimits?: { [category: string]: number }
}

export interface Envelope {
    id: string
    userId: string
    name: string
    limitAmount: number
    currentAmount: number
    period: 'Monthly' | 'Weekly' | 'Yearly'
}
