import { useEffect } from 'react';

/**
 * Scroll entrances for elements marked [data-reveal] inside rootRef.
 * Content is visible by default; the hidden start state only applies once
 * main.jsx adds .reveal-ready (JS running, IntersectionObserver available,
 * no reduced-motion preference). New elements are picked up automatically.
 */
export function useReveal(rootRef, key) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !document.documentElement.classList.contains('reveal-ready')) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const scan = () => root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [rootRef, key]);
}
