import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import './AuthPage.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login(email, password);
            navigate('/');
        } catch {
            // error displayed from store
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-glow" />

            <div className="auth-card glass-panel fade-in">
                {/* Brand Header */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">🎬</div>
                    <h1 className="text-gradient-accent">CineVision</h1>
                    <p className="auth-subtitle">AI-Powered Pre-Visualization Studio</p>
                </div>

                <h2 className="auth-heading">Welcome back</h2>

                {error && (
                    <div className="auth-error fade-in">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label htmlFor="login-email" className="field-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={16} className="input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                className="input-field"
                                placeholder="you@studio.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="login-password" className="field-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                id="login-password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary auth-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <><Loader2 size={16} className="spin-icon" /> Signing in...</> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="auth-link">Create one free</Link>
                </p>
            </div>
        </div>
    );
}
