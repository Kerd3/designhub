import { useId, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { controlBase } from './Field.jsx';

/** Search field with a visually hidden label and a clear button. Escape also clears. */
export function SearchInput({ value, onChange, label = 'Search', placeholder = 'Search…', className, size = 'md', ...rest }) {
  const id = useId();
  const inputRef = useRef(null);
  return (
    <div className={cn('relative', className)} role="search">
      <label htmlFor={id} className="visually-hidden">{label}</label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault();
            onChange('');
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(controlBase, 'pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden', size === 'sm' ? 'h-9 text-small' : 'h-11')}
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
