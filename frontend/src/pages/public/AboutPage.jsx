import { Avatar } from '@/components/ui';
import { values, team, photoCredits } from '@/data/studio.js';
import { usePageMeta } from '@/hooks/usePageMeta.js';
import { ClosingCta } from './HomePage.jsx';

const [, wide, , tall] = photoCredits;

export default function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'DesignHub Studio is a small, fictional design and frontend studio. Our mission, values, philosophy and team.',
  });

  return (
    <>
      <section aria-labelledby="about-title" className="page-container pb-16 pt-14 lg:pb-24 lg:pt-24">
        <h1 id="about-title" className="max-w-[18ch] font-display text-display font-extrabold text-ink">
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise">A small studio</span></span>
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise [animation-delay:110ms]">for careful work.</span></span>
        </h1>
        <div className="axis-grid mt-10">
          <p className="text-body text-muted lg:max-w-[30ch] lg:pr-8">DesignHub Studio is fictional. It was created to present a frontend and UI/UX portfolio as a complete product.</p>
          <p className="max-w-[48ch] text-lead text-ink">
            Six people, designers and engineers, building websites and web applications for growing businesses. We keep the team small on purpose: the people you meet in the first call are the people who do the work.
          </p>
        </div>
      </section>

      <figure className="relative">
        <img src={wide.src} alt={wide.alt} width="1600" height="1000" loading="lazy" decoding="async" className="h-[min(60svh,560px)] w-full object-cover grayscale contrast-[1.05]" />
        <figcaption className="page-container mt-3 text-caption text-muted">Photograph by {wide.author}, Unsplash licence. Atmosphere only; not the studio.</figcaption>
      </figure>

      <section aria-label="Mission and vision" className="page-container section-space">
        <div className="grid gap-16 md:grid-cols-2 lg:gap-24">
          <div data-reveal>
            <h2 className="font-display text-h1 font-bold text-ink">Mission</h2>
            <p className="mt-5 text-lead text-ink">To design and build digital products that are clear to use, quick to load and accessible to everyone, and to hand them over in a state your team can confidently own.</p>
          </div>
          <div data-reveal style={{ '--reveal-index': 1 }}>
            <h2 className="font-display text-h1 font-bold text-ink">Vision</h2>
            <p className="mt-5 text-lead text-ink">A web where growing businesses get the same quality of design and engineering as the largest companies, without the overhead.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-title" className="section-space bg-surface-2">
        <div className="page-container axis-grid">
          <h2 id="values-title" data-reveal className="font-display text-h1 font-bold text-ink lg:pr-16">What we value</h2>
          <dl className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
            {values.map((v, i) => (
              <div key={v.title} data-reveal style={{ '--reveal-index': i % 2 }}>
                <dt className="font-display text-h3 font-bold text-ink">{v.title}</dt>
                <dd className="mt-3 text-body text-ink">{v.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="philosophy-title" className="section-space">
        <div className="page-container grid gap-12 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-0">
          <div className="overflow-hidden rounded-lg lg:mr-16">
            <img src={tall.src} alt={tall.alt} width="1600" height="1000" loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover grayscale contrast-[1.05]" />
          </div>
          <div className="flex max-w-[62ch] flex-col justify-center">
            <h2 id="philosophy-title" data-reveal className="font-display text-h1 font-bold text-ink">How we build</h2>
            <blockquote data-reveal className="mt-8 font-display text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-semibold leading-snug tracking-tight text-ink">
              <p>Design decisions belong in code, and code should explain its design decisions.</p>
            </blockquote>
            <div data-reveal className="mt-8 flex flex-col gap-5 text-body text-ink">
              <p>We build from a design system outward. Tokens and components come first, so every page that follows is faster to build and consistent by default.</p>
              <p>We prefer proven tools over fashionable ones: React, plain CSS architecture, REST APIs and PostgreSQL. Your next developer should recognise everything we leave behind.</p>
              <p>We test in real browsers at real screen sizes, with a keyboard and a screen reader, before calling anything done.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="team-title" className="section-space bg-surface-2">
        <div className="page-container">
          <div className="axis-grid items-end">
            <h2 id="team-title" data-reveal className="font-display text-h1 font-bold text-ink">The team</h2>
            <p data-reveal className="max-w-[52ch] text-body text-ink">Fictional team members created for this demonstration. Names, roles and biographies are invented; no real people are represented.</p>
          </div>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <li key={member.id} data-reveal style={{ '--reveal-index': i % 3 }} className="flex flex-col rounded-lg bg-surface p-6">
                <div className="flex items-center gap-4">
                  <Avatar name={member.name} size="lg" decorative />
                  <div className="min-w-0">
                    <h3 className="font-display text-h3 font-bold text-ink">{member.name}</h3>
                    <p className="text-small text-muted">{member.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-body text-ink">{member.bio}</p>
                <ul aria-label={`${member.name}'s focus areas`} className="mt-5 flex flex-wrap gap-1.5">
                  {member.skills.map((s) => <li key={s} className="rounded-sm bg-surface-2 px-2 py-0.5 text-caption font-medium text-muted">{s}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClosingCta title="Work with a small, senior team" />
    </>
  );
}
