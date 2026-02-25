import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import './MainLayout.css';

export function MainLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/projects', icon: Film, label: 'Projects', end: false },
        { to: '/settings', icon: Settings, label: 'Settings', end: false },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Avatar initials from user's name
    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : '??';

    return (
        <div className="layout-root fade-in">
            <aside className="layout-sidebar glass-panel">
                <div className="sidebar-brand">
                    <span className="brand-icon">🎬</span>
                    <h1 className="brand-title text-gradient-accent">CineVision</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                clsx('nav-link', isActive && 'nav-link-active')
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile glass-panel">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <span className="user-name">{user?.name ?? 'User'}</span>
                            <span className="user-email">{user?.email ?? ''}</span>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="layout-content">
                <Outlet />
            </main>

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'hsl(222deg 20% 13%)',
                        color: 'hsl(220deg 15% 88%)',
                        border: '1px solid hsl(222deg 20% 22%)',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    },
                    success: {
                        iconTheme: { primary: 'hsl(158 64% 52%)', secondary: 'transparent' },
                    },
                    error: {
                        iconTheme: { primary: 'hsl(0 72% 65%)', secondary: 'transparent' },
                    },
                }}
            />
        </div>
    );
}
