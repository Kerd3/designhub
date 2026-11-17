import { Link } from 'react-router';
import { ArrowRight, Check, Clock, Plus } from 'lucide-react';
import { services, process, faqs } from '@/data/studio.js';
import { portfolio } from '@/data/portfolio.js';
import { ProjectPreview } from '@/components/portfolio/ProjectPreview.jsx';
import { usePageMeta } from '@/hooks/usePageMeta.js';
import { cn } from '@/utils/format.js';
import { ClosingCta } from './HomePage.jsx';

const bySlug = Object.fromEntries(portfolio.map((p) => [p.slug, p]));

const COMPONENT_CODE = `export function Button({ variant = 'primary', loading, children, ...props }) {
  return (
    <button
      className={styles[variant]}
      disabled={loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner label="Saving" /> : children}
    </button>
  );
}`;

const API_CODE = `GET /api/shipments/AT-20481
200 OK

{
  "data": {
    "id": "AT-20481",
    "status": "out-for-delivery",
    "window": { "from": "10:30", "to": "11:15" },
    "stops": 14
  }
}`;

const SWATCHES = [
  ['Primary', 'bg-primary'], ['Ink', 'bg-secondary'], ['Sand', 'bg-accent'], ['Surface', 'bg-surface'],
  ['Success', 'bg-success'], ['Warning', 'bg-warning'], ['Danger', 'bg-danger'], ['Info', 'bg-info'],
];

