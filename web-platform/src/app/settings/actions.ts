'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: { name: string; email?: string; risk_profile?: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('users')
        .update({
            name: formData.name,
            risk_profile: formData.risk_profile,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function updateSettings(settings: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Fetch existing first to merge? Or just patch jsonb
    // Supabase update on jsonb replaces the whole object usually unless using jsonb_set, 
    // but let's assume we pass the full settings object for now.

    const { error } = await supabase
        .from('users')
        .update({
            settings: settings
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}
