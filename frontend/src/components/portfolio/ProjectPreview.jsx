import { memo } from 'react';
import { cn } from '@/utils/format.js';
import './ProjectPreview.css';

/**
 * Drawn interface preview for a fictional portfolio project.
 * device: "desktop" (browser frame, 16:10) or "mobile" (phone frame).
 * Exposed to assistive tech as a single image with a descriptive label.
 */
export const ProjectPreview = memo(function ProjectPreview({ project, device = 'desktop', className }) {
  const { kind, accent, tint } = project.preview;
  const Screen = (device === 'mobile' ? MOBILE : DESKTOP)[kind];
  const label = `${device === 'mobile' ? 'Mobile' : 'Desktop'} interface preview of ${project.name}, ${project.summary.toLowerCase().replace(/\.$/, '')} (fictional demonstration project)`;

  return (
    <div
      role="img"
      aria-label={label}
      data-ui
      className={cn('pv', device === 'mobile' && 'pv--mobile', className)}
      style={{ '--pv-accent': accent, '--pv-tint': tint }}
    >
      <div className="pv-frame" aria-hidden="true">
        {device === 'desktop' ? (
          <div className="pv-chrome">
            <span className="pv-dots"><i /><i /><i /></span>
            <span className="pv-url">{project.slug}.example</span>
          </div>
        ) : (
          <div className="pv-notch"><span>9:41</span><span>●●●</span></div>
        )}
        <div className="pv-screen">{Screen ? <Screen project={project} /> : null}</div>
      </div>
    </div>
  );
});

/* ---------- Finora: dashboard ---------- */
const BARS = [48, 56, 52, 64, 60, 70, 66, 74, 72, 78, 76, 84, 88];

