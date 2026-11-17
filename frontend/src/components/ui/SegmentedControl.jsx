import { useRef } from 'react';
import { cn } from '@/utils/format.js';

/**
 * Single-choice toggle group (radiogroup semantics), e.g. Grid / Table view.
 * options: [{ value, label, icon?, hideLabel? }]
 */
export function SegmentedControl({ label, options, value, onChange, size = 'md', className }) {
  const ref = useRef(null);
  const onKeyDown = (event) => {
    const index = options.findIndex((o) => o.value === value);
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    if (next === null) return;
    event.preventDefault();
    onChange(options[next].value);
    ref.current?.querySelectorAll('[role="radio"]')[next]?.focus();
  };
  return (
    <div ref={ref} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={cn('inline-flex rounded-md bg-surface-2 p-1', className)}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.hideLabel ? option.label : undefined}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors',
              size === 'sm' ? 'h-8 px-2.5 text-caption' : 'h-9 px-3 text-small',
              checked ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {option.icon && <option.icon aria-hidden="true" className="size-4" />}
            {!option.hideLabel && option.label}
          </button>
        );
      })}
    </div>
  );
}
