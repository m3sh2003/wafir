
'use client'

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function ErrorPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-lg border border-border shadow-xl text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground">حدث خطأ</h1>
                <p className="text-muted-foreground">
                    عذراً، حدثت مشكلة أثناء محاولة تسجيل الدخول. يرجى التأكد من صحة بياناتك والمحاولة مرة أخرى.
                </p>

                <Link href="/login" className="block w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                    العودة لتسجيل الدخول
                </Link>
            </div>
        </div>
    )
}
