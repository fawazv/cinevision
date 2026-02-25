import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthGuard } from './components/auth/AuthGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectDesign } from './pages/ProjectDesign';
import { Settings } from './pages/Settings';

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
          { path: 'projects', element: <Projects /> },
          { path: 'projects/:id', element: <ProjectDetail /> },
          { path: 'projects/:id/scene/:sceneId', element: <ProjectDesign /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
