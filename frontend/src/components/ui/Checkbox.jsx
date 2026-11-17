import { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/format.js';

export function Checkbox({ label, description, id: idProp, className, ref, ...rest }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="relative icon-align-5 grid size-5 shrink-0 place-items-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-describedby={description ? `${id}-desc` : undefined}
          className="peer size-5 cursor-pointer appearance-none rounded-sm bg-surface ring-1 ring-inset ring-border-strong transition-colors checked:bg-primary checked:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          {...rest}
        />
        <Check aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute size-3.5 text-primary-ink opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-small font-medium text-ink">{label}</label>
        {description && <span id={`${id}-desc`} className="block text-small text-muted">{description}</span>}
      </span>
    </div>
  );
}
