
'use client'

import React from 'react'; // ID: 8527a4d5-5d9c-486a-8b3d-7c2a7f5d4a1b
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';

export default function DashboardNavbar() {
    const pathname = usePathname();
    const [userProfile, setUserProfile] = React.useState<any>({ name: 'User' }); // ID: 2b5c5f8e-3248-4221-8b4d-9a9c8b7d6e5a

    React.useEffect(() => { // ID: a7f8d9e2-1b3c-45d6-9e8a-7f1b2c3d4e5f
        const fetchUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;

                if (user) {
                    const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
                    if (data) setUserProfile(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchUser();
    }, []);

    const linkClass = (path: string) =>
        `px-4 py-2 rounded-lg transition-all duration-200 font-medium ${pathname === path || (path !== '/' && pathname?.startsWith(path))
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`;

    return (
        <nav className="border-b sticky top-0 z-30 bg-card/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="text-2xl font-bold text-primary flex items-center gap-2">
                        <span className="text-3xl">🌿</span> Wafir
                    </div>

                    <div className="hidden md:flex gap-2">
                        <Link href="/dashboard" className={linkClass('/dashboard')}>لوحة التحكم</Link>
                        <Link href="/budget" className={linkClass('/budget')}>الميزانية</Link>
                        <Link href="/investments" className={linkClass('/investments')}>الاستثمار</Link>
                        <Link href="/assets" className={linkClass('/assets')}>الأصول</Link>
                        <Link href="/zakat" className={linkClass('/zakat')}>الزكاة</Link>
                        <Link href="/ai_advisor" className={linkClass('/ai_advisor')}>ai_advisor</Link>
                        <Link href="/settings" className={linkClass('/settings')}>الاعدادات</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium hidden sm:block">
                        أهلاً، {userProfile.name} 👋
                    </div>
                    <button
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">تسجيل خروج</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
