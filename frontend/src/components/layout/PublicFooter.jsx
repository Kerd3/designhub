import { Link } from 'react-router';
import { ArrowUp } from 'lucide-react';
import { services, contact, social, photoCredits } from '@/data/studio.js';
import { PUBLIC_NAV } from './PublicHeader.jsx';

const linkClass = 'rounded-sm text-small text-inverse-ink/90 hover:text-inverse-ink hover:underline underline-offset-4';

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="overflow-hidden bg-inverse text-inverse-ink">
      <div className="page-container pb-10 pt-16 lg:pt-24">
        <p aria-hidden="true" className="font-display text-[clamp(3rem,13.6vw,12.5rem)] font-extrabold leading-[0.85] tracking-[-0.055em] text-inverse-ink">
          DesignHub
        </p>
        <h2 className="visually-hidden">DesignHub Studio — site footer</h2>

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
          <div className="flex flex-col gap-3">
            <a href={`mailto:${contact.email}`} className="w-fit font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.125rem)] font-bold tracking-tight text-inverse-accent hover:underline underline-offset-4">{contact.email}</a>
            <a href={contact.phoneHref} className="w-fit font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.125rem)] font-bold tracking-tight text-inverse-accent hover:underline underline-offset-4">{contact.phone}</a>
            <address className="mt-2 not-italic text-body text-inverse-muted">{contact.address.join(', ')}</address>
            <p className="max-w-sm text-small text-inverse-muted">{contact.notice}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <nav aria-label="Studio">
              <h3 className="font-sans text-small font-semibold text-inverse-muted">Studio</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {PUBLIC_NAV.map((item) => <li key={item.to}><Link to={item.to} className={linkClass}>{item.label}</Link></li>)}
                <li><Link to="/design-system" className={linkClass}>Design system</Link></li>
              </ul>
            </nav>
            <nav aria-label="Services">
              <h3 className="font-sans text-small font-semibold text-inverse-muted">Services</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {services.map((s) => <li key={s.slug}><Link to={`/services#${s.slug}`} className={linkClass}>{s.name}</Link></li>)}
              </ul>
            </nav>
            <div>
              <h3 className="font-sans text-small font-semibold text-inverse-muted">Elsewhere</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer noopener" className={linkClass}>
                      {s.label}<span className="visually-hidden"> (opens the platform's home page in a new tab; the studio is fictional)</span>
                    </a>
                  </li>
                ))}
                <li><Link to="/workspace/login" className={linkClass}>Workspace login</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 pt-6 text-caption text-inverse-muted sm:flex-row sm:items-start sm:justify-between lg:mt-24">
          <div className="flex max-w-3xl flex-col gap-1.5">
            <p>© {year} DesignHub Studio. A fictional studio built as a frontend portfolio project. All projects, people and contact details are demonstration content.</p>
            <p>
              Photographs by{' '}
              {photoCredits.map((p, i) => (
                <span key={p.src}>
                  <a href={p.url} className="underline underline-offset-2 hover:text-inverse-ink" target="_blank" rel="noreferrer noopener">{p.author}</a>
                  {i < photoCredits.length - 2 ? ', ' : i === photoCredits.length - 2 ? ' and ' : ''}
                </span>
              ))}{' '}
              on Unsplash.
            </p>
          </div>
          <a href="#top" className="inline-flex shrink-0 items-center gap-1.5 text-small text-inverse-ink hover:underline underline-offset-4">
            <ArrowUp aria-hidden="true" className="size-4" /> Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
