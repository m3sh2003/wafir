export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

const API_URL = '/api';

export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    }
};

export const getToken = () => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
export const setUser = (user: User) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');
