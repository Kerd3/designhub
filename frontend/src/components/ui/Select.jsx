import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/format.js';
import { Field, controlBase } from './Field.jsx';

/**
 * Native <select> styled to the system (keeps full keyboard and screen-reader support).
 * `options` is an array of strings or { value, label }.
 */
export function Select({ label, hint, error, required, optional, hideLabel, options = [], placeholder, id: idProp, className, size = 'md', ref, ...rest }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} hideLabel={hideLabel} className={className}>
      {(aria) => (
        <div className="relative">
          <select
            ref={ref}
            {...aria}
            {...rest}
            className={cn(controlBase, 'appearance-none pr-10', size === 'sm' ? 'h-9 pl-3 text-small' : 'h-11 pl-4')}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => {
              const { value, label: text } = typeof option === 'string' ? { value: option, label: option } : option;
              return <option key={value} value={value}>{text}</option>;
            })}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>
      )}
    </Field>
  );
}
