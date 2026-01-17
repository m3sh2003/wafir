export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// في وضع الـ Offline، سنستخدم LocalStorage كقاعدة بيانات بسيطة
const USERS_KEY = 'wafir_local_users';

export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 800));

        const users: any[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        const response = {
            access_token: 'mock-token-' + Math.random(),
            user: { id: user.id, email: user.email, name: user.name }
        };

        return response;
    },

    register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const users: any[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        
        if (users.find(u => u.email === email)) {
            throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
        }

        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            name
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        return {
            access_token: 'mock-token-' + newUser.id,
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        };
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
