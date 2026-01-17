
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnvelopes } from '../../budget/api/budget';
import { updateOnboarding, RiskProfile } from '../api/users';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';

export function OnboardingPage() {
    const navigate = useNavigate();
    const { data: envelopes, isLoading } = useEnvelopes();
    const [step, setStep] = useState(1);
    const [income, setIncome] = useState(5000);
    const [riskProfile, setRiskProfile] = useState<RiskProfile>(RiskProfile.BALANCED);
    const [limits, setLimits] = useState<Record<string, number>>({});

    useEffect(() => {
        if (envelopes) {
            const initialLimits: Record<string, number> = {};
            envelopes.forEach(e => {
                initialLimits[e.name] = Number(e.limitAmount) || 0;
            });
            setLimits(initialLimits);
        }
    }, [envelopes]);

    const handleLimitChange = (name: string, value: string) => {
        setLimits(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const handleSubmit = async () => {
        try {
            await updateOnboarding({
                riskProfile,
                monthlyIncome: income,
                budgetLimits: limits
            });
            navigate('/dashboard'); // Or force a reload if needed
        } catch (error) {
            console.error('Onboarding failed', error);
            alert('Failed to save onboarding data. Please try again.');
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4" dir="rtl">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
                {/* Progress Indicators */}
                <div className="flex justify-between mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-emerald-600' : 'text-gray-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= i ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'}`}>
                                {i}
                            </div>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">أهلاً بك في وافر</h1>
                            <p className="text-gray-600">لنبدأ بإعداد ميزانيتك الشهرية. لقد اقترحنا لك بعض الأظرف، يمكنك تعديلها بما يناسبك.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">دخلك الشهري المتوقع</label>
                            <input
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(Number(e.target.value))}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {envelopes?.map(env => (
                                <div key={env.id} className="flex items-center gap-4">
                                    <label className="w-1/3 text-gray-700 font-medium">{env.name}</label>
                                    <input
                                        type="number"
                                        value={limits[env.name] || 0}
                                        onChange={(e) => handleLimitChange(env.name, e.target.value)}
                                        className="flex-1 p-2 border rounded-md text-left" // Checking dir issue
                                        dir="ltr"
                                    />
                                    <span className="text-gray-500">ر.س</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700"
                        >
                            التالي <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">ملفك الاستثماري</h1>
                            <p className="text-gray-600">ساعدنا في تقديم نصائح استثمارية تناسب مستوى تقبلك للمخاطر.</p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                {
                                    value: RiskProfile.CONSERVATIVE,
                                    title: 'متحفظ (Conservative)',
                                    desc: 'أفضل الأمان ورأس المال المضمون، حتى لو كانت العوائد قليلة.'
                                },
                                {
                                    value: RiskProfile.BALANCED,
                                    title: 'متوازن (Balanced)',
                                    desc: 'أوازن بين النمو والأمان، وأتقبل بعض التقلبات.'
                                },
                                {
                                    value: RiskProfile.AGGRESSIVE,
                                    title: 'نمو (High Growth)',
                                    desc: 'هدفي تعظيم الثروة، وأتقبل المخاطر العالية وتقلبات السوق.'
                                }
                            ].map(option => (
                                <div
                                    key={option.value}
                                    onClick={() => setRiskProfile(option.value)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${riskProfile === option.value ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <h3 className="font-bold text-gray-900">{option.title}</h3>
                                    <p className="text-sm text-gray-600">{option.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg"
                            >
                                سابق
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="w-16 h-16 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">جاهز للإطلاق!</h1>
                        <p className="text-gray-600">تم حفظ إعداداتك بنجاح. يمكنك الآن البدء في رحلتك المالية.</p>

                        <div className="bg-gray-50 p-4 rounded-lg text-right text-sm text-gray-600 space-y-2">
                            <p>💰 الدخل المتوقع: {income} ر.س</p>
                            <p>📈 الملف الاستثماري: {riskProfile}</p>
                            <p>✉️ عدد بنود الميزانية: {Object.keys(limits).length}</p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700"
                        >
                            الذهاب إلى لوحة القيادة
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
