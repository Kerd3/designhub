import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import {
  LayoutGrid, FolderKanban, Building2, ListChecks, Inbox, Users, Settings, X, ExternalLink, Database,
} from 'lucide-react';
import { NavigationItem } from '@/components/ui';
import { useFocusTrap } from '@/hooks/useFocusTrap.js';
import { useScrollLock } from '@/hooks/useMisc.js';
import { useSettings } from '@/context/SettingsContext.jsx';
import { dataSourceLabel } from '@/services/apiClient.js';
import { Wordmark } from './Wordmark.jsx';

export const WORKSPACE_NAV = [
  { to: '/workspace', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/workspace/projects', label: 'Projects', icon: FolderKanban },
  { to: '/workspace/clients', label: 'Clients', icon: Building2 },
  { to: '/workspace/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/workspace/inquiries', label: 'Inquiries', icon: Inbox, countKey: 'newInquiries' },
  { to: '/workspace/team', label: 'Team', icon: Users },
  { to: '/workspace/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ counts, onNavigate }) {
  const { settings } = useSettings();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-4">
        <Wordmark to="/workspace" destination="workspace overview" subtitle={settings.workspace.name} onClick={onNavigate} />
      </div>
      <nav aria-label="Workspace" className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <ul className="flex flex-col gap-1">
          {WORKSPACE_NAV.map((item) => (
            <li key={item.to}>
              <NavigationItem to={item.to} icon={item.icon} label={item.label} end={item.end} count={item.countKey ? counts?.[item.countKey] : undefined} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-3 p-4">
        <p className="flex items-start gap-2 rounded-md bg-surface-2 px-3 py-3 text-caption text-muted">
          <Database aria-hidden="true" className="icon-align-4 size-4 shrink-0" />
          <span>{dataSourceLabel}. Fictional records; changes stay in this browser.</span>
        </p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-sm px-1 text-small font-medium text-muted hover:text-ink">
          <ExternalLink aria-hidden="true" className="size-4" /> View public website
        </Link>
      </div>
    </div>
  );
}

export function WorkspaceSidebar({ counts }) {
  return (
    <aside aria-label="Workspace sidebar" className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-surface ring-1 ring-border lg:block">
      <SidebarContent counts={counts} />
    </aside>
  );
}

/** Mobile navigation drawer. */
export function WorkspaceDrawer({ open, onClose, counts }) {
  const ref = useRef(null);
  useScrollLock(open);
  useFocusTrap(ref, open, { onEscape: onClose });
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div aria-hidden="true" className="absolute inset-0 animate-fade-in bg-black/45" onClick={onClose} />
      <div ref={ref} id="workspace-drawer" role="dialog" aria-modal="true" aria-label="Workspace navigation" className="relative h-full w-[min(20rem,86vw)] animate-drawer-in bg-surface shadow-lg">
        <button type="button" onClick={onClose} aria-label="Close navigation" className="absolute right-2 top-3 z-10 grid size-10 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink">
          <X aria-hidden="true" className="size-5" />
        </button>
        <SidebarContent counts={counts} onNavigate={onClose} />
      </div>
    </div>,
    document.body,
  );
}
