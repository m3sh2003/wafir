
'use client'

import React from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { Settings, User, Globe, Moon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="bg-background min-h-screen">
            <DashboardNavbar />
            <div className="p-6 space-y-8 animate-in fade-in container mx-auto max-w-2xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Settings className="w-8 h-8 text-primary" />
                        الإعدادات
                    </h1>
                    <p className="text-muted-foreground">تفضيلات التطبيق والملف الشخصي</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <User size={20} /> الملف الشخصي
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم العرض</label>
                                <input type="text" className="w-full p-2 rounded-md border border-input bg-background" defaultValue="User" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                                <input type="email" className="w-full p-2 rounded-md border border-input bg-background opacity-50 cursor-not-allowed" defaultValue="user@example.com" disabled />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Globe size={20} /> التفضيلات
                        </h2>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-3">
                                <Globe size={18} className="text-muted-foreground" />
                                <span>اللغة</span>
                            </div>
                            <span className="text-sm font-medium">العربية</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-3">
                                <Moon size={18} className="text-muted-foreground" />
                                <span>المظهر</span>
                            </div>
                            <span className="text-sm font-medium">فاتح (Emerald)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
