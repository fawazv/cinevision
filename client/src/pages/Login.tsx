import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { loginSchema, type LoginInput } from '../schemas/forms.schema';
import './AuthPage.css';

export function Login() {
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginInput) => {
        try {
            await login(data.email, data.password);
            navigate('/');
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Invalid email or password';
            setError('root', { message: msg });
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-glow" />
            <div className="auth-card glass-panel">
                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">🎬</div>
                    <h1 className="text-gradient-accent">CineVision</h1>
                    <p className="auth-subtitle">AI-Powered Pre-Visualization Studio</p>
                </div>

                <h2 className="auth-heading">Welcome back</h2>

                {errors.root && (
                    <div className="auth-error fade-in">
                        <AlertCircle size={16} />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field-group">
                        <label htmlFor="login-email" className="field-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={16} className="input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                className={`input-field${errors.email ? ' input-error' : ''}`}
                                placeholder="you@studio.com"
                                autoFocus
                                {...register('email')}
                            />
                        </div>
                        {errors.email && <span className="field-error">{errors.email.message}</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="login-password" className="field-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                id="login-password"
                                type="password"
                                className={`input-field${errors.password ? ' input-error' : ''}`}
                                placeholder="••••••••"
                                {...register('password')}
                            />
                        </div>
                        {errors.password && <span className="field-error">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
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
