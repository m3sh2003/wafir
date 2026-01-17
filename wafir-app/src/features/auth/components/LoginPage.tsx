import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi, setToken, setUser } from '../api/auth';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // const navigate = useNavigate(); // Unused, using window.location for hard reload

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const data = await authApi.login(email, password);
            setToken(data.access_token);
            setUser(data.user);
            window.location.href = '/'; // Hard reload to reset query states
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20">
            <div className="bg-card p-8 rounded-xl shadow-lg border w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">Login to continue to Wafir</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 rounded-md border bg-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 rounded-md border bg-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                        Login
                    </button>
                </form>
                <div className="text-center text-sm">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
