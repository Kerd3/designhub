import { cn } from '@/utils/format.js';

export function ProgressBar({ value, label = 'Completion', showValue = true, size = 'md', className }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('relative flex-1 overflow-hidden rounded-full bg-surface-3', size === 'sm' ? 'h-1.5' : 'h-2')}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', clamped === 100 ? 'bg-success' : 'bg-primary')}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue && <span className="w-10 shrink-0 text-right text-caption font-medium tabular-nums text-muted">{clamped}%</span>}
    </div>
  );
}
