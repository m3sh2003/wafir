import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from '../lib/i18n';
import { updateSettings, updateCurrency, getUserProfile, updateUserProfile } from '../features/users/api/users';
import { getToken } from '../features/auth/api/auth';

interface SettingsState {
    language: 'ar' | 'en';
    theme: 'light' | 'dark';
    currency: 'SAR' | 'USD' | 'EGP';
    usdRate: number; // 1 USD = ? SAR (default 3.75)
    egpRate: number; // 1 SAR = ? EGP (default 13.0)
    profile: {
        name: string;
        email: string;
        phone: string;
        age: number;
        monthlyIncome: number; // Added field
        riskTolerance: 'conservative' | 'balanced' | 'growth' | 'aggressive' | 'none';
    };
    security: {
        isBiometricsEnabled: boolean;
        appPin: string | null;
    };
}

interface SettingsContextType extends SettingsState {
    setLanguage: (lang: 'ar' | 'en') => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setCurrency: (currency: 'SAR' | 'USD' | 'EGP') => void;
    setUsdRate: (rate: number) => void;
    setEgpRate: (rate: number) => void;
    setProfile: (profile: SettingsState['profile']) => void;
    setSecurity: (security: SettingsState['security']) => void;
    convertPrice: (amountInSar: number) => number;
    formatPrice: (amountInSar: number) => string;
    hydrateSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    // Load from local storage or defaults
    const [language, setLanguageState] = useState<'ar' | 'en'>(() => (localStorage.getItem('wafir_lang') as 'ar' | 'en') || 'ar');
    const [theme, setThemeState] = useState<'light' | 'dark'>(() => (localStorage.getItem('wafir_theme') as 'light' | 'dark') || 'light');
    const [currency, setCurrencyState] = useState<'SAR' | 'USD' | 'EGP'>(() => (localStorage.getItem('wafir_currency') as 'SAR' | 'USD' | 'EGP') || 'SAR');
    const [usdRate, setUsdRateState] = useState<number>(() => Number(localStorage.getItem('wafir_usd_rate')) || 3.75);
    const [egpRate, setEgpRateState] = useState<number>(() => Number(localStorage.getItem('wafir_egp_rate')) || 13.0);
    const [profile, setProfileState] = useState<SettingsState['profile']>(() => {
        const saved = localStorage.getItem('wafir_profile');
        return saved ? JSON.parse(saved) : { name: '', email: '', phone: '', age: 0, monthlyIncome: 0, riskTolerance: 'none' };
    });
    const [security, setSecurityState] = useState<SettingsState['security']>(() => {
        const saved = localStorage.getItem('wafir_security');
        return saved ? JSON.parse(saved) : { isBiometricsEnabled: false, appPin: null };
    });

    // Modals helper to call API
    const saveToBackend = async (key: string, value: any) => {
        if (!getToken()) return; // Only sync if logged in
        try {
            // Lazy import to avoid circular dependency if possible, or just rely on imports. 
            // Since we are inside component, imports are top level.
            // But we need to verify imports are present. 
            // We will add imports for updateSettings, updateCurrency at top of file.
            if (key === 'currency') {
                await updateCurrency(value);
            } else {
                await updateSettings({ [key]: value });
            }
        } catch (e) {
            console.error('Failed to sync settings to backend', e);
        }
    }

    // Sync Language
    const setLanguage = (lang: 'ar' | 'en') => {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
        document.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        localStorage.setItem('wafir_lang', lang);
        saveToBackend('language', lang);
    };

    // Sync Theme
    const setTheme = (t: 'light' | 'dark') => {
        setThemeState(t);
        if (t === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('wafir_theme', t);
        saveToBackend('theme', t);
    };

    // Currency Helpers
    const setCurrency = (c: 'SAR' | 'USD' | 'EGP') => {
        setCurrencyState(c);
        localStorage.setItem('wafir_currency', c);
        saveToBackend('currency', c);
    }

    const setUsdRate = (r: number) => {
        setUsdRateState(r);
        localStorage.setItem('wafir_usd_rate', r.toString());
        saveToBackend('usdRate', r);
    }

    const setEgpRate = (r: number) => {
        setEgpRateState(r);
        localStorage.setItem('wafir_egp_rate', r.toString());
        saveToBackend('egpRate', r);
    }

    const setProfile = (p: SettingsState['profile']) => {
        setProfileState(p);
        localStorage.setItem('wafir_profile', JSON.stringify(p));

        // Sync to backend
        const token = getToken();
        if (token) {
            updateUserProfile(p).catch(err => console.error('Failed to sync profile', err));
        }
    }

    const setSecurity = (s: SettingsState['security']) => {
        setSecurityState(s);
        localStorage.setItem('wafir_security', JSON.stringify(s));
    }

    const convertPrice = (sarAmount: number) => {
        if (currency === 'SAR') return sarAmount;
        if (currency === 'USD') return sarAmount / usdRate;
        if (currency === 'EGP') return sarAmount * egpRate;
        return sarAmount;
    }

    const formatPrice = (sarAmount: number) => {
        const val = convertPrice(sarAmount);
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: currency
        }).format(val);
    }

    const hydrateSettings = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const user = await getUserProfile();
            if (user && user.settings) {
                const s = user.settings;
                if (s.currency) {
                    setCurrencyState(s.currency);
                    localStorage.setItem('wafir_currency', s.currency);
                }
                if (s.language) {
                    setLanguageState(s.language);
                    localStorage.setItem('wafir_lang', s.language);
                    i18n.changeLanguage(s.language);
                    document.dir = s.language === 'ar' ? 'rtl' : 'ltr';
                }
                if (s.theme) {
                    setThemeState(s.theme);
                    localStorage.setItem('wafir_theme', s.theme);
                    if (s.theme === 'dark') document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                }
            }

            // Sync Profile (Name, Email, etc.)
            // getUserProfile returns the User entity which has name, email, etc.
            if (user) {
                const newProfile = {
                    name: user.name || '',
                    email: user.email || '',
                    // Check if other fields are in user or settings.profile
                    phone: user.settings?.profile?.phone || '',
                    age: user.settings?.profile?.age || 0,
                    monthlyIncome: user.settings?.monthlyIncome || 0,
                    riskTolerance: user.riskProfile || 'none',
                };
                setProfileState(newProfile as SettingsState['profile']);
                localStorage.setItem('wafir_profile', JSON.stringify(newProfile));
            }
        } catch (e) { console.error('Failed to hydrate settings', e); }
    }

    // Init Effect
    useEffect(() => {
        setLanguage(language);
        setTheme(theme);
        hydrateSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{
            language, theme, currency, usdRate, egpRate, profile, security,
            setLanguage, setTheme, setCurrency, setUsdRate, setEgpRate, setProfile, setSecurity,
            convertPrice, formatPrice, hydrateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};
