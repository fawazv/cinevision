import { lazy, Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthGuard } from './components/auth/AuthGuard';

// ─── Eagerly loaded (small, always needed on first render) ────────────────────
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

// ─── Lazily loaded (large chunks, only needed on demand) ─────────────────────
// Projects uses moderate JS — fine to lazy load
const Projects = lazy(() => import('./pages/Projects').then((m) => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then((m) => ({ default: m.ProjectDetail })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

// ProjectDesign has Three.js + MediaPipe — the heaviest chunk; always lazy
const ProjectDesign = lazy(() => import('./pages/ProjectDesign').then((m) => ({ default: m.ProjectDesign })));

// ─── Page Fallback ────────────────────────────────────────────────────────────
function PageSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '1rem',
      color: 'hsl(215 14% 55%)',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid hsl(220 90% 58% / 0.2)',
        borderTopColor: 'hsl(220 90% 58%)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '0.875rem' }}>Loading…</span>
    </div>
  );
}

const router = createBrowserRouter([
  // Public routes — no auth required
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Protected routes — wrapped by AuthGuard
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          {
            path: 'projects',
            element: (
              <Suspense fallback={<PageSpinner />}>
                <Projects />
              </Suspense>
            ),
          },
          {
            path: 'projects/:id',
            element: (
              <Suspense fallback={<PageSpinner />}>
                <ProjectDetail />
              </Suspense>
            ),
          },
          {
            // 3D designer — laziest route; defers Three.js + MediaPipe until user enters
            path: 'projects/:id/scene/:sceneId',
            element: (
              <Suspense fallback={<PageSpinner />}>
                <ProjectDesign />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageSpinner />}>
                <Settings />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
