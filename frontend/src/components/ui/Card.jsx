import { cn } from '@/utils/format.js';

/**
 * Surface container. `interactive` adds the hover lift used for clickable cards.
 * Variants: default (white + border), muted (tone step, no border), outline.
 */
export function Card({ as: Tag = 'div', variant = 'default', interactive = false, padding = 'md', className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'rounded-lg',
        variant === 'default' && 'bg-surface ring-1 ring-border shadow-sm',
        variant === 'muted' && 'bg-surface-2',
        variant === 'outline' && 'ring-1 ring-border',
        padding === 'md' && 'p-5 sm:p-6',
        padding === 'sm' && 'p-4',
        padding === 'none' && 'p-0',
        interactive && 'transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, titleAs: Title = 'h2', className, id }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <Title id={id} className="font-sans text-body font-semibold text-ink">{title}</Title>
        {description && <p className="mt-1 text-small text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
