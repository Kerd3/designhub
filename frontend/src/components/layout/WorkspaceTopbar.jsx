import { useEffect, useState } from 'react';
import { Menu, Search, LogOut, Settings, ExternalLink, ChevronDown } from 'lucide-react';
import { Avatar, Dropdown, IconButton } from '@/components/ui';
import { useSettings } from '@/context/SettingsContext.jsx';
import { GlobalSearch } from './GlobalSearch.jsx';
import { NotificationsMenu } from './NotificationsMenu.jsx';

export function WorkspaceTopbar({ title, onOpenMenu, menuOpen, onLogout, notifications }) {
  const { settings } = useSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-bg/95 ring-1 ring-border lg:bg-bg">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-6">
        <IconButton icon={Menu} label="Open navigation" className="lg:hidden" onClick={onOpenMenu} aria-expanded={menuOpen} aria-controls="workspace-drawer" tooltip={false} />
        <p className="min-w-0 flex-1 truncate font-display text-[1.0625rem] font-bold text-ink" aria-hidden="true">{title}</p>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-10 w-64 items-center gap-2 rounded-md bg-surface px-3 text-small text-muted ring-1 ring-inset ring-border hover:ring-border-strong md:inline-flex"
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="flex-1 text-left">Search workspace</span>
          <kbd className="rounded-sm bg-surface-2 px-1.5 text-caption font-medium">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <IconButton icon={Search} label="Search workspace" className="md:hidden" onClick={() => setSearchOpen(true)} />

        <NotificationsMenu notifications={notifications} />

        <Dropdown
          menuLabel="Account"
          header={
            <div className="min-w-0">
              <p className="truncate text-small font-semibold text-ink">{settings.profile.name}</p>
              <p className="truncate text-caption text-muted">{settings.profile.email}</p>
            </div>
          }
          items={[
            { label: 'Profile and settings', icon: Settings, to: '/workspace/settings' },
            { label: 'View public website', icon: ExternalLink, to: '/' },
            { divider: true },
            { label: 'Exit demo', icon: LogOut, onSelect: onLogout, tone: 'danger' },
          ]}
          renderTrigger={(props) => (
            <button type="button" {...props} aria-label={`Account menu for ${settings.profile.name}`} className="ml-1 inline-flex h-10 items-center gap-2 rounded-md pl-1 pr-1.5 hover:bg-surface-2 sm:pr-2">
              <Avatar name={settings.profile.name} size="sm" decorative />
              <span className="hidden max-w-32 truncate text-small font-medium text-ink xl:block">{settings.profile.name}</span>
              <ChevronDown aria-hidden="true" className="hidden size-4 text-muted sm:block" />
            </button>
          )}
        />
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
