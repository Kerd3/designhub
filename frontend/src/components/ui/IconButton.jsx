import { cn } from '@/utils/format.js';
import { Tooltip } from './Tooltip.jsx';

const variants = {
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  outline: 'text-ink bg-surface ring-1 ring-inset ring-border hover:bg-surface-2',
  solid: 'bg-primary text-primary-ink hover:bg-primary-hover',
  danger: 'text-danger hover:bg-danger-soft',
};
const sizes = { sm: 'size-8', md: 'size-10', lg: 'size-11' };

/** Icon-only button. `label` is required: it becomes the accessible name and the tooltip. */
export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'md', tooltip = true, className, badge, ...rest }) {
  const button = (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden="true" className={size === 'sm' ? 'size-4' : 'size-5'} />
      {badge ? (
        // Count drawn with CSS: the button's label already states it ("Notifications, 3 unread").
        <span
          aria-hidden="true"
          data-badge={badge}
          className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-secondary px-1 text-caption font-semibold leading-5 text-bg ring-2 ring-bg before:content-[attr(data-badge)]"
        />
      ) : null}
    </button>
  );
  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
}
