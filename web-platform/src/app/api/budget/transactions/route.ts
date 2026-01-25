import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
      *,
      envelope:envelopes(name)
    `)
        .eq('userId', user.id)
        .order('date', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(transactions);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, amount, type, envelopeId, date, notes } = body;

    // Validation
    if (type !== 'INCOME' && !envelopeId) {
        return NextResponse.json({ error: 'Envelope ID is required for expenses' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert([
            {
                description,
                amount,
                type: type || 'EXPENSE',
                envelopeId: type === 'INCOME' ? null : envelopeId,
                date: date || new Date().toISOString(),
                notes,
                currency: 'SAR',
                userId: user.id
            }
        ])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
