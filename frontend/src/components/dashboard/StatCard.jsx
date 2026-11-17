import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

/** Summary metric. The value comes from the dashboard service; this component only displays it. */
export function StatCard({ label, value, helper, icon: Icon, to }) {
  return (
    <div className="group relative flex flex-col rounded-lg bg-surface p-4 ring-1 ring-border transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-small font-medium text-muted">{label}</p>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-md bg-surface-2 text-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[2rem] font-bold leading-none tracking-tight text-ink tabular-nums" data-testid={`stat-${label}`}>{value}</p>
      {helper && <p className="mt-2 text-caption text-muted">{helper}</p>}
      {to && (
        <Link to={to} className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary after:absolute after:inset-0 after:rounded-lg after:content-['']">
          View<span className="visually-hidden"> {label.toLowerCase()}</span>
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
