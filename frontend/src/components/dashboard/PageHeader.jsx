import { cn } from '@/utils/format.js';

/** Workspace page heading: the page's h1, a short description and primary actions. */
export function PageHeader({ title, description, actions, children, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8', className)}>
      <div className="min-w-0">
        {children}
        <h1 className="font-display text-h2 font-bold text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-body text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
