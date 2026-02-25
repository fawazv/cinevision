import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../api/client';
import {
    updateNameSchema, changePasswordSchema,
    type UpdateNameInput, type ChangePasswordInput,
} from '../schemas/forms.schema';
import toast from 'react-hot-toast';
import './Settings.css';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export function Settings() {
    const { user } = useAuthStore();

    // ── Name form ─────────────────────────────────────────────────────────────
    const {
        register: regName,
        handleSubmit: submitName,
        reset: resetName,
        formState: { errors: nameErrors, isSubmitting: isSavingName, isDirty: isNameDirty },
    } = useForm<UpdateNameInput>({
        resolver: zodResolver(updateNameSchema),
        defaultValues: { name: user?.name ?? '' },
    });

    // ── Password form ─────────────────────────────────────────────────────────
    const {
        register: regPwd,
        handleSubmit: submitPwd,
        reset: resetPwd,
        formState: { errors: pwdErrors, isSubmitting: isSavingPwd },
    } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

    // ── Load profile (for member-since date) ──────────────────────────────────
    useEffect(() => {
        apiClient.get<unknown>('/users/me').then((res: unknown) => {
            const data = (res as { data: UserProfile }).data;
            resetName({ name: data.name });
        }).catch(() => { /* interceptor handles toast */ });
    }, [resetName]);

    const onSaveName = async (data: UpdateNameInput) => {
        await apiClient.put('/users/me/name', { name: data.name });
        toast.success('Display name updated!');
    };

    const onChangePassword = async (data: ChangePasswordInput) => {
        await apiClient.put('/users/me/password', {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
        toast.success('Password changed successfully!');
        resetPwd();
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : '??';

    return (
        <div className="settings-page fade-in">
            <header className="settings-header">
                <h2 className="settings-title">Settings</h2>
                <p className="settings-subtitle">Manage your CineVision account</p>
            </header>

            {/* Avatar Card */}
            <div className="settings-card glass-panel">
                <div className="profile-avatar-row">
                    <div className="profile-avatar-large">{initials}</div>
                    <div>
                        <p className="profile-name-large">{user?.name}</p>
                        <p className="profile-email-large">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Display Name */}
            <div className="settings-card glass-panel">
                <div className="settings-section-header">
                    <User size={18} />
                    <h3>Display Name</h3>
                </div>
                <form onSubmit={submitName(onSaveName)} className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className={`form-input${nameErrors.name ? ' input-error' : ''}`}
                            placeholder="Your full name"
                            {...regName('name')}
                        />
                        {nameErrors.name && <span className="field-error">{nameErrors.name.message}</span>}
                    </div>
                    <button
                        type="submit"
                        className="btn-primary settings-btn"
                        disabled={isSavingName || !isNameDirty}
                    >
                        {isSavingName ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Name</>}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="settings-card glass-panel">
                <div className="settings-section-header">
                    <Lock size={18} />
                    <h3>Change Password</h3>
                </div>
                <form onSubmit={submitPwd(onChangePassword)} className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className={`form-input${pwdErrors.currentPassword ? ' input-error' : ''}`}
                            placeholder="Enter current password"
                            {...regPwd('currentPassword')}
                        />
                        {pwdErrors.currentPassword && <span className="field-error">{pwdErrors.currentPassword.message}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className={`form-input${pwdErrors.newPassword ? ' input-error' : ''}`}
                            placeholder="Min. 8 characters, upper + lower + number"
                            {...regPwd('newPassword')}
                        />
                        {pwdErrors.newPassword && <span className="field-error">{pwdErrors.newPassword.message}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className={`form-input${pwdErrors.confirmPassword ? ' input-error' : ''}`}
                            placeholder="Repeat new password"
                            {...regPwd('confirmPassword')}
                        />
                        {pwdErrors.confirmPassword && <span className="field-error">{pwdErrors.confirmPassword.message}</span>}
                    </div>
                    <button
                        type="submit"
                        className="btn-primary settings-btn"
                        disabled={isSavingPwd}
                    >
                        {isSavingPwd ? <><Loader2 size={16} className="spin" /> Changing...</> : <><Lock size={16} /> Change Password</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
