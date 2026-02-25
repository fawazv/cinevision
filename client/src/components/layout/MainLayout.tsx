import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
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
        </div>
    );
}
