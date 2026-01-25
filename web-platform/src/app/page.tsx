
import Link from 'next/link';
import { ArrowLeft, Wallet, PieChart, Calculator, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-in fade-in">
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🌿</span>
          <span className="text-2xl font-bold text-primary">وافر</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            تسجيل الدخول
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            إبدا الآن
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            مستقبلك المالي، <span className="text-primary">بمبادئ إسلامية</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            منصة "وافر" تساعدك على إدارة ميزانيتك، حساب زكاتك، وتنمية استثماراتك بطريقة ذكية ومتوافقة مع الشريعة.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/dashboard" className="px-8 py-4 rounded-full text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2">
              اذهب للوحة التحكم <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/about" className="px-8 py-4 rounded-full text-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all">
              تعرف علينا
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Wallet className="w-10 h-10 text-primary" />}
              title="إدارة الميزانية"
              desc="تتبع دخلك ومصروفاتك بدقة، وحدد ميزانيات شهرية لتوفير المزيد."
            />
            <FeatureCard
              icon={<Calculator className="w-10 h-10 text-primary" />}
              title="حاسبة الزكاة الذكية"
              desc="احسب زكاتك تلقائيًا بناءً على أصولك المربوطة، أو أدخلها يدويًا بسهولة."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-10 h-10 text-primary" />}
              title="استثمار حلال"
              desc="اكتشف فرص استثمارية متوافقة مع الشريعة الإسلامية ومناسبة لملف المخاطر الخاص بك."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border text-center text-muted-foreground">
        <p>© 2026 منصة وافر. جميع الحقوق محفوظة.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <Link href="#" className="hover:text-foreground">سياسة الخصوصية</Link>
          <Link href="#" className="hover:text-foreground">الشروط والأحكام</Link>
          <Link href="#" className="hover:text-foreground">تواصل معنا</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:border-primary/50 transition-colors text-center space-y-4">
      <div className="flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  )
}
