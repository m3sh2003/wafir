
'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen animate-in fade-in">
            <header className="px-6 h-20 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-4xl">🌿</span>
                    <span className="text-2xl font-bold text-primary">وافر</span>
                </div>
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowRight size={20} /> العودة للرئيسية
                </Link>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-4xl space-y-12">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">عن منصة وافر</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        رفيقك الرقمي لإدارة الثروات وفق المبادئ الإسلامية.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-primary">رؤيتنا</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            نسعى لتمكين المسلمين حول العالم من إدارة مواردهم المالية بذكاء وسهولة، مع ضمان الالتزام التام بأحكام الشريعة الإسلامية في كل خطوة، من حساب الزكاة وحتى الاستثمار.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <CheckCircle className="text-primary w-5 h-5" />
                                <span>دقة في حساب الزكاة</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="text-primary w-5 h-5" />
                                <span>أدوات استثمارية متوافقة</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="text-primary w-5 h-5" />
                                <span>خصوصية وأمان عالي</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-muted p-8 rounded-2xl border border-border flex items-center justify-center text-center">
                        <div className="space-y-4">
                            <span className="text-6xl">🕋</span>
                            <h3 className="text-xl font-semibold">قيمنا</h3>
                            <p className="text-sm text-muted-foreground">الشفافية • الأمانة • الابتكار</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
