
'use client'

import React from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { PieChart, Plus } from 'lucide-react';

export default function BudgetPage() {
    return (
        <div className="bg-background min-h-screen">
            <DashboardNavbar />
            <div className="p-6 space-y-8 animate-in fade-in container mx-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <PieChart className="w-8 h-8 text-primary" />
                            الميزانية
                        </h1>
                        <p className="text-muted-foreground">تتبع مصروفاتك الشهرية</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card p-8 rounded-lg border border-border text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                        <p className="text-muted-foreground">لا توجد بيانات للميزانية هذا الشهر.</p>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors">
                            <Plus size={16} /> إنشاء ميزانية جديدة
                        </button>
                    </div>

                    <div className="bg-card p-8 rounded-lg border border-border text-center space-y-4 shadow-sm min-h-[300px] flex items-center justify-center">
                        <div className="text-muted-foreground">
                            <p className="mb-2 font-medium">ملخص المصروفات</p>
                            <div className="w-48 h-48 rounded-full border-4 border-muted mx-auto flex items-center justify-center">
                                <span className="text-xl font-bold">0 SAR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
