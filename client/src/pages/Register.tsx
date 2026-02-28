import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { registerSchema, type RegisterInput } from '../schemas/forms.schema';
import './AuthPage.css';

export function Register() {
    const { register: registerUser, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

    const onSubmit = async (data: RegisterInput) => {
        try {
            await registerUser(data.name, data.email, data.password);
            navigate('/');
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Registration failed. Please try again.';
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

                <h2 className="auth-heading">Create your account</h2>

                {errors.root && (
                    <div className="auth-error fade-in">
                        <AlertCircle size={16} />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field-group">
                        <label htmlFor="reg-name" className="field-label">Full Name</label>
                        <div className="input-wrapper">
                            <User size={16} className="input-icon" />
                            <input
                                id="reg-name"
                                type="text"
                                className={`input-field${errors.name ? ' input-error' : ''}`}
                                placeholder="Alex Kubrick"
                                autoFocus
                                {...register('name')}
                            />
                        </div>
                        {errors.name && <span className="field-error">{errors.name.message}</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="reg-email" className="field-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={16} className="input-icon" />
                            <input
                                id="reg-email"
                                type="email"
                                className={`input-field${errors.email ? ' input-error' : ''}`}
                                placeholder="you@studio.com"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && <span className="field-error">{errors.email.message}</span>}
                    </div>


                    <div className="field-group">
                        <label htmlFor="reg-password" className="field-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                id="reg-password"
                                type="password"
                                className={`input-field${errors.password ? ' input-error' : ''}`}
                                placeholder="At least 8 characters"
                                {...register('password')}
                            />
                        </div>
                        {errors.password && <span className="field-error">{errors.password.message}</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="reg-confirm" className="field-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                id="reg-confirm"
                                type="password"
                                className={`input-field${errors.confirmPassword ? ' input-error' : ''}`}
                                placeholder="••••••••"
                                {...register('confirmPassword')}
                            />
                        </div>
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
                    </div>

                    <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
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
