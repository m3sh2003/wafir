import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../../auth/api/auth';

const API_URL = 'http://localhost:3000/api';

async function setRiskProfile(score: number): Promise<any> {
    const token = getToken();
    const res = await fetch(`${API_URL}/investments/risk-profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score }),
    });
    if (!res.ok) throw new Error('Failed to set risk profile');
    return res.json();
}

export function RiskAssessmentModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<number[]>([]);
    const queryClient = useQueryClient();

    const questions = [
        {
            text: "What is your primary investment goal?",
            options: [
                { text: "Preserve Capital (Safety)", score: 1 },
                { text: "Balanced Growth", score: 2 },
                { text: "Aggressive Growth (Wealth)", score: 3 }
            ]
        },
        {
            text: "How long do you plan to invest?",
            options: [
                { text: "Less than 3 years", score: 1 },
                { text: "3 - 10 years", score: 2 },
                { text: "More than 10 years", score: 3 }
            ]
        },
        {
            text: "If your portfolio drops 20% in a month to market changes, you would:",
            options: [
                { text: "Sell everything immediately", score: 1 },
                { text: "Wait it out", score: 2 },
                { text: "Buy more at lower prices", score: 3 }
            ]
        }
    ];

    const mutation = useMutation({
        mutationFn: setRiskProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            alert('Risk Profile Updated!');
            onClose();
        }
    });

    const handleAnswer = (score: number) => {
        const newAnswers = [...answers, score];
        setAnswers(newAnswers);
        if (step < questions.length) {
            setStep(step + 1);
        } else {
            // Calculate total and submit
            const totalScore = newAnswers.reduce((a, b) => a + b, 0);
            mutation.mutate(totalScore);
        }
    };

    const currentQuestion = questions[step - 1];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-lg space-y-6 shadow-xl border animate-in fade-in zoom-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Risk Assessment</h2>
                        <p className="text-sm text-muted-foreground">Step {step} of {questions.length}</p>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
                    <div className="space-y-2">
                        {currentQuestion.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(opt.score)}
                                className="w-full text-right p-4 rounded-lg border hover:bg-muted hover:border-primary transition-all flex justify-between items-center group"
                            >
                                <span>{opt.text}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-primary">
                                    <Check size={16} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
