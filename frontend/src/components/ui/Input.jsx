import { useId } from 'react';
import { cn } from '@/utils/format.js';
import { Field, controlBase } from './Field.jsx';

/**
 * Text input with label, helper text, error and optional icons.
 * States: default, focused (ring), disabled, invalid (error prop), with helper text (hint prop).
 */
export function Input({
  label, hint, error, required, optional, hideLabel, leftIcon: LeftIcon, rightSlot,
  id: idProp, className, inputClassName, size = 'md', ref, ...rest
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} hideLabel={hideLabel} className={className}>
      {(aria) => (
        <div className="relative">
          {LeftIcon && <LeftIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />}
          <input
            ref={ref}
            {...aria}
            {...rest}
            className={cn(controlBase, size === 'sm' ? 'h-9 px-3 text-small' : 'h-11 px-4', LeftIcon && 'pl-9', rightSlot && 'pr-11', inputClassName)}
          />
          {rightSlot && <div className="absolute inset-y-0 right-1 flex items-center">{rightSlot}</div>}
        </div>
      )}
    </Field>
  );
}
