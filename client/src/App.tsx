import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthGuard } from './components/auth/AuthGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProjectDesign } from './pages/ProjectDesign';

function DashboardPlaceholder() {
  return (
    <div className="fade-in" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Welcome to <span className="text-gradient-accent">CineVision</span>
        </h2>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem' }}>
          Your AI-powered 3D pre-visualization studio awaits.
        </p>
      </header>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Get Started</h3>
        <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>
          Upload a screenplay to begin generating 3D pre-viz scenes automatically, or jump straight into the scene editor.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary">Create New Project</button>
          <button className="btn-secondary">View Documentation</button>
        </div>
      </div>
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
          { index: true, element: <DashboardPlaceholder /> },
          { path: 'projects', element: <ProjectDesign /> },
          { path: 'settings', element: <div className="fade-in"><h2>Settings</h2><p className="text-muted">UI Pending...</p></div> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
