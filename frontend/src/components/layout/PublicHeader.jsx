import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { Button } from '@/components/ui';
import { useFocusTrap } from '@/hooks/useFocusTrap.js';
import { useScrollLock } from '@/hooks/useMisc.js';
import { Wordmark } from './Wordmark.jsx';

export const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/work', label: 'Our Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function DesktopLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative inline-flex h-11 items-center px-3 text-small font-medium transition-colors',
          'after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-200',
          isActive ? 'text-ink after:scale-x-100' : 'text-muted hover:text-ink after:scale-x-0 hover:after:scale-x-100',
        )
      }
    >
      {label}
    </NavLink>
  );
}

function MobileMenu({ open, onClose }) {
  const panelRef = useRef(null);
  useScrollLock(open);
  useFocusTrap(panelRef, open, { onEscape: onClose });
  if (!open) return null;

  return createPortal(
    <div ref={panelRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-bg lg:hidden">
      <div className="page-container flex h-18 shrink-0 items-center justify-between">
        <Wordmark onClick={onClose} />
        <button type="button" onClick={onClose} className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-small font-medium text-ink hover:bg-surface-2">
          <X aria-hidden="true" className="size-5" /> Close
        </button>
      </div>
      <nav aria-label="Main" className="page-container flex-1 overflow-y-auto pb-6 pt-4">
        <ul className="flex flex-col">
          {PUBLIC_NAV.map((item, i) => (
            <li key={item.to} className="animate-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn('flex items-center justify-between py-3 font-display text-h1 font-bold tracking-tight', isActive ? 'text-primary' : 'text-ink')
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && <span className="text-small font-sans font-medium text-muted">Current page</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="page-container flex flex-col gap-3 bg-surface-2 py-5">
        <Button to="/contact" size="lg" rightIcon={ArrowRight} onClick={onClose} fullWidth>Start a project</Button>
        <Button to="/workspace/login" size="lg" variant="outline" leftIcon={LayoutDashboard} onClick={onClose} fullWidth>Workspace login</Button>
      </div>
    </div>,
    document.body,
  );
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-bg">
      <div className="page-container flex h-18 items-center justify-between gap-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            {PUBLIC_NAV.map((item) => (
              <li key={item.to}><DesktopLink {...item} /></li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button to="/workspace/login" variant="ghost" leftIcon={LayoutDashboard}>Workspace login</Button>
          <Button to="/contact" rightIcon={ArrowRight}>Start a project</Button>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-small font-medium text-ink hover:bg-surface-2 lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" /> Menu
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
