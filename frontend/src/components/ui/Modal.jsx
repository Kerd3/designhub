import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { useScrollLock } from '@/hooks/useMisc.js';
import { useFocusTrap } from '@/hooks/useFocusTrap.js';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' };

/**
 * Accessible modal dialog.
 * - Traps Tab focus, closes on Escape, restores focus to the trigger on close.
 * - variant "dialog": centred; becomes a bottom sheet on phones.
 * - variant "panel": slides in from the right edge (detail views).
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', variant = 'dialog', initialFocusRef, dismissible = true }) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  useScrollLock(open);
  useFocusTrap(dialogRef, open, { onEscape: dismissible ? onClose : undefined, initialFocusRef });

  if (!open) return null;

  const isPanel = variant === 'panel';
  return createPortal(
    <div className={cn('fixed inset-0 z-50 flex', isPanel ? 'justify-end' : 'items-end justify-center sm:items-center sm:p-6')}>
      <div aria-hidden="true" className="absolute inset-0 animate-fade-in bg-black/45" onClick={dismissible ? onClose : undefined} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex w-full flex-col bg-surface text-ink shadow-lg outline-none',
          isPanel
            ? 'h-full max-w-lg animate-panel-in sm:rounded-l-xl'
            : cn('max-h-[calc(100dvh-1rem)] animate-dialog-in rounded-t-xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-xl', SIZES[size]),
        )}
      >
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-h3 font-bold text-ink">{title}</h2>
            {description && <p id={descId} className="mt-1 text-small text-muted">{description}</p>}
          </div>
          {dismissible && (
            <button type="button" onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink">
              <X aria-hidden="true" className="size-5" />
            </button>
          )}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 scrollbar-thin sm:px-6 sm:pb-6">{children}</div>
        {footer && (
          <footer className="flex flex-col-reverse gap-2 bg-surface-2 px-5 py-4 sm:flex-row sm:justify-end sm:rounded-b-xl sm:px-6">{footer}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
