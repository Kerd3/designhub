import { cn, initials } from '@/utils/format.js';

// Neutral tones only: status colours are reserved for status.
const TONES = [
  'bg-surface-3 text-ink',
  'bg-accent-soft text-ink dark:bg-surface-3',
  'bg-secondary/12 text-ink',
];
const SIZES = { xs: 'size-6 text-caption', sm: 'size-8 text-caption', md: 'size-10 text-small', lg: 'size-14 text-body', xl: 'size-20 text-h3' };

function toneFor(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

/** Initials avatar. Demo team members are fictional, so no photographs are used. */
export function Avatar({ name, size = 'md', className, decorative = false }) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      // Decorative avatars draw their initials with CSS, so the letters never leak into
      // the accessible name of a surrounding button or link (WCAG 2.5.3 label in name).
      data-initials={decorative ? initials(name) : undefined}
      className={cn('inline-grid shrink-0 select-none place-items-center rounded-full font-semibold', decorative && 'before:content-[attr(data-initials)]', SIZES[size], toneFor(name), className)}
    >
      {decorative ? null : initials(name)}
    </span>
  );
}

export function AvatarGroup({ names = [], max = 3, size = 'sm' }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center" aria-label={names.length ? `Team: ${names.join(', ')}` : 'No one assigned'} role="group">
      {shown.map((name) => (
        <Avatar key={name} name={name} size={size} decorative className="-ml-2 ring-2 ring-surface first:ml-0" />
      ))}
      {extra > 0 && (
        <span aria-hidden="true" className={cn('-ml-2 inline-grid place-items-center rounded-full bg-surface-3 font-semibold text-muted ring-2 ring-surface', SIZES[size])}>
          +{extra}
        </span>
      )}
      {names.length === 0 && <span className="text-small text-muted">Unassigned</span>}
    </div>
  );
}
