import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/format.js';

/** items: [{ label, to? }]. The last item is the current page. */
export function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-small text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {last || !item.to ? (
                <span aria-current={last ? 'page' : undefined} className={cn('truncate', last && 'font-medium text-ink')}>{item.label}</span>
              ) : (
                <Link to={item.to} className="truncate rounded-sm hover:text-ink hover:underline underline-offset-4">{item.label}</Link>
              )}
              {!last && <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
