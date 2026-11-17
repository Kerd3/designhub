import { NavLink } from 'react-router';
import { cn } from '@/utils/format.js';

/** Sidebar / drawer link. NavLink sets aria-current="page" on the active route. */
export function NavigationItem({ to, icon: Icon, label, count, end = false, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex h-10 items-center gap-3 rounded-md px-3 text-small font-medium transition-colors',
          isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      {Icon && <Icon aria-hidden="true" className="size-5 shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span className="rounded-full bg-surface-3 px-2 text-caption font-semibold tabular-nums text-ink group-aria-[current=page]:bg-primary group-aria-[current=page]:text-primary-ink">
          {count}
          <span className="visually-hidden"> new</span>
        </span>
      )}
    </NavLink>
  );
}
