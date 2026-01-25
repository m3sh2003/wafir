import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useSettings } from '../../../contexts/SettingsContext';
import { supabase } from '../../../lib/supabase';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AiAdvisorPage() {
    const { t } = useTranslation();
    const { profile } = useSettings();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: t('ai_welcome_message') || `Hello ${profile?.name || 'there'}! I am your Wafir AI Advisor. I can help you analyze your portfolio, suggest rebalancing strategies, or answer financial questions. How can I assist you today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Get valid token from Supabase session
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            if (!token) throw new Error('Authentication session missing');

            // Serverless: AI Requests go to Next.js API (External)
            let apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:3000';
            if (apiUrl.endsWith('/')) {
                apiUrl = apiUrl.slice(0, -1);
            }

            const response = await fetch(`${apiUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();

            // Backend returns { error: '...' } not message
            if (!response.ok) throw new Error(data.error || data.message || 'AI request failed');

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error('AI Error:', error);
            // Re-calculate sanitized URL for error message or assume 'apiUrl' from scope is not available in catch block in older JS engines (safe to redeclare or just use raw env)
            let rawUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:3000';
            if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error.message || 'Unknown error'}.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col p-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('ai_advisor') || "AI Advisor"}</h1>
                    <p className="text-muted-foreground text-sm">{t('powered_by_gemini') || "Powered by Advanced AI"}</p>
                </div>
            </div>

            <div className="flex-1 bg-card border shadow-sm rounded-xl overflow-hidden flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted rounded-tl-none'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                <span className="text-[10px] opacity-50 mt-1 block">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <div className="flex gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={t('ask_ai_anything') || "Ask me anything about your portfolio..."}
                            className="flex-1 min-h-[50px] max-h-[150px] p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
