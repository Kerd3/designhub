export const cn = (...classes) => classes.flat().filter(Boolean).join(' ');

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const shortDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Parses "YYYY-MM-DD" as a local date (avoids the UTC off-by-one). */
export function parseDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export const formatDate = (value) => (value ? dateFmt.format(parseDate(value)) : '—');
export const formatShortDate = (value) => (value ? shortDateFmt.format(parseDate(value)) : '—');
export const formatDateTime = (value) => (value ? dateTimeFmt.format(parseDate(value)) : '—');

export function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from today to an ISO date (negative when overdue). */
export function daysUntil(value) {
  const target = parseDate(value);
  const today = parseDate(todayIso());
  return Math.round((target - today) / 86_400_000);
}

export function relativeDue(value) {
  const days = daysUntil(value);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days === -1) return 'Overdue by 1 day';
  if (days < 0) return `Overdue by ${-days} days`;
  if (days <= 14) return `Due in ${days} days`;
  return `Due ${formatShortDate(value)}`;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
export function timeAgo(value) {
  const seconds = Math.round((parseDate(value) - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(seconds / 86400), 'day');
  return formatDate(value);
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

/** Case-insensitive match of a query against several fields. */
export function matchesQuery(query, ...fields) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
}

export const PRIORITY_RANK = { low: 0, medium: 1, high: 2, urgent: 3 };
