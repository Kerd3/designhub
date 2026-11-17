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
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-sm bg-secondary px-2 py-1 text-caption font-medium text-bg shadow-md transition-opacity duration-150',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
          open ? 'opacity-100' : 'opacity-0',
        )}
        hidden={!open}
      >
        {content}
      </span>
    </span>
  );
}
