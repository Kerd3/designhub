import { useId } from 'react';
import { cn } from '@/utils/format.js';
import { Field, controlBase } from './Field.jsx';

/** Multi-line input. Pass `maxLength` and `valueLength` to show a live character counter. */
export function Textarea({ label, hint, error, required, optional, id: idProp, className, rows = 5, maxLength, valueLength, ref, ...rest }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const counter = maxLength ? { value: valueLength ?? 0, max: maxLength } : undefined;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} counter={counter} className={className}>
      {(aria) => <textarea ref={ref} rows={rows} maxLength={maxLength} {...aria} {...rest} className={cn(controlBase, 'min-h-28 resize-y px-3.5 py-3 leading-relaxed')} />}
    </Field>
  );
}
