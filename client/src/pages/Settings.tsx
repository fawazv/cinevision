import { useState, useEffect } from 'react';
import { User, Lock, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../api/client';
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

    // Profile section state
    const [name, setName] = useState(user?.name ?? '');
    const [isSavingName, setIsSavingName] = useState(false);

    // Password section state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Member since date
    const [memberSince, setMemberSince] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get<{ data: UserProfile }>('/users/me').then((res: unknown) => {
            const data = (res as { data: UserProfile }).data;
            setMemberSince(new Date(data.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
            }));
        }).catch(() => {
            // Error is auto-toasted by the interceptor
        });
    }, []);

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSavingName(true);
        try {
            await apiClient.put('/users/me/name', { name });
            toast.success('Display name updated!');
        } finally {
            setIsSavingName(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters.');
            return;
        }
        setIsSavingPassword(true);
        try {
            await apiClient.put('/users/me/password', { currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } finally {
            setIsSavingPassword(false);
        }
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
                        {memberSince && (
                            <p className="profile-since">Member since {memberSince}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Display Name Section */}
            <div className="settings-card glass-panel">
                <div className="settings-section-header">
                    <User size={18} />
                    <h3>Display Name</h3>
                </div>
                <form onSubmit={handleSaveName} className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            minLength={2}
                            maxLength={50}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary settings-btn"
                        disabled={isSavingName || !name.trim() || name === user?.name}
                    >
                        {isSavingName ? (
                            <><Loader2 size={16} className="spin" /> Saving...</>
                        ) : (
                            <><Save size={16} /> Save Name</>
                        )}
                    </button>
                </form>
            </div>

            {/* Change Password Section */}
            <div className="settings-card glass-panel">
                <div className="settings-section-header">
                    <Lock size={18} />
                    <h3>Change Password</h3>
                </div>
                <form onSubmit={handleChangePassword} className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            required
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <span className="form-error">Passwords do not match.</span>
                        )}
                        {newPassword && confirmPassword && newPassword === confirmPassword && (
                            <span className="form-success">
                                <CheckCircle size={13} /> Passwords match!
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="btn-primary settings-btn"
                        disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                        {isSavingPassword ? (
                            <><Loader2 size={16} className="spin" /> Changing...</>
                        ) : (
                            <><Lock size={16} /> Change Password</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
