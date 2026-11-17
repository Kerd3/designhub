import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/utils/format.js';
import { useOnClickOutside } from '@/hooks/useMisc.js';

/**
 * Menu button (WAI-ARIA menu pattern).
 * - Enter/Space/ArrowDown opens and focuses the first item; ArrowUp the last.
 * - Arrow keys, Home and End move between items; Escape closes and returns focus.
 * items: [{ label, icon, onSelect?, to?, tone?: 'danger', disabled? } | { divider: true }]
 */
export function Dropdown({ renderTrigger, items, header, align = 'end', className, menuLabel }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const refs = useMemo(() => [triggerRef, menuRef], []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);
  useOnClickOutside(refs, () => setOpen(false), open);

  const itemEls = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];
  const focusItem = (index) => {
    const els = itemEls();
    if (!els.length) return;
    els[(index + els.length) % els.length].focus();
  };

  const [pendingFocus, setPendingFocus] = useState(null);
  useEffect(() => {
    if (open && pendingFocus !== null) {
      focusItem(pendingFocus === 'last' ? -1 : 0);
      setPendingFocus(null);
    }
  }, [open, pendingFocus]);

  const onTriggerKeyDown = (event) => {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      setPendingFocus('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setPendingFocus('last');
    }
  };

  const onMenuKeyDown = (event) => {
    const els = itemEls();
    const index = els.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); focusItem(index + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusItem(0); }
    else if (event.key === 'End') { event.preventDefault(); focusItem(-1); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'Tab') { setOpen(false); }
  };

  const select = (item) => {
    if (item.disabled) return;
    close(!item.to);
    if (item.to) navigate(item.to);
    item.onSelect?.();
  };

  return (
    <div className={cn('relative', className)}>
      {renderTrigger({
        ref: triggerRef,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        onClick: () => setOpen((o) => !o),
        onKeyDown: onTriggerKeyDown,
      })}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={menuLabel}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute top-full z-40 mt-2 min-w-56 animate-dialog-in rounded-lg bg-surface p-1.5 shadow-lg ring-1 ring-border',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {header && <div className="px-3 pb-2 pt-1.5">{header}</div>}
          {items.map((item, i) =>
            item.divider ? (
              <div key={`d${i}`} role="separator" className="my-1.5 h-px bg-border" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={item.disabled || undefined}
                onClick={() => select(item)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-small outline-none transition-colors',
                  'hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none aria-disabled:opacity-50',
                  item.tone === 'danger' ? 'text-danger' : 'text-ink',
                )}
              >
                {item.icon && <item.icon aria-hidden="true" className="size-4 shrink-0" />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
