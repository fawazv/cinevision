import { Outlet, NavLink } from 'react-router-dom';
import { Film, LayoutDashboard, Settings, User } from 'lucide-react';
import { clsx } from 'clsx';
import './MainLayout.css'; // We'll create this next

export function MainLayout() {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/projects', icon: Film, label: 'Projects' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="layout-root fade-in">
            <aside className="layout-sidebar glass-panel">
                <div className="sidebar-brand">
                    <span className="brand-icon">🎬</span>
                    <h1 className="brand-title text-gradient-accent">CineVision</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
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
                    <button className="user-profile-btn glass-panel">
                        <User size={18} />
                        <span>Developer</span>
                    </button>
                </div>
            </aside>

            <main className="layout-content">
                {/* Child routes render here */}
                <Outlet />
            </main>
        </div>
    );
}
