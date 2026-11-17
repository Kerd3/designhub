import { useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { PublicHeader } from '@/components/layout/PublicHeader.jsx';
import { PublicFooter } from '@/components/layout/PublicFooter.jsx';
import { useReveal } from '@/hooks/useReveal.js';

export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed left-4 top-3 z-[70] -translate-y-24 rounded-md bg-secondary px-4 py-3 text-small font-medium text-bg transition-transform focus:translate-y-0"
    >
      Skip to main content
    </a>
  );
}

export default function PublicLayout() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  useReveal(mainRef, pathname);

  return (
    <div id="top" className="flex min-h-dvh flex-col">
      <SkipLink />
      <PublicHeader />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <PublicFooter />
      <ScrollRestoration />
    </div>
  );
}
