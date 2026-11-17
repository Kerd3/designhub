import { cloneElement, useId, useState } from 'react';
import { cn } from '@/utils/format.js';

/**
 * Tooltip shown on hover and keyboard focus, dismissed with Escape.
 * It describes the trigger (aria-describedby); it never holds essential content.
 */
export function Tooltip({ content, side = 'bottom', children }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const trigger = cloneElement(children, {
    'aria-describedby': open ? id : undefined,
    onKeyDown: (e) => {
      if (e.key === 'Escape') hide();
      children.props.onKeyDown?.(e);
    },
  });

  return (
    <span className="relative inline-flex" onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={cn(
          // Grows out of the trigger (origin on the side facing it); `invisible` keeps it out of the a11y tree when closed.
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-sm bg-secondary px-2 py-1 text-caption font-medium text-bg shadow-md',
          'transition-[opacity,scale,visibility] duration-150 ease-[var(--ease-out-strong)]',
          side === 'bottom' ? 'top-full mt-2 origin-top' : 'bottom-full mb-2 origin-bottom',
          open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
