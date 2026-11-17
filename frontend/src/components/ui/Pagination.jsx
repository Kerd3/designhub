import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/format.js';

function pageList(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageSize, total, onPageChange, className, itemLabel = 'items' }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = 'grid h-9 min-w-9 place-items-center rounded-md px-2 text-small font-medium transition-colors disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
      <p className="text-small text-muted" aria-live="polite">
        Showing <span className="font-medium text-ink tabular-nums">{from}–{to}</span> of <span className="font-medium text-ink tabular-nums">{total}</span> {itemLabel}
      </p>
      {pageCount > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            <button type="button" className={cn(btn, 'text-ink hover:bg-surface-2')} onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
          </li>
          {pageList(page, pageCount).map((p, i) => (
            <li key={`${p}-${i}`}>
              {p === '…' ? (
                <span aria-hidden="true" className="px-1 text-muted">…</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                  className={cn(btn, p === page ? 'bg-primary text-primary-ink' : 'text-ink hover:bg-surface-2')}
                >
                  {p}
                </button>
              )}
            </li>
          ))}
          <li>
            <button type="button" className={cn(btn, 'text-ink hover:bg-surface-2')} onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label="Next page">
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
