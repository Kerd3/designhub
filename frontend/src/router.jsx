import { createBrowserRouter } from 'react-router';
import PublicLayout from '@/layouts/PublicLayout.jsx';
import HomePage from '@/pages/public/HomePage.jsx';
import NotFoundPage from '@/pages/public/NotFoundPage.jsx';
import { RouteError } from '@/pages/RouteError.jsx';

/** Code-split route: the module's default export becomes the route component. */
const page = (load) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', lazy: page(() => import('@/pages/public/ServicesPage.jsx')) },
      { path: 'work', lazy: page(() => import('@/pages/public/WorkPage.jsx')) },
      { path: 'work/:slug', lazy: page(() => import('@/pages/public/CaseStudyPage.jsx')) },
      { path: 'about', lazy: page(() => import('@/pages/public/AboutPage.jsx')) },
      { path: 'contact', lazy: page(() => import('@/pages/public/ContactPage.jsx')) },
      { path: 'design-system', lazy: page(() => import('@/pages/public/DesignSystemPage.jsx')) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: 'workspace/login', errorElement: <RouteError />, lazy: page(() => import('@/pages/workspace/LoginPage.jsx')) },
  {
    path: 'workspace',
    errorElement: <RouteError />,
    lazy: page(() => import('@/layouts/WorkspaceLayout.jsx')),
    children: [
      { index: true, lazy: page(() => import('@/pages/workspace/OverviewPage.jsx')) },
      { path: 'projects', lazy: page(() => import('@/pages/workspace/ProjectsPage.jsx')) },
      { path: 'projects/:projectId', lazy: page(() => import('@/pages/workspace/ProjectDetailPage.jsx')) },
      { path: 'clients', lazy: page(() => import('@/pages/workspace/ClientsPage.jsx')) },
      { path: 'tasks', lazy: page(() => import('@/pages/workspace/TasksPage.jsx')) },
      { path: 'inquiries', lazy: page(() => import('@/pages/workspace/InquiriesPage.jsx')) },
      { path: 'team', lazy: page(() => import('@/pages/workspace/TeamPage.jsx')) },
      { path: 'settings', lazy: page(() => import('@/pages/workspace/SettingsPage.jsx')) },
    ],
  },
]);
