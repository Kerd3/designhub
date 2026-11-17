import { AlertTriangle, Inbox, Loader2, RotateCw } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { Button } from './Button.jsx';

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-lg bg-surface-2 px-6 py-12 text-center', className)}>
      <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-4 font-sans text-body font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-small text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-3 py-12 text-small text-muted', className)}>
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', error, onRetry, className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-lg bg-danger-soft px-6 py-10 text-center', className)}>
      <AlertTriangle aria-hidden="true" className="size-7 text-danger" />
      <h3 className="mt-3 font-sans text-body font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-small text-muted">{error?.message ?? 'Please try again.'}</p>
      {onRetry && (
        <Button variant="outline" leftIcon={RotateCw} onClick={onRetry} className="mt-5">Try again</Button>
      )}
    </div>
  );
}

/** Placeholder block shown while content loads. Hidden from assistive tech. */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('animate-shimmer rounded-md bg-surface-3', className)} />;
}

export function SkeletonLoader({ variant = 'cards', count = 3, label = 'Loading content' }) {
  return (
    <div role="status" aria-label={label}>
      <span className="visually-hidden">{label}…</span>
      {variant === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="rounded-lg bg-surface p-5 ring-1 ring-border">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-6 h-2 w-full" />
            </div>
          ))}
        </div>
      )}
      {variant === 'table' && (
        <div className="rounded-lg bg-surface ring-1 ring-border">
          <Skeleton className="h-11 rounded-b-none rounded-t-lg" />
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-border px-4 py-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="ml-auto h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}
      {variant === 'stats' && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="rounded-lg bg-surface p-5 ring-1 ring-border">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-4 h-8 w-1/3" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
