import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Overlays can stack (an edit dialog opened from a detail panel). Only the
// top-most trap handles Tab and Escape.
const stack = [];

/**
 * Keeps Tab focus inside `containerRef` while active, calls onEscape on Escape,
 * focuses the initial element on open and restores focus to the trigger on close.
 */
export function useFocusTrap(containerRef, active, { onEscape, initialFocusRef } = {}) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return undefined;
    const previouslyFocused = document.activeElement;
    const node = containerRef.current;
    // Prefer an explicit target, then the first form field (not the close button), then anything focusable.
    const target = initialFocusRef?.current
      ?? node?.querySelector('[data-autofocus]')
      ?? node?.querySelector('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])')
      ?? node?.querySelector(FOCUSABLE)
      ?? node;
    target?.focus({ preventScroll: true });
    const token = {};
    stack.push(token);

    const onKeyDown = (event) => {
      if (stack[stack.length - 1] !== token) return;
      // Let an open menu inside the overlay close itself first.
      if (event.key === 'Escape' && event.target instanceof Element && event.target.closest('[role="menu"]')) return;
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.stopPropagation();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const focusable = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const index = stack.indexOf(token);
      if (index !== -1) stack.splice(index, 1);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef]);
}