/** Each service gets its own specimen: the kind of thing that service produces. */
function ServiceSpecimen({ slug }) {
  switch (slug) {
    case 'website-design':
      return <div className="w-full max-w-xl"><ProjectPreview project={bySlug['harvest-table']} /></div>;
    case 'frontend-development':
      return (
        <figure className="w-full min-w-0 max-w-xl">
          <pre tabIndex={0} aria-label="Example React component code" className="overflow-x-auto rounded-lg bg-inverse p-5 text-caption leading-relaxed text-inverse-ink"><code>{COMPONENT_CODE}</code></pre>
          <figcaption className="mt-3 text-small text-muted">Components accept variants and states, so every screen behaves the same way.</figcaption>
        </figure>
      );
    case 'ui-ux-design':
      return (
        <div className="flex w-full max-w-md items-end justify-center gap-4">
          <div className="w-1/2"><ProjectPreview project={bySlug.tandem} device="mobile" /></div>
          <div className="w-1/2 translate-y-6"><ProjectPreview project={bySlug.wellnest} device="mobile" /></div>
        </div>
      );
    case 'web-application-development':
      return <div className="w-full max-w-xl"><ProjectPreview project={bySlug.routewise} /></div>;
    case 'design-systems':
      return (
        <div className="w-full max-w-md" role="img" aria-label="Sample design tokens: eight colour swatches and a type scale">
          <div aria-hidden="true" className="grid grid-cols-4 gap-2">
            {SWATCHES.map(([name, cls]) => (
              <div key={name}>
                <div className={cn('aspect-square rounded-md', cls, name === 'Surface' && 'ring-1 ring-border')} />
                <p className="mt-2 text-caption font-medium text-ink">{name}</p>
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="mt-6 rounded-lg bg-surface p-5">
            <p className="font-display text-h1 font-bold leading-none text-ink">Aa</p>
            <p className="mt-3 font-display text-h3 font-bold text-ink">Heading 3 · Manrope</p>
            <p className="mt-1 text-body text-ink">Body · Inter 16/26</p>
            <p className="mt-1 text-caption text-muted">Caption · Inter 13/18</p>
          </div>
        </div>
      );
    case 'api-integration':
      return (
        <figure className="w-full min-w-0 max-w-xl">
          <pre tabIndex={0} aria-label="Example API request and response" className="overflow-x-auto rounded-lg bg-inverse p-5 text-caption leading-relaxed text-inverse-ink"><code>{API_CODE}</code></pre>
          <figcaption className="mt-3 text-small text-muted">Every integration ships with loading, empty and error states designed in.</figcaption>
        </figure>
      );
    default:
      return null;
  }
}

function ServiceSection({ service, index }) {
  const flip = index % 2 === 1;
  return (
    <section id={service.slug} aria-labelledby={`${service.slug}-title`} className="scroll-mt-24">
      <div className={cn('grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-0', flip && 'lg:[&>*:first-child]:order-2')}>
        <div data-reveal className={cn('flex min-h-[320px] items-center justify-center rounded-xl px-6 py-12 sm:px-10', service.tint, flip ? 'lg:ml-12' : 'lg:mr-16')}>
          <ServiceSpecimen slug={service.slug} />
        </div>
        <div className="flex flex-col justify-center lg:py-8">
          <div data-reveal className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-surface text-ink ring-1 ring-border">
              <service.icon aria-hidden="true" className="size-6" />
            </span>
            <h2 id={`${service.slug}-title`} className="font-display text-h2 font-bold text-ink">{service.name}</h2>
          </div>
          <p data-reveal style={{ '--reveal-index': 1 }} className="mt-5 max-w-[60ch] text-lead text-ink">{service.description}</p>
          <div data-reveal style={{ '--reveal-index': 2 }} className="mt-8 grid gap-8 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <h3 className="font-sans text-small font-semibold text-ink">What is included</h3>
              <ul className="mt-3 flex flex-col gap-3">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-body text-ink">
                    <Check aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-small font-semibold text-ink">Typical timeline</h3>
              <p className="mt-3 inline-flex items-center gap-2 text-body text-ink"><Clock aria-hidden="true" className="size-4 text-muted" /> {service.timeline}</p>
              <Link
                to={`/contact?type=${encodeURIComponent(service.inquiryType)}`}
                className="group mt-6 flex w-fit items-center gap-2 rounded-sm text-small font-semibold text-primary hover:underline underline-offset-4"
              >
                Discuss a {service.name.toLowerCase()} project
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="faq-title" className="section-space">
      <div className="page-container axis-grid">
        <div className="lg:pr-16">
          <h2 id="faq-title" data-reveal className="font-display text-h1 font-bold text-ink">Questions we hear often</h2>
          <p data-reveal className="mt-5 max-w-sm text-body text-ink">
            Something else on your mind? <Link to="/contact" className="font-semibold text-primary underline underline-offset-4">Ask us directly</Link>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {faqs.map((faq) => (
            <details key={faq.q} data-reveal className="group rounded-lg bg-surface-2 open:bg-surface open:ring-1 open:ring-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 text-body font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <Plus aria-hidden="true" className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5 text-body text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  usePageMeta({
    title: 'Services',
    description: 'Website design, frontend development, UI/UX design, web applications, design systems and API integration from DesignHub Studio (fictional portfolio studio).',
  });

  return (
    <>
      <section aria-labelledby="services-page-title" className="page-container pb-16 pt-14 lg:pb-24 lg:pt-24">
        <h1 id="services-page-title" className="max-w-[16ch] font-display text-display font-extrabold text-ink">
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise">Design and code,</span></span>
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise [animation-delay:110ms]">one team.</span></span>
        </h1>
        <div className="axis-grid mt-10">
          <p className="animate-fade-up text-body text-muted [animation-delay:300ms] lg:max-w-[30ch] lg:pr-8">Six services, from a first sketch to a production web application.</p>
          <div className="animate-fade-up [animation-delay:300ms]">
            <p className="max-w-[48ch] text-lead text-ink">
              Designers and engineers work side by side from day one, so what we design is what we ship. Pick one service or combine them; the process is the same.
            </p>
            <nav aria-label="Services on this page" className="mt-8">
              <ul className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <li key={s.slug}>
                    <a href={`#${s.slug}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-surface-2 px-4 text-small font-medium text-ink transition-colors hover:bg-surface-3">
                      <s.icon aria-hidden="true" className="size-4 text-muted" /> {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <div className="page-container flex flex-col gap-24 pb-24 lg:gap-32 lg:pb-36">
        {services.map((service, i) => <ServiceSection key={service.slug} service={service} index={i} />)}
      </div>

      <section aria-labelledby="process-steps-title" className="section-space bg-surface-2 text-ink">
        <div className="page-container">
          <div className="axis-grid items-end">
            <h2 id="process-steps-title" data-reveal className="font-display text-h1 font-bold">The same four stages, every time</h2>
            <p data-reveal className="max-w-md text-lead text-ink">You always know which stage we are in, what it produces and what comes next.</p>
          </div>
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-8">
            {process.map((step, i) => (
              <li key={step.name} data-reveal style={{ '--reveal-index': i }} className="flex flex-col rounded-lg bg-surface p-6 shadow-sm ring-1 ring-border">
                <h3 className="font-display text-h2 font-bold">{step.name}</h3>
                <p className="mt-4 text-body text-muted"><strong className="font-semibold text-ink">{step.runIn}</strong> {step.text}</p>
                <ul className="mt-6 flex flex-wrap gap-2 pt-2" aria-label={`${step.name} deliverables`}>
                  {step.deliverables.map((d) => <li key={d} className="rounded-full bg-surface-2 px-3 py-1 text-caption font-medium text-ink">{d}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Faq />
      <ClosingCta title="Not sure which service fits?" text="Describe the problem instead. We will suggest the smallest piece of work that solves it." />
    </>
  );
}
