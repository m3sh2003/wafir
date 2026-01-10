import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../contexts/SettingsContext';
import { Moon, Sun, Globe, DollarSign, Save, User, Lock, Hash, Fingerprint, FileText, Database, Mail, Phone, Download, Upload } from 'lucide-react';
import { useState } from 'react';

export function SettingsPage() {
    const { t } = useTranslation();
    const {
        language, setLanguage,
        theme, setTheme,
        currency, setCurrency,
        usdRate, setUsdRate,
        egpRate, setEgpRate,
        profile, setProfile,
        security, setSecurity
    } = useSettings();

    const [tempUsdRate, setTempUsdRate] = useState(usdRate.toString());
    const [tempEgpRate, setTempEgpRate] = useState(egpRate.toString());

    const handleSaveUsdRate = () => {
        const rate = parseFloat(tempUsdRate);
        if (!isNaN(rate) && rate > 0) {
            setUsdRate(rate);
            alert(t('settings_saved'));
        }
    };

    const handleSaveEgpRate = () => {
        const rate = parseFloat(tempEgpRate);
        if (!isNaN(rate) && rate > 0) {
            setEgpRate(rate);
            alert(t('settings_saved'));
        }
    };

    const [tempProfile, setTempProfile] = useState(profile);

    const handleSaveProfile = () => {
        setProfile(tempProfile);
        alert(t('settings_saved'));
    };

    const [tempSecurity, setTempSecurity] = useState(security);

    const handleSaveSecurity = () => {
        setSecurity(tempSecurity);
        alert(t('settings_saved'));
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">{t('settings')}</h1>
                <p className="text-muted-foreground">{language === 'ar' ? 'إدارة تفضيلاتك' : 'Manage your preferences'}</p>
            </div>

            <div className="space-y-6">
                {/* Profile */}
                <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{t('profile')}</h3>
                            <p className="text-sm text-muted-foreground">{t('manage_real_world_assets')}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('name')}</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-md border bg-input"
                                value={tempProfile.name}
                                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('age')}</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-md border bg-input"
                                value={tempProfile.age}
                                onChange={(e) => setTempProfile({ ...tempProfile, age: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('email')}</label>
                            <input
                                type="email"
                                className="w-full p-2 rounded-md border bg-input"
                                value={tempProfile.email || ''}
                                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('phone_number')}</label>
                            <input
                                type="tel"
                                className="w-full p-2 rounded-md border bg-input"
                                value={tempProfile.phone || ''}
                                onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('risk_tolerance')}</label>
                        <select
                            className="w-full p-2 rounded-md border bg-input"
                            value={tempProfile.riskTolerance}
                            onChange={(e) => setTempProfile({ ...tempProfile, riskTolerance: e.target.value as any })}
                        >
                            <option value="none">{t('none')}</option>
                            <option value="conservative">{t('conservative')}</option>
                            <option value="balanced">{t('balanced')}</option>
                            <option value="growth">{t('growth')}</option>
                            <option value="aggressive">{t('aggressive')}</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSaveProfile}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
                        >
                            <Save className="w-4 h-4" />
                            {t('save_settings')}
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{t('security')}</h3>
                            <p className="text-sm text-muted-foreground">{t('manage_real_world_assets')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span>{t('change_password')}</span>
                            </div>
                            <button
                                onClick={() => alert(t('password_changed'))}
                                className="text-sm text-primary hover:underline"
                            >
                                {t('change_password')}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <span className="block">{t('app_pin')}</span>
                                    <span className="text-xs text-muted-foreground">{tempSecurity.appPin ? '****' : t('none')}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const pin = prompt(t('set_pin'));
                                    if (pin) setTempSecurity({ ...tempSecurity, appPin: pin });
                                }}
                                className="text-sm text-primary hover:underline"
                            >
                                {tempSecurity.appPin ? t('change_password') : t('set_pin')}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Fingerprint className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <span className="block">{t('enable_biometrics')}</span>
                                    <span className="text-xs text-muted-foreground">{t('biometrics_desc')}</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={tempSecurity.isBiometricsEnabled}
                                    onChange={(e) => setTempSecurity({ ...tempSecurity, isBiometricsEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSaveSecurity}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
                        >
                            <Save className="w-4 h-4" />
                            {t('save_settings')}
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{t('data_management')}</h3>
                            <p className="text-sm text-muted-foreground">{t('manage_real_world_assets')}</p>
                        </div>
                    </div>

                    {/* Export */}
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t('export_data')}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{t('export_desc')}</p>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => alert(t('data_exported'))} className="px-3 py-2 border rounded-md text-sm hover:bg-muted flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                {t('export_pdf')}
                            </button>
                            <button onClick={() => alert(t('data_exported'))} className="px-3 py-2 border rounded-md text-sm hover:bg-muted flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                {t('export_excel')}
                            </button>
                            <button onClick={() => alert(t('data_exported'))} className="px-3 py-2 border rounded-md text-sm hover:bg-muted flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                {t('export_csv')}
                            </button>
                        </div>
                    </div>

                    <div className="border-t my-4"></div>

                    {/* Backup & Restore */}
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            {t('backup_restore')}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{t('backup_desc')}</p>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => alert(t('db_backup_created'))} className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                {t('export_db')}
                            </button>
                            <button onClick={() => alert(t('db_restored'))} className="px-3 py-2 border rounded-md text-sm hover:bg-muted flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                {t('import_db')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Language */}
                <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{t('language')}</h3>
                            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'العربية' : 'English'}</p>
                        </div>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => setLanguage('ar')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'ar' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t('arabic')}
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t('english')}
                        </button>
                    </div>
                </div>

                {/* Theme */}
                <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{t('theme')}</h3>
                            <p className="text-sm text-muted-foreground">{theme === 'dark' ? t('dark_mode') : t('light_mode')}</p>
                        </div>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => setTheme('light')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Sun className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Moon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Currency */}
                <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{t('currency')}</h3>
                                <p className="text-sm text-muted-foreground">{currency}</p>
                            </div>
                        </div>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => setCurrency('SAR')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currency === 'SAR' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                SAR
                            </button>
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currency === 'USD' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                USD
                            </button>
                            <button
                                onClick={() => setCurrency('EGP')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currency === 'EGP' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                EGP
                            </button>
                        </div>
                    </div>

                    {currency === 'USD' && (
                        <div className="pt-4 border-t">
                            <label className="block text-sm font-medium mb-2">{t('exchange_rate')} (1 USD = ? SAR)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tempUsdRate}
                                    onChange={(e) => setTempUsdRate(e.target.value)}
                                    className="flex-1 p-2 rounded-md border bg-input"
                                />
                                <button
                                    onClick={handleSaveUsdRate}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
                                >
                                    <Save className="w-4 h-4" />
                                    {t('save_settings')}
                                </button>
                            </div>
                        </div>
                    )}

                    {currency === 'EGP' && (
                        <div className="pt-4 border-t">
                            <label className="block text-sm font-medium mb-2">{t('exchange_rate')} (1 SAR = ? EGP)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={tempEgpRate}
                                    onChange={(e) => setTempEgpRate(e.target.value)}
                                    className="flex-1 p-2 rounded-md border bg-input"
                                />
                                <button
                                    onClick={handleSaveEgpRate}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
                                >
                                    <Save className="w-4 h-4" />
                                    {t('save_settings')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