function DashboardDesktop({ project }) {
  return (
    <>
      <div className="pv-col gap-[0.25em] p-[0.9em]" style={{ width: '19%', background: '#fff' }}>
        <div className="pv-row mb-[0.8em] gap-[0.5em]"><span className="pv-accent grid size-[1.6em] place-items-center rounded-[0.35em] text-[0.8em] font-bold">F</span><span className="pv-title">{project.name}</span></div>
        {['Overview', 'Cash flow', 'Invoices', 'Bills', 'Reports'].map((item, i) => (
          <span key={item} className={cn('pv-nav-item', i === 0 && 'pv-nav-item--on')}>{item}</span>
        ))}
      </div>
      <div className="pv-col pv-grow gap-[0.8em] p-[1em]">
        <div className="pv-row justify-between">
          <div><div className="pv-title text-[1.25em]">Good morning, Jordan</div><div className="pv-label">Week 47 · all accounts</div></div>
          <span className="pv-btn">Export</span>
        </div>
        <div className="grid grid-cols-3 gap-[0.7em]">
          {[['Cash on hand', '$48,210', '+4.2%'], ['Due this month', '$12,940', '9 bills'], ['Runway', '7.5 months', '+0.4']].map(([l, v, d]) => (
            <div key={l} className="pv-card"><div className="pv-label">{l}</div><div className="pv-value mt-[0.2em]">{v}</div><div className="pv-small pv-up mt-[0.15em]">{d}</div></div>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.7fr_1fr] gap-[0.7em]">
          <div className="pv-card pv-col">
            <div className="pv-row justify-between"><span className="pv-strong">13-week cash forecast</span><span className="pv-label">Confirmed · Forecast</span></div>
            <div className="mt-[0.7em] min-h-0 flex-1"><div className="pv-bars">{BARS.map((h, i) => <i key={i} className={i > 7 ? 'is-forecast' : ''} style={{ height: `${h}%` }} />)}</div></div>
          </div>
          <div className="pv-card pv-col pv-divide">
            <span className="pv-strong pb-[0.4em]">Upcoming</span>
            {[['Invoice 1042', 'Hollis Print Co.', '+$3,200'], ['Payroll', 'Nov 28', '−$8,400'], ['Invoice 1043', 'Larkspur', '+$1,150'], ['Rent', 'Dec 1', '−$2,100']].map(([a, b, c]) => (
              <div key={a} className="pv-row justify-between py-[0.4em]"><div className="min-w-0"><div className="pv-strong text-[0.85em]">{a}</div><div className="pv-label">{b}</div></div><span className={cn('pv-small font-semibold', c.startsWith('+') && 'pv-up')}>{c}</span></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardMobile({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-col pv-grow gap-[0.7em] p-[0.9em]">
        <div className="pv-row justify-between"><span className="pv-title text-[1.2em]">{project.name}</span><span className="pv-avatar">JL</span></div>
        <div className="pv-card pv-accent" style={{ boxShadow: 'none' }}><div className="pv-small">Cash on hand</div><div className="pv-value">$48,210</div><div className="pv-small">Runway 7.5 months</div></div>
        <div className="pv-card"><div className="pv-strong pv-small">Forecast</div><div className="mt-[0.5em] h-[4.5em]"><div className="pv-bars">{BARS.slice(4).map((h, i) => <i key={i} className={i > 4 ? 'is-forecast' : ''} style={{ height: `${h}%` }} />)}</div></div></div>
        <div className="pv-card pv-col pv-divide">
          {[['Invoice 1042', '+$3,200'], ['Payroll', '−$8,400'], ['Rent', '−$2,100']].map(([a, c]) => (
            <div key={a} className="pv-row justify-between py-[0.35em]"><span className="pv-small">{a}</span><span className={cn('pv-small font-semibold', c.startsWith('+') && 'pv-up')}>{c}</span></div>
          ))}
        </div>
      </div>
      <div className="pv-tabbar"><span>Home</span><span>Cash</span><span>Bills</span><span>More</span></div>
    </div>
  );
}

/* ---------- Wellnest: booking ---------- */
const DAYS = [['Mon', 17], ['Tue', 18], ['Wed', 19], ['Thu', 20], ['Fri', 21]];
const SLOTS = ['9:00', '9:30', '10:15', '11:00', '13:30', '14:00', '15:15', '16:00'];

function BookingDesktop({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-row justify-between bg-white px-[1.4em] py-[0.8em]">
        <span className="pv-title pv-accent-text text-[1.1em]">{project.name}</span>
        <div className="pv-row gap-[1.4em] pv-small pv-muted"><span>Clinics</span><span>Services</span><span>Clinicians</span><span className="pv-btn">Book a visit</span></div>
      </div>
      <div className="pv-tint grid flex-1 grid-cols-[1.1fr_1fr] items-center gap-[1.6em] px-[1.8em]">
        <div>
          <div className="pv-title text-[2.6em] leading-[1.02]">Care that fits your week.</div>
          <p className="pv-muted mt-[0.8em] max-w-[26em]">Four family clinics, one place to book. See real availability and choose a time that works for you.</p>
          <div className="pv-row mt-[1em] gap-[0.6em]"><span className="pv-btn">Find a time</span><span className="pv-btn pv-btn--ghost">Our clinics</span></div>
        </div>
        <div className="pv-card p-[1em]">
          <div className="pv-row gap-[0.6em]"><span className="pv-avatar">AC</span><div><div className="pv-strong">Dr. Amara Cole</div><div className="pv-label">Family medicine · Alder clinic</div></div></div>
          <div className="mt-[0.9em] grid grid-cols-5 gap-[0.4em]">
            {DAYS.map(([d, n], i) => (
              <div key={d} className={cn('rounded-[0.45em] py-[0.4em] text-center', i === 1 ? 'pv-accent' : 'bg-[#f2f1ed]')}><div className="text-[0.72em]">{d}</div><div className="font-bold">{n}</div></div>
            ))}
          </div>
          <div className="pv-label mt-[0.9em]">Tuesday 18 November</div>
          <div className="mt-[0.4em] grid grid-cols-4 gap-[0.4em]">
            {SLOTS.map((s, i) => <span key={s} className={cn('pv-chip justify-center', i === 2 && 'pv-chip--on')}>{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingMobile({ project }) {
  return (
    <div className="pv-col pv-grow gap-[0.7em] p-[0.9em]">
      <div className="pv-row justify-between"><span className="pv-title pv-accent-text">{project.name}</span><span className="pv-small pv-muted">Menu</span></div>
      <div className="pv-title text-[1.6em] leading-[1.05]">Care that fits your week.</div>
      <div className="pv-card">
        <div className="pv-strong pv-small">Dr. Amara Cole</div>
        <div className="mt-[0.5em] grid grid-cols-5 gap-[0.25em]">
          {DAYS.map(([d, n], i) => <div key={d} className={cn('rounded-[0.4em] py-[0.25em] text-center text-[0.8em]', i === 1 ? 'pv-accent' : 'bg-[#f2f1ed]')}><div className="opacity-75">{d.slice(0, 1)}</div><b>{n}</b></div>)}
        </div>
        <div className="mt-[0.6em] grid grid-cols-2 gap-[0.35em]">{SLOTS.slice(0, 6).map((s, i) => <span key={s} className={cn('pv-chip justify-center', i === 2 && 'pv-chip--on')}>{s}</span>)}</div>
      </div>
      <span className="pv-btn mt-auto py-[0.75em]">Continue</span>
    </div>
  );
}

/* ---------- Marketly: shop ---------- */
const PRODUCTS = [
  { name: 'Speckled mug', maker: 'Kiln & Co.', price: '$34', shape: 'mug', bg: '#efe4d8', fg: '#9a4b2c' },
  { name: 'Ash bud vase', maker: 'Field Pottery', price: '$48', shape: 'vase', bg: '#e6e8e1', fg: '#55624d' },
  { name: 'Wool runner', maker: 'Loomhouse', price: '$120', shape: 'rug', bg: '#f1dcd2', fg: '#b3593a' },
  { name: 'Moon print', maker: 'Inkwell Press', price: '$56', shape: 'print', bg: '#e4e3ef', fg: '#3d3f6e' },
];

function Product({ p, compact }) {
  return (
    <div className="min-w-0">
      <div className="pv-product" style={{ background: p.bg, color: p.fg }}>
        <span className={`pv-shape-${p.shape}`} style={{ background: p.shape === 'print' ? '#fff' : p.fg }} />
      </div>
      <div className={cn('pv-strong mt-[0.4em]', compact && 'text-[0.85em]')}>{p.name}</div>
      {!compact && <div className="pv-label">{p.maker}</div>}
      <div className="pv-small"><b>{p.price}</b> <span className="pv-muted">delivered</span></div>
    </div>
  );
}

function ShopDesktop({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-row gap-[1em] bg-white px-[1.4em] py-[0.8em]">
        <span className="pv-title pv-accent-text text-[1.1em]">{project.name}</span>
        <span className="pv-grow rounded-[0.45em] bg-[#f2f1ed] px-[0.8em] py-[0.35em] pv-small pv-muted">Search handmade goods</span>
        <span className="pv-small pv-strong">Cart (2)</span>
      </div>
      <div className="pv-col pv-grow gap-[0.9em] px-[1.4em] py-[1em]">
        <div className="pv-row justify-between"><div><div className="pv-title text-[1.5em]">Made by small studios</div><div className="pv-label">Prices include delivery to Portland, OR</div></div></div>
        <div className="pv-row gap-[0.4em]">{['All', 'Ceramics', 'Textiles', 'Prints', 'Woodwork'].map((c, i) => <span key={c} className={cn('pv-chip', i === 0 && 'pv-chip--on')}>{c}</span>)}</div>
        <div className="grid grid-cols-4 gap-[0.9em]">{PRODUCTS.map((p) => <Product key={p.name} p={p} />)}</div>
      </div>
    </div>
  );
}

function ShopMobile({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-col pv-grow gap-[0.6em] p-[0.9em]">
        <div className="pv-row justify-between"><span className="pv-title pv-accent-text">{project.name}</span><span className="pv-small pv-strong">Cart (2)</span></div>
        <span className="rounded-[0.45em] bg-[#f2f1ed] px-[0.7em] py-[0.35em] pv-small pv-muted">Search</span>
        <div className="grid grid-cols-2 gap-[0.6em]">{PRODUCTS.map((p) => <Product key={p.name} p={p} compact />)}</div>
      </div>
      <div className="pv-tabbar"><span>Shop</span><span>Makers</span><span>Saved</span><span>Cart</span></div>
    </div>
  );
}

/* ---------- Routewise: map ---------- */
function RouteMap({ accent }) {
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <rect width="400" height="260" fill="#eef0ea" />
      <path d="M0 70 H400 M0 150 H400 M0 220 H400 M60 0 V260 M170 0 V260 M290 0 V260" stroke="#fff" strokeWidth="9" />
      <path d="M0 110 Q120 90 210 120 T400 100" stroke="#fff" strokeWidth="14" fill="none" />
      <rect x="190" y="160" width="80" height="50" rx="6" fill="#dfe7d6" />
      <path d="M40 220 L60 150 L170 150 L170 70 L290 70 L330 30" stroke={accent} strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M60 70 L120 100 L210 120 L290 150 L360 220" stroke="#c08a2e" strokeWidth="5" fill="none" strokeDasharray="10 7" strokeLinejoin="round" />
      {[[40, 220], [60, 150], [170, 150], [170, 70], [290, 70], [330, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill="#fff" stroke={accent} strokeWidth="4" />)}
      {[[120, 100], [210, 120], [290, 150], [360, 220]].map(([x, y], i) => <rect key={i} x={x - 6} y={y - 6} width="12" height="12" fill="#fff" stroke="#c08a2e" strokeWidth="4" />)}
    </svg>
  );
}

function TransitDesktop({ project }) {
  return (
    <>
      <div className="pv-col gap-[0.6em] bg-white p-[1em]" style={{ width: '34%' }}>
        <div className="pv-row justify-between"><span className="pv-title pv-accent-text">{project.name}</span><span className="pv-chip">Today</span></div>
        <div className="pv-label">312 stops · 8 routes · 2 delayed</div>
        {[['Route A', 'Van 3 · 42 stops', 'On time', 'circle'], ['Route B', 'Van 7 · 38 stops', '12 min late', 'square'], ['Route C', 'Van 1 · 40 stops', 'On time', 'circle']].map(([r, d, s, shape], i) => (
          <div key={r} className={cn('pv-card pv-row gap-[0.6em]', i === 0 && 'ring-2 ring-[var(--pv-accent)]')}>
            <span className="pv-dot" style={{ background: i === 1 ? '#c08a2e' : 'var(--pv-accent)', borderRadius: shape === 'square' ? '0.1em' : '50%' }} />
            <div className="pv-grow"><div className="pv-strong">{r}</div><div className="pv-label">{d}</div></div>
            <span className={cn('pv-small', i === 1 ? 'text-[#8f5b0c] font-semibold' : 'pv-muted')}>{s}</span>
          </div>
        ))}
        <span className="pv-btn mt-auto">Rebalance routes</span>
      </div>
      <div className="pv-grow relative">
        <RouteMap accent={project.preview.accent} />
        <div className="pv-card absolute right-[1em] top-[1em] w-[42%]"><div className="pv-strong">Stop 14 · 1180 Alder St</div><div className="pv-label">Window 10:30–11:15 · Signature</div></div>
      </div>
    </>
  );
}

function TransitMobile({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="relative h-[52%]"><RouteMap accent={project.preview.accent} /></div>
      <div className="pv-col pv-grow -mt-[1em] gap-[0.5em] rounded-t-[1.1em] bg-white p-[0.9em]">
        <div className="mx-auto h-[0.3em] w-[2.6em] rounded-full bg-[#dcdad4]" />
        <div className="pv-strong">Route A · Van 3</div>
        {[['Next', '1180 Alder St', '10:42'], ['Then', '22 Birch Ave', '10:58'], ['Then', '7 Cedar Ct', '11:10']].map(([a, b, c]) => (
          <div key={b} className="pv-row justify-between"><div><div className="pv-label">{a}</div><div className="pv-small pv-strong">{b}</div></div><span className="pv-small">{c}</span></div>
        ))}
        <span className="pv-btn mt-auto">Start navigation</span>
      </div>
    </div>
  );
}

/* ---------- Tandem: shift app ---------- */
const SHIFTS = [
  { day: 'Mon 17', time: '17:00–23:00', role: 'Bar', status: 'Confirmed' },
  { day: 'Wed 19', time: '11:00–17:00', role: 'Floor', status: 'Waiting for Sam' },
  { day: 'Fri 21', time: '18:00–00:00', role: 'Bar', status: 'Confirmed' },
  { day: 'Sat 22', time: '12:00–20:00', role: 'Floor', status: 'Approved by Priya' },
];

function ShiftDesktop({ project }) {
  return (
    <>
      <div className="pv-col gap-[0.25em] bg-white p-[0.9em]" style={{ width: '20%' }}>
        <span className="pv-title pv-accent-text mb-[0.8em]">{project.name}</span>
        {['Rota', 'Swap requests', 'Team', 'Venues'].map((n, i) => <span key={n} className={cn('pv-nav-item', i === 1 && 'pv-nav-item--on')}>{n}</span>)}
      </div>
      <div className="pv-col pv-grow gap-[0.8em] p-[1em]">
        <div className="pv-row justify-between"><div><div className="pv-title text-[1.3em]">Swap requests</div><div className="pv-label">3 waiting for approval · Harbour Kitchen</div></div><span className="pv-btn">Approve all</span></div>
        <div className="pv-card pv-col pv-divide p-0">
          {[['MO', 'Mia O.', 'Wed 19 · Floor', 'Sam K.'], ['JT', 'Jon T.', 'Thu 20 · Kitchen', 'Lee W.'], ['AR', 'Ana R.', 'Sat 22 · Bar', 'Priya N.']].map(([i, a, b, c]) => (
            <div key={a} className="pv-row gap-[0.7em] px-[0.8em] py-[0.6em]">
              <span className="pv-avatar">{i}</span>
              <div className="pv-grow"><div className="pv-strong">{a} → {c}</div><div className="pv-label">{b}</div></div>
              <span className="pv-btn pv-btn--ghost">Decline</span><span className="pv-btn">Approve</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[0.35em]">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className={cn('rounded-[0.4em] py-[0.5em] text-center pv-small', [0, 2, 4, 5].includes(i) ? 'pv-tint pv-accent-text font-semibold' : 'bg-[#f2f1ed] pv-muted')}>{d}</div>)}
        </div>
      </div>
    </>
  );
}

function ShiftMobile({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-col pv-grow gap-[0.55em] p-[0.9em]">
        <div className="pv-row justify-between"><span className="pv-title pv-accent-text">{project.name}</span><span className="pv-avatar">MO</span></div>
        <div className="pv-title text-[1.3em]">Your week</div>
        {SHIFTS.map((s) => (
          <div key={s.day} className="pv-card py-[0.55em]">
            <div className="pv-row justify-between"><span className="pv-strong pv-small">{s.day}</span><span className="pv-label">{s.role}</span></div>
            <div className="pv-small">{s.time}</div>
            <div className={cn('pv-small mt-[0.15em] font-semibold', s.status === 'Confirmed' ? 'pv-muted' : 'pv-accent-text')}>{s.status}</div>
          </div>
        ))}
        <span className="pv-btn mt-auto py-[0.7em]">Request a swap</span>
      </div>
    </div>
  );
}

/* ---------- Harvest Table: restaurant ---------- */
const MENU = [['Roast squash, brown butter, sage', '$16'], ['Wood-fired trout, fennel', '$29'], ['Mushroom ragù, hand-cut pasta', '$24'], ['Pear tart, crème fraîche', '$11']];

function RestaurantDesktop({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-row justify-between bg-white px-[1.4em] py-[0.8em]">
        <span className="pv-title text-[1.1em]">{project.name}</span>
        <div className="pv-row gap-[1.2em] pv-small pv-muted"><span>Menus</span><span>Locations</span><span>Private dining</span><span className="pv-btn">Reserve</span></div>
      </div>
      <div className="grid flex-1 grid-cols-[1fr_1.1fr]">
        <div className="pv-tint pv-col justify-center gap-[0.8em] p-[1.6em]">
          <div className="pv-title text-[2.3em] leading-[1.02]">Three kitchens on Alder Street.</div>
          <div className="pv-small"><b>Open now</b> · kitchen until 22:00</div>
          <div className="w-[52%]"><div className="pv-plate"><i /></div></div>
        </div>
        <div className="pv-col gap-[0.5em] p-[1.6em]">
          <div className="pv-row justify-between"><span className="pv-title text-[1.2em]">Autumn menu</span><span className="pv-label">Updated Monday</span></div>
          <div className="pv-col pv-divide">{MENU.map(([d, p]) => <div key={d} className="pv-row justify-between gap-[1em] py-[0.55em]"><span className="pv-small">{d}</span><span className="pv-small font-semibold">{p}</span></div>)}</div>
          <span className="pv-btn mt-auto self-start">Book a table</span>
        </div>
      </div>
    </div>
  );
}

function RestaurantMobile({ project }) {
  return (
    <div className="pv-col pv-grow">
      <div className="pv-tint pv-col gap-[0.5em] p-[0.9em]">
        <div className="pv-row justify-between"><span className="pv-title">{project.name}</span><span className="pv-small">Menu</span></div>
        <div className="pv-title text-[1.5em] leading-[1.05]">Three kitchens on Alder Street.</div>
        <div className="mx-auto w-[58%]"><div className="pv-plate"><i /></div></div>
      </div>
      <div className="pv-col pv-grow pv-divide p-[0.9em]">{MENU.slice(0, 3).map(([d, p]) => <div key={d} className="pv-row justify-between gap-[0.6em] py-[0.45em]"><span className="pv-small">{d}</span><b className="pv-small">{p}</b></div>)}</div>
      <div className="p-[0.9em] pt-0"><span className="pv-btn w-full py-[0.7em]">Book a table</span></div>
    </div>
  );
}

const DESKTOP = { dashboard: DashboardDesktop, booking: BookingDesktop, shop: ShopDesktop, transit: TransitDesktop, 'mobile-app': ShiftDesktop, restaurant: RestaurantDesktop };
const MOBILE = { dashboard: DashboardMobile, booking: BookingMobile, shop: ShopMobile, transit: TransitMobile, 'mobile-app': ShiftMobile, restaurant: RestaurantMobile };
