import { useId } from 'react';
import { cn } from '@/utils/format.js';

export function RadioButton({ label, description, id: idProp, className, ...rest }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        id={id}
        type="radio"
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-full bg-surface ring-1 ring-inset ring-border-strong transition-shadow checked:ring-[6px] checked:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      />
      <span className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-small font-medium text-ink">{label}</label>
        {description && <span id={`${id}-desc`} className="block text-small text-muted">{description}</span>}
      </span>
    </div>
  );
}

/** A labelled group of radio buttons sharing one `name`. */
export function RadioGroup({ legend, name, options, value, onChange, className, orientation = 'vertical' }) {
  return (
    <fieldset className={className}>
      <legend className="mb-3 text-small font-medium text-ink">{legend}</legend>
      <div className={cn('flex gap-3', orientation === 'vertical' ? 'flex-col' : 'flex-wrap gap-x-6')}>
        {options.map((option) => (
          <RadioButton
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
