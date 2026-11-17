import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext.jsx';
import { useSettings } from '@/context/SettingsContext.jsx';
import { useToast } from '@/components/ui';
import { WorkspaceSidebar, WorkspaceDrawer, WORKSPACE_NAV } from '@/components/layout/WorkspaceSidebar.jsx';
import { WorkspaceTopbar } from '@/components/layout/WorkspaceTopbar.jsx';
import { SkipLink } from '@/layouts/PublicLayout.jsx';
import { useNotifications } from '@/hooks/useNotifications.js';
import { dashboardService } from '@/services/dashboardService.js';

function titleFor(pathname) {
  if (/^\/workspace\/projects\/[^/]+/.test(pathname)) return 'Project details';
  const match = [...WORKSPACE_NAV].sort((a, b) => b.to.length - a.to.length).find((item) => pathname.startsWith(item.to));
  return match?.label ?? 'Workspace';
}

/**
 * Shell for every /workspace page: demo-session guard, theme, sidebar,
 * mobile drawer, top bar and live counts. Children re-render on navigation;
 * counts and notifications refresh on every route change.
 */
export default function WorkspaceLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { settings, resolvedTheme } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [counts, setCounts] = useState(null);
  const mainRef = useRef(null);
  const loggingOut = useRef(false);
  const title = titleFor(location.pathname);

  // Theme applies to the whole document while the workspace is mounted (portals included).
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#121316' : '#f6f4ef');
    return () => {
      delete document.documentElement.dataset.theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f6f4ef');
    };
  }, [resolvedTheme]);

  useEffect(() => {
    document.title = `${title} · ${settings.workspace.name} workspace`;
    let meta = document.head.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  }, [title, settings.workspace.name]);

  // Live sidebar counts; refreshed whenever the route changes (after edits elsewhere).
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const controller = new AbortController();
    dashboardService.getSummary({ signal: controller.signal }).then((s) => setCounts(s.totals)).catch(() => {});
    return () => controller.abort();
  }, [location.key, isAuthenticated]);

  const prefs = useMemo(() => settings.notifications, [settings.notifications]);
  const notifications = useNotifications(prefs, location.key);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  if (!isAuthenticated) {
    // After "Exit demo" there is nowhere to return to; otherwise remember the requested page.
    if (loggingOut.current) return <Navigate to="/workspace/login" replace />;
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/workspace/login?next=${next}`} replace />;
  }

  const handleLogout = () => {
    loggingOut.current = true;
    logout();
    toast.info('You have left the demo workspace', 'Your demo data stays in this browser until you reset it.');
    navigate('/workspace/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <SkipLink />
      <WorkspaceSidebar counts={counts} />
      <WorkspaceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} counts={counts} />
      <div className="lg:pl-64">
        <WorkspaceTopbar title={title} onOpenMenu={() => setDrawerOpen(true)} menuOpen={drawerOpen} onLogout={handleLogout} notifications={notifications} />
        <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
