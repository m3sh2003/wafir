
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const GEN_AI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export async function POST(req: Request) {
    const supabase = await createClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'AI Configuration Error' }, { status: 500 });
    }

    // Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const userMessage = body.message;

        if (!userMessage) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        // 1. Fetch Context Data from Supabase
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
        const { data: accounts } = await supabase.from('accounts').select('*');
        const { data: holdings } = await supabase.from('holdings').select('*, asset:assets(*)');
        // Transactions and Envelopes tables exist but might be empty, let's fetch if possible
        const { data: envelopes } = await supabase.from('envelopes').select('*');
        const { data: transactions } = await supabase.from('transactions').select('*').limit(5).order('date', { ascending: false });

        // Calculate Context
        const totalAssets = accounts?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0;
        const totalBudget = envelopes?.reduce((sum: number, env: any) => sum + Number(env.limit_amount), 0) || 0;

        const financialContext = {
            name: profile?.name || 'User',
            riskProfile: profile?.risk_profile || 'Balanced',
            budget: {
                totalAllocated: totalBudget,
                envelopes: envelopes?.map((e: any) => ({ name: e.name, limit: e.limit_amount }))
            },
            assets: {
                totalValue: totalAssets,
                accounts: accounts?.map((a: any) => ({ name: a.name, type: a.type, balance: a.balance }))
            },
            holdings: holdings?.map((h: any) => ({ name: h.instrument_code, units: h.units })),
            recentTransactions: transactions?.map((t: any) => `${t.type}: ${t.amount} ${t.currency}`)
        };

        const systemPrompt = `
            You are Wafir AI, an expert Islamic Finance Advisor.
            
            **User Financial Data:**
            ${JSON.stringify(financialContext, null, 2)}
            
            **Instructions:**
            - Use the provided data to answer the user's question directly.
            - If the user asks for an assessment, analyze their budget utilization and asset allocation.
            - Keep answers concise (under 3 paragraphs).
            - Always ensure advice is Sharia-compliant.

            User Question: "${userMessage}"
        `;

        // 2. Call Gemini API
        const response = await fetch(`${GEN_AI_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API Error:', errText);
            return NextResponse.json({ error: 'AI Service Unavailable' }, { status: 503 });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return NextResponse.json({ response: text || "I couldn't generate a response." });

    } catch (error) {
        console.error('AI Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
