import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { Pagination } from './Pagination.jsx';

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' };

/**
 * Sortable, paginated table.
 * columns: [{ key, header, render?(row), sortable?, sortValue?(row), align?, hideBelow?: 'sm'|'md'|'lg'|'xl', className? }]
 * On narrow screens low-priority columns hide (hideBelow) and the rest scroll inside a focusable region.
 */
export function DataTable({
  caption, columns, rows, rowKey = 'id', initialSort, pageSize = 8, emptyState, onRowClick, itemLabel, className,
}) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const get = column.sortValue ?? ((row) => row[column.key]);
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va === vb) return 0;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * factor;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) => {
    setSort((s) => (s?.key === key ? { key, direction: s.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));
    setPage(1);
  };

  if (rows.length === 0 && emptyState) return emptyState;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div role="region" aria-label={caption} tabIndex={0} className="relative overflow-x-auto rounded-lg bg-surface ring-1 ring-border scrollbar-thin" data-focus-inset>
        <table className="w-full border-collapse text-left text-small">
          <caption className="visually-hidden">{caption}{sort ? `, sorted by ${columns.find((c) => c.key === sort.key)?.header} ${sort.direction === 'asc' ? 'ascending' : 'descending'}` : ''}</caption>
          <thead>
            <tr className="bg-surface-2">
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : column.sortable ? 'none' : undefined;
                const Icon = active ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn('whitespace-nowrap px-4 py-3 font-medium text-muted', column.align === 'right' && 'text-right', column.hideBelow && HIDE[column.hideBelow])}
                  >
                    {column.sortable ? (
                      <button type="button" onClick={() => toggleSort(column.key)} className={cn('-mx-1 inline-flex items-center gap-1.5 rounded-sm px-1 hover:text-ink', active && 'text-ink')}>
                        {column.header}
                        <Icon aria-hidden="true" className={cn('size-3.5', !active && 'opacity-50')} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? (e) => { if (!e.target.closest('a,button,select,input')) onRowClick(row); } : undefined}
                className={cn('border-t border-border transition-colors', onRowClick && 'cursor-pointer hover:bg-surface-2/60')}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3 align-middle text-ink', column.align === 'right' && 'text-right', column.hideBelow && HIDE[column.hideBelow], column.className)}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={currentPage} pageSize={pageSize} total={sorted.length} onPageChange={setPage} itemLabel={itemLabel} />
    </div>
  );
}
