import { useEffect, useId, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Table2, BarChart3 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { useSettings } from '@/context/SettingsContext.jsx';

/** Resolves chart tokens to concrete colours (SVG attributes cannot read CSS variables everywhere). */
function useChartTokens() {
  const { resolvedTheme } = useSettings();
  const read = () => {
    const s = getComputedStyle(document.documentElement);
    const v = (name) => s.getPropertyValue(name).trim();
    return { series: v('--color-chart-bar'), grid: v('--color-chart-grid'), axis: v('--color-chart-axis'), ink: v('--color-ink'), muted: v('--color-muted'), surface: v('--color-surface') };
  };
  const [tokens, setTokens] = useState(read);
  // Re-read after the theme attribute has been applied by the layout.
  useEffect(() => {
    const id = requestAnimationFrame(() => setTokens(read()));
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);
  return tokens;
}

function ChartTooltip({ active, payload, valueLabel }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-md bg-surface px-3 py-2 text-small shadow-md ring-1 ring-border">
      <p className="font-semibold text-ink">{name}</p>
      <p className="text-muted"><span className="font-semibold tabular-nums text-ink">{value}</span> {valueLabel}</p>
    </div>
  );
}

/**
 * Single-series horizontal bar chart (magnitude by category): one hue, no legend,
 * direct value labels, hover tooltip, and a table view for screen readers and
 * anyone who prefers numbers. data: [{ name, value }]
 */
export function BarChartCard({ title, description, data, valueLabel = 'items', action }) {
  const tokens = useChartTokens();
  const [showTable, setShowTable] = useState(false);
  const headingId = useId();
  const height = Math.max(160, data.length * 44 + 24);
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader
        id={headingId}
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-1">
            {action}
            <button
              type="button"
              onClick={() => setShowTable((s) => !s)}
              aria-pressed={showTable}
              className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-small font-medium text-muted hover:bg-surface-2 hover:text-ink"
            >
              {showTable ? <BarChart3 aria-hidden="true" className="size-4" /> : <Table2 aria-hidden="true" className="size-4" />}
              {showTable ? 'Chart' : 'Table'}
            </button>
          </div>
        }
      />
      {showTable ? (
        <table className="w-full text-small">
          <caption className="visually-hidden">{title}</caption>
          <thead><tr className="text-left text-muted"><th scope="col" className="py-2 font-medium">Category</th><th scope="col" className="py-2 text-right font-medium">Count</th><th scope="col" className="py-2 text-right font-medium">Share</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.name} className="border-t border-border">
                <th scope="row" className="py-2 text-left font-medium text-ink">{d.name}</th>
                <td className="py-2 text-right tabular-nums text-ink">{d.value}</td>
                <td className="py-2 text-right tabular-nums text-muted">{total ? Math.round((d.value / total) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <figure aria-labelledby={headingId} className="-ml-2">
          <div role="img" aria-label={`${title}: ${data.map((d) => `${d.name} ${d.value}`).join(', ')}`} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 8 }} barCategoryGap={10}>
                <CartesianGrid horizontal={false} stroke={tokens.grid} strokeWidth={1} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: tokens.muted, fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={104} axisLine={{ stroke: tokens.axis }} tickLine={false} tick={{ fill: tokens.ink, fontSize: 13 }} />
                <Tooltip cursor={{ fill: tokens.grid, opacity: 0.5 }} content={<ChartTooltip valueLabel={valueLabel} />} />
                <Bar dataKey="value" fill={tokens.series} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>
                  <LabelList dataKey="value" position="right" offset={8} fill={tokens.ink} fontSize={13} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </figure>
      )}
    </Card>
  );
}
