import { useMemo, useState } from 'react';
import { CalendarDays, Check, Clock } from 'lucide-react';
import { SegmentedControl, Toggle } from '@/components/ui';
import { cn } from '@/utils/format.js';

const RADII = [
  { value: 'square', label: 'Square', px: 0 },
  { value: 'soft', label: 'Soft', px: 10 },
  { value: 'round', label: 'Round', px: 22 },
];
const ACCENTS = [
  { value: 'studio', label: 'Studio blue', light: '#36539a', dark: '#93a9e2' },
  { value: 'forest', label: 'Forest', light: '#2f6b5a', dark: '#7cc4a7' },
  { value: 'clay', label: 'Clay', light: '#9a4b2c', dark: '#eba184' },
  { value: 'ink', label: 'Ink', light: '#16171a', dark: '#ecebe6' },
];
const THEMES = { light: { bg: '#ffffff', surface: '#f3f1ec', ink: '#16171a', muted: '#5b5e66' }, dark: { bg: '#1a1b1f', surface: '#26282e', ink: '#ecebe6', muted: '#a4a7ae' } };

function Specimen({ tokens }) {
  const { radius, accent, onAccent, theme, gap, pad } = tokens;
  const r = `${radius}px`;
  const rSmall = `${Math.round(radius * 0.6)}px`;
  return (
    <div
      data-ui
      role="img"
      aria-label="Component specimen: a booking confirmation card rendered with the tokens you chose"
      className="w-full max-w-[420px] transition-[background-color,border-radius] duration-300"
      style={{ background: theme.bg, color: theme.ink, borderRadius: r, padding: pad * 1.5, boxShadow: '0 30px 60px -30px rgb(22 23 26 / 0.35)' }}
    >
      <div aria-hidden="true" className="flex flex-col transition-[gap] duration-300" style={{ gap }}>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-caption font-semibold transition-[border-radius] duration-300" style={{ background: theme.surface, borderRadius: 999 }}>
            <Check className="size-3.5" style={{ color: accent }} /> Confirmed
          </span>
          <span className="text-caption" style={{ color: theme.muted }}>Ref. WN-2048</span>
        </div>
        <div>
          <p className="font-display text-[1.375rem] font-bold leading-tight tracking-tight">Family check-up</p>
          <p className="mt-1 text-small" style={{ color: theme.muted }}>Dr. Amara Cole · Alder Street clinic</p>
        </div>
        <div className="grid grid-cols-2 transition-[gap] duration-300" style={{ gap: gap * 0.6 }}>
          {[[CalendarDays, 'Tue 18 Nov'], [Clock, '10:15–10:45']].map(([Icon, text]) => (
            <div key={text} className="flex items-center gap-2 text-small font-medium transition-[border-radius,padding] duration-300" style={{ background: theme.surface, borderRadius: rSmall, padding: pad * 0.75 }}>
              <Icon className="size-4 shrink-0" style={{ color: accent }} /> {text}
            </div>
          ))}
        </div>
        <div className="text-small transition-[border-radius,padding] duration-300" style={{ boxShadow: `inset 0 0 0 1.5px ${theme.surface}`, borderRadius: rSmall, padding: pad * 0.75 }}>
          <span style={{ color: theme.muted }}>Reminder</span> · Text me the day before
        </div>
        <div className="flex gap-2">
          <span className="flex-1 py-2.5 text-center text-small font-semibold transition-[border-radius,background-color] duration-300" style={{ background: accent, color: onAccent, borderRadius: rSmall }}>Add to calendar</span>
          <span className="px-4 py-2.5 text-center text-small font-semibold transition-[border-radius] duration-300" style={{ boxShadow: `inset 0 0 0 1.5px ${accent}`, color: accent, borderRadius: rSmall }}>Reschedule</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Home page "live thing": the visitor edits four design tokens and sees one
 * component and its generated CSS update at once. It demonstrates what a
 * design system is, using the studio's own craft as the material.
 */
export function TokenPlayground() {
  const [radius, setRadius] = useState('soft');
  const [accentKey, setAccentKey] = useState('studio');
  const [mode, setMode] = useState('light');
  const [compact, setCompact] = useState(false);

  const tokens = useMemo(() => {
    const accentDef = ACCENTS.find((a) => a.value === accentKey);
    const accent = mode === 'dark' ? accentDef.dark : accentDef.light;
    return {
      radius: RADII.find((r) => r.value === radius).px,
      accent,
      onAccent: mode === 'dark' ? '#16171a' : '#ffffff',
      theme: THEMES[mode],
      gap: compact ? 12 : 20,
      pad: compact ? 12 : 18,
    };
  }, [radius, accentKey, mode, compact]);

  const css = `:root {
  --radius-base: ${tokens.radius}px;
  --color-accent: ${tokens.accent};
  --color-surface: ${tokens.theme.bg};
  --color-ink: ${tokens.theme.ink};
  --space-stack: ${tokens.gap}px;
}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-0">
      <div className="lg:pr-16">
        <div className="sticky top-24 flex min-h-[420px] items-center justify-center rounded-xl bg-surface-3 px-5 py-12 sm:px-10 lg:min-h-[560px]">
          <Specimen tokens={tokens} />
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:max-w-xl">
        <div>
          <h2 id="playground-heading" className="font-display text-h2 font-bold text-ink">Change a token, change every screen</h2>
          <p className="mt-4 text-lead text-ink">
            A design system stores decisions such as corner radius, colour and spacing once, as tokens. Try it: each control below edits one token, and the card responds instantly.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p id="radius-label" className="font-display text-h3 font-bold text-ink">Corner radius</p>
          <p className="text-body text-muted">Square reads precise and editorial; round reads friendly.</p>
          <SegmentedControl label="Corner radius" options={RADII} value={radius} onChange={setRadius} className="mt-2 self-start" />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-display text-h3 font-bold text-ink">Accent colour</legend>
          <p className="text-body text-muted">One accent, used for the action and little else.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <label key={a.value} className={cn('inline-flex h-11 cursor-pointer items-center gap-2 rounded-full pl-1.5 pr-4 text-small font-medium ring-1 ring-inset transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary', accentKey === a.value ? 'bg-surface ring-ink' : 'ring-border-strong hover:bg-surface')}>
                <input type="radio" name="accent" value={a.value} checked={accentKey === a.value} onChange={() => setAccentKey(a.value)} className="visually-hidden" />
                <span aria-hidden="true" className="grid size-8 place-items-center rounded-full" style={{ background: a.light }}>
                  {accentKey === a.value && <Check className="size-4 text-white" />}
                </span>
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <p className="font-display text-h3 font-bold text-ink">Theme</p>
          <p className="text-body text-muted">Dark mode swaps the surface tokens; components stay the same.</p>
          <SegmentedControl label="Theme" options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={mode} onChange={setMode} className="mt-2 self-start" />
        </div>

        <Toggle label="Compact spacing" description="Tighter spacing tokens for dense, data-heavy screens." checked={compact} onChange={setCompact} className="max-w-md" />

        <div>
          <p className="text-small font-medium text-muted">The tokens behind this card</p>
          <pre tabIndex={0} aria-label="Generated CSS tokens" className="mt-2 overflow-x-auto rounded-lg bg-inverse p-4 text-[0.8125rem] leading-relaxed text-inverse-ink"><code>{css}</code></pre>
        </div>
      </div>
    </div>
  );
}
