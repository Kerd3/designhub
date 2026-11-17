import { Link } from 'react-router';
import { cn } from '@/utils/format.js';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path d="M9 8h6.5a8 8 0 0 1 0 16H9z" className="fill-bg" />
      <rect x="18" y="8" width="5" height="16" rx="1" className="fill-primary dark:fill-primary" />
    </svg>
  );
}

/**
 * Brand wordmark link. The accessible name starts with the visible text
 * (WCAG 2.5.3) and a visually hidden suffix says where it goes.
 */
export function Wordmark({ to = '/', destination = 'home', subtitle, className, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={cn('inline-flex items-center gap-2.5 rounded-md text-ink', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-extrabold tracking-tight">DesignHub</span>
        {subtitle && <span className="mt-1 text-caption font-medium text-muted">{subtitle}</span>}
      </span>
      <span className="visually-hidden">, {destination}</span>
    </Link>
  );
}
