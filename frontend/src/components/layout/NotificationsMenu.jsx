import { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Bell, CheckCheck, Inbox, ListChecks, Activity, Settings2 } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { useOnClickOutside } from '@/hooks/useMisc.js';
import { cn, timeAgo } from '@/utils/format.js';

const ICONS = { inquiry: Inbox, task: ListChecks, activity: Activity };

/** Disclosure popover listing notifications. Escape closes and returns focus. */
export function NotificationsMenu({ notifications }) {
  const { items, unreadCount, markAllRead, status } = notifications;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const refs = useMemo(() => [buttonRef, panelRef], []);
  useOnClickOutside(refs, () => setOpen(false), open);

  const close = () => {
    setOpen(false);
    buttonRef.current?.querySelector('button')?.focus();
  };

  return (
    <div className="relative">
      <span ref={buttonRef}>
        <IconButton
          icon={Bell}
          label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          badge={unreadCount || undefined}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          tooltip={!open}
        />
      </span>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-label="Notifications"
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } }}
          className="fixed inset-x-3 top-16 z-40 animate-dialog-in rounded-lg bg-surface shadow-lg ring-1 ring-border sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
            <h2 className="font-display text-body font-bold text-ink">Notifications</h2>
            <button type="button" onClick={markAllRead} disabled={!unreadCount} className="inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-primary hover:underline disabled:text-muted disabled:no-underline">
              <CheckCheck aria-hidden="true" className="size-4" /> Mark all as read
            </button>
          </div>
          <div className="max-h-[min(60vh,420px)] overflow-y-auto px-2 pb-2 scrollbar-thin">
            {status === 'error' && <p role="alert" className="px-2 py-6 text-center text-small text-danger">Notifications could not load.</p>}
            {status === 'success' && items.length === 0 && (
              <p className="px-2 py-8 text-center text-small text-muted">You are all caught up.</p>
            )}
            <ul className="flex flex-col">
              {items.map((item) => {
                const Icon = ICONS[item.kind];
                const body = (
                  <>
                    <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full', item.unread ? 'bg-primary-soft text-primary' : 'bg-surface-2 text-muted')}>
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-small text-ink', item.unread && 'font-semibold')}>{item.title}</span>
                      <span className="block text-caption text-muted">{item.detail} · {timeAgo(item.at)}</span>
                    </span>
                    {item.unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary"><span className="visually-hidden">Unread</span></span>}
                  </>
                );
                return (
                  <li key={item.id}>
                    {item.to ? (
                      <Link to={item.to} onClick={() => setOpen(false)} className="flex gap-3 rounded-md px-2 py-2.5 hover:bg-surface-2">{body}</Link>
                    ) : (
                      <div className="flex gap-3 px-2 py-2.5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-surface-2 px-4 py-2.5 sm:rounded-b-lg">
            <Link to="/workspace/settings?tab=notifications" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-ink">
              <Settings2 aria-hidden="true" className="size-4" /> Notification preferences
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
