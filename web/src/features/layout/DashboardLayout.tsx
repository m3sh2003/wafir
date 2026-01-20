import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';

interface DashboardLayoutProps {
    children: ReactNode;
}



export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { t } = useTranslation();
    const { profile } = useSettings();
    const location = useLocation();
    const linkClass = (path: string) =>
        `px-4 py-2 rounded-lg transition-all duration-200 font-medium ${location.pathname === path
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            {/* Top Navigation */}
            <nav className="border-b sticky top-0 z-30 bg-card/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-2xl font-bold text-primary flex items-center gap-2">
                            <span className="text-3xl">🌿</span> Wafir
                        </div>

                        <div className="hidden md:flex gap-2">
                            <Link to="/" className={linkClass('/')}>{t('dashboard')}</Link>
                            <Link to="/budget" className={linkClass('/budget')}>{t('budget')}</Link>
                            <Link to="/investments" className={linkClass('/investments')}>{t('investments')}</Link>
                            <Link to="/assets" className={linkClass('/assets')}>{t('assets')}</Link>
                            <Link to="/zakat" className={linkClass('/zakat')}>{t('zakat')}</Link>
                            <Link to="/settings" className={linkClass('/settings')}>{t('settings')}</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium hidden sm:block">
                            {/* Dynamic Greeting */}
                            {t('welcome') || 'Welcome'}, {profile.name || 'User'} 👋
                        </div>
                        <button
                            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                            className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors"
                        >
                            تسجيل خروج
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>
        </div>
    );
}
