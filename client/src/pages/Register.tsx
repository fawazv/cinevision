import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import './AuthPage.css';

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setLocalError('Password must be at least 8 characters.');
            return;
        }

        try {
            await register(name, email, password);
            navigate('/');
        } catch {
            // error displayed from store
        }
    };

    const displayError = localError || error;

    return (
        <div className="auth-page">
            <div className="auth-bg-glow" />

            <div className="auth-card glass-panel fade-in">
                <div className="auth-brand">
                    <div className="auth-brand-icon">🎬</div>
                    <h1 className="text-gradient-accent">CineVision</h1>
                    <p className="auth-subtitle">AI-Powered Pre-Visualization Studio</p>
                </div>

                <h2 className="auth-heading">Create your account</h2>

                {displayError && (
                    <div className="auth-error fade-in">
                        <AlertCircle size={16} />
                        <span>{displayError}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label htmlFor="reg-name" className="field-label">Full Name</label>
                        <div className="input-wrapper">
                            <User size={16} className="input-icon" />
                            <input
                                id="reg-name"
                                type="text"
                                className="input-field"
                                placeholder="Alex Kubrick"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="reg-email" className="field-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={16} className="input-icon" />
                            <input
                                id="reg-email"
                                type="email"
                                className="input-field"
                                placeholder="you@studio.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="reg-password" className="field-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                id="reg-password"
                                type="password"
                                className="input-field"
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="reg-confirm" className="field-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                id="reg-confirm"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary auth-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <><Loader2 size={16} className="spin-icon" /> Creating account...</> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
