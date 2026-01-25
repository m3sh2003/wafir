
'use client'

import React from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { TrendingUp, Plus } from 'lucide-react';

export default function InvestmentsPage() {
    return (
        <div className="bg-background min-h-screen">
            <DashboardNavbar />
            <div className="p-6 space-y-8 animate-in fade-in container mx-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <TrendingUp className="w-8 h-8 text-primary" />
                            الاستثمار
                        </h1>
                        <p className="text-muted-foreground">أداء المحفظة الاستثمارية</p>
                    </div>
                </div>

                <div className="bg-card p-12 rounded-lg border border-border text-center space-y-6 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-muted-foreground/30" />
                    <div className="max-w-md space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">ابدأ استثمارك الأول</h3>
                        <p className="text-muted-foreground">
                            قم بربط محفظتك الاستثمارية أو أضف استثماراتك يدويًا لتتبع الأداء والنمو.
                        </p>
                    </div>
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                        <Plus size={16} /> إضافة استثمار جديد
                    </button>
                </div>
            </div>
        </div>
    )
}
