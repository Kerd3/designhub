import { useId, useRef, useState } from 'react';
import { cn } from '@/utils/format.js';

/**
 * Tabs (WAI-ARIA tabs pattern, automatic activation).
 * tabs: [{ id, label, count?, content }]. Controlled via value/onChange or uncontrolled.
 */
export function Tabs({ tabs, value, onChange, defaultValue, label, className, panelClassName }) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id);
  const active = value ?? internal;
  const listRef = useRef(null);

  const activate = (id) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const onKeyDown = (event) => {
    const index = tabs.findIndex((t) => t.id === active);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    activate(tabs[next].id);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  const current = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="relative flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1 scrollbar-thin">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected && tab.content !== undefined ? `${baseId}-panel-${tab.id}` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => activate(tab.id)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-4 text-small font-medium transition-colors',
                selected ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn('rounded-full px-2 text-caption tabular-nums', selected ? 'bg-primary-soft text-primary' : 'bg-surface-3 text-muted')}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {current?.content !== undefined && (
        <div
          id={`${baseId}-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${current.id}`}
          tabIndex={0}
          className={cn('mt-5 outline-none', panelClassName)}
        >
          {current.content}
        </div>
      )}
    </div>
  );
}
