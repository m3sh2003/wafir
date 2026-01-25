
import { login, signup } from './actions'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-lg border border-border shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-8">
                    <span className="text-4xl mb-2 block">🌿</span>
                    <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول - وافر</h1>
                    <p className="text-muted-foreground text-sm mt-2">إدارة ثروتك بمبادئ إسلامية</p>
                </div>

                <form className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">البريد الإلكتروني</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            dir="ltr"
                            className="w-full p-2.5 rounded-md border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground">كلمة المرور</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            dir="ltr"
                            className="w-full p-2.5 rounded-md border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button formAction={login} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium">
                            <LogIn size={18} /> تسجيل الدخول
                        </button>
                        <button formAction={signup} className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-md hover:bg-secondary/80 transition-colors text-sm">
                            إنشاء حساب جديد
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
