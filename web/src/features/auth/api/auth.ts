import { supabase } from '../../../lib/supabase';

export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);
        if (!data.session || !data.user) throw new Error('No session created');

        return {
            access_token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name,
            },
        };
    },

    register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });

        if (error) throw new Error(error.message);
        if (!data.session || !data.user) throw new Error('Registration successful but no session (confirm email?)');

        return {
            access_token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name,
            },
        };
    },

    logout: async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('sb-access-token'); // Clear legacy if needed
    }
};

// Helper to get the current JWT synchronously if possible, or we might need to rely on Supabase's internal state
export const getToken = () => {
    // Supabase persists session to localStorage by default with key `sb-<ref>-auth-token`
    // But for simplicity, we can also ask Supabase for the current session if we are in an async context.
    // However, apiClient calls this synchronously. 
    // Let's try to get it from the local storage key Supabase uses, or fallback to the one we manually set if we were to set it.
    // actually, let's just use supabase.auth.getSession() in apiClient since it is async.
    // For now, return null here and we will update apiClient to use supabase.
    return null;
};

// We will deprecate these manual storage helpers in favor of Supabase's auto persistence
export const setToken = (_token: string) => { };
export const removeToken = () => { };
export const getUser = () => {
    // This is a bit tricky sync. Better to use useUser hook or similar.
    // For now, let's return null.
    return null;
};
export const setUser = (_user: User) => { };
export const removeUser = () => { };
