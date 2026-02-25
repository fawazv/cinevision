import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

/**
 * Wraps protected routes. Redirects unauthenticated users to /login.
 * The `replace` prop avoids pushing the redirect to the history stack.
 */
export function AuthGuard() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
