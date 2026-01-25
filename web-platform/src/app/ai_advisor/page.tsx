
'use client'

import React from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { Bot, Send } from 'lucide-react';

export default function AiAdvisorPage() {
    return (
        <div className="bg-background min-h-screen">
            <DashboardNavbar />
            <div className="p-6 space-y-8 animate-in fade-in container mx-auto h-[calc(100vh-80px)] flex flex-col">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Bot className="w-8 h-8 text-primary" />
                        المستشار الذكي
                    </h1>
                    <p className="text-muted-foreground">اسأل وافر عن أي استشارة مالية إسلامية</p>
                </div>

                <div className="flex-1 bg-card rounded-lg border border-border flex flex-col shadow-sm overflow-hidden">
                    <div className="flex-1 p-6 flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-2">
                            <Bot className="w-12 h-12 mx-auto opacity-50" />
                            <p>مرحباً! أنا مستشارك المالي الذكي. كيف يمكنني مساعدتك اليوم؟</p>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="اكتب سؤالك هنا..."
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button className="absolute left-2 top-1.5 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
