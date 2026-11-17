import { Activity, Building2, FolderKanban, Inbox, ListChecks, Users } from 'lucide-react';
import { formatDateTime, timeAgo } from '@/utils/format.js';

const ICONS = { project: FolderKanban, task: ListChecks, inquiry: Inbox, client: Building2, team: Users };

export function ActivityFeed({ items, limit = 6 }) {
  if (!items.length) return <p className="py-6 text-center text-small text-muted">No activity yet. Changes you make appear here.</p>;
  return (
    <ol className="flex flex-col">
      {items.slice(0, limit).map((item, i) => {
        const Icon = ICONS[item.type] ?? Activity;
        const last = i === Math.min(limit, items.length) - 1;
        return (
          <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute left-4 top-9 h-[calc(100%-2.5rem)] w-0.5 rounded-full bg-surface-3" />}
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-small text-ink">{item.message}</p>
              <p className="mt-1 text-caption text-muted">
                {item.actor} · <time dateTime={item.at} title={formatDateTime(item.at)}>{timeAgo(item.at)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
