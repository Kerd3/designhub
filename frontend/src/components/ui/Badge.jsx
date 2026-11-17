import { cn } from '@/utils/format.js';

export const badgeTones = {
  neutral: 'bg-surface-2 text-ink',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  outline: 'bg-transparent text-muted ring-1 ring-inset ring-border-strong',
};

/** Small status label. Pair colour with an icon or text so meaning never relies on colour alone. */
export function Badge({ tone = 'neutral', icon: Icon, className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-caption font-medium',
        badgeTones[tone],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.25} />}
      <span className="truncate">{children}</span>
    </span>
  );
}
