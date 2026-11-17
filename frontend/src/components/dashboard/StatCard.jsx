import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

/**
 * Summary metric. The value comes from the dashboard service; this component only displays it.
 * The number is the focal point: the label is quiet, and the whole card is one link
 * (no extra accent-coloured "View" text competing with the page's primary action).
 */
export function StatCard({ id, label, value, helper, icon: Icon, to }) {
  return (
    <div className="group relative flex flex-col rounded-lg bg-surface p-4 ring-1 ring-border shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-2">
        {to ? (
          <Link to={to} className="text-small font-medium text-muted after:absolute after:inset-0 after:rounded-lg after:content-[''] group-hover:text-ink focus-visible:outline-none">
            {label}
          </Link>
        ) : (
          <p className="text-small font-medium text-muted">{label}</p>
        )}
        {Icon && (
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 text-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary">
            <Icon className="size-4 group-hover:hidden" />
            <ArrowUpRight className="hidden size-4 group-hover:block" />
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-h2 font-bold leading-none tracking-tight text-ink tabular-nums" data-testid={`stat-${id}`}>{value}</p>
      {helper && <p className="mt-2 text-caption text-muted">{helper}</p>}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-lg ring-2 ring-primary opacity-0 group-has-[:focus-visible]:opacity-100" />
    </div>
  );
}
