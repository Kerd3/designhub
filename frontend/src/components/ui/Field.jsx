import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/format.js';

/**
 * Label + control + helper/error text with correct ARIA wiring.
 * Children is a render function receiving the props the control must spread.
 */
export function Field({ id, label, hint, error, required, optional, counter, hideLabel, className, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const counterId = counter ? `${id}-counter` : undefined;
  const describedBy = [errorId, hintId, counterId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={id} className={cn('text-small font-medium text-ink', hideLabel && 'visually-hidden')}>
          {label}
          {required && <span aria-hidden="true" className="text-danger"> *</span>}
          {optional && <span className="font-normal text-muted"> (optional)</span>}
        </label>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {(error || hint || counter) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {error ? (
              <p id={errorId} className="flex items-start gap-2 text-small text-danger">
                <AlertCircle aria-hidden="true" className="icon-align-4 size-4 shrink-0" />
                <span>{error}</span>
              </p>
            ) : hint ? (
              <p id={hintId} className="text-small text-muted">{hint}</p>
            ) : null}
          </div>
          {counter && (
            <p id={counterId} className={cn('shrink-0 text-caption tabular-nums', counter.value > counter.max ? 'text-danger' : 'text-muted')}>
              <span className="visually-hidden">Characters used: </span>
              {counter.value}/{counter.max}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const controlBase =
  'w-full rounded-md bg-surface text-body text-ink placeholder:text-subtle ring-1 ring-inset ring-border-strong ' +
  'transition-[box-shadow,background-color] duration-150 hover:ring-muted ' +
  'focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-primary ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:ring-border ' +
  'aria-invalid:ring-2 aria-invalid:ring-danger';
