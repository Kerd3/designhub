import { useId, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { Button } from './Button.jsx';

/**
 * Groups a search field and filter controls.
 * Desktop: one row. Phones: the filters collapse behind a "Filters (n)" disclosure
 * so the list stays on screen.
 */
export function FilterPanel({ search, children, activeCount = 0, onClear, resultLabel, className }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <section aria-label="Search and filters" className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">{search}</div>
        <Button
          variant="outline"
          className="md:hidden"
          leftIcon={SlidersHorizontal}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </div>
      <div id={panelId} className={cn('flex-col gap-3 md:flex md:flex-row md:flex-wrap md:items-end', open ? 'flex' : 'hidden')}>
        {children}
        {activeCount > 0 && onClear && (
          <Button variant="ghost" leftIcon={X} onClick={onClear} className="self-start md:self-end">
            Clear filters
          </Button>
        )}
      </div>
      {resultLabel && <p className="text-small text-muted" aria-live="polite">{resultLabel}</p>}
    </section>
  );
}
