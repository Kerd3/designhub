import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { ProjectPreview } from '@/components/portfolio/ProjectPreview.jsx';
import { TechList } from '@/components/portfolio/ProjectCard.jsx';
import { TokenPlayground } from '@/components/portfolio/TokenPlayground.jsx';
import { services, process, photoCredits } from '@/data/studio.js';
import { portfolio } from '@/data/portfolio.js';
import { usePageMeta } from '@/hooks/usePageMeta.js';
import { cn } from '@/utils/format.js';

const [photoA, photoB, photoC, photoD] = photoCredits;
const featured = portfolio.filter((p) => p.featured);

function Photo({ photo, className, eager }) {
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      width="1600"
      height="1000"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-full w-full object-cover contrast-[1.05] grayscale', className)}
    />
  );
}

function Masthead() {
  const finora = portfolio[0];
  const wellnest = portfolio[1];
  return (
    <div className="masthead-grid h-[44svh] max-h-[480px] min-h-[320px]">
      <div className="overflow-hidden [grid-area:p1]"><Photo photo={photoA} eager className="motion-safe:animate-drift" /></div>
      <div className="bg-primary [grid-area:blue]" />
      <div className="relative overflow-hidden [grid-area:ui]" style={{ background: finora.preview.tint }}>
        <div className="absolute left-[6%] top-[14%] w-[120%] lg:top-[12%] lg:w-[118%]"><ProjectPreview project={finora} /></div>
        <div className="absolute -bottom-[34%] right-[5%] hidden w-[26%] lg:block"><ProjectPreview project={wellnest} device="mobile" /></div>
      </div>
      <div className="hidden overflow-hidden [grid-area:p2] lg:block"><Photo photo={photoB} eager /></div>
      <div className="hidden overflow-hidden [grid-area:p3] lg:block"><Photo photo={photoD} eager /></div>
      <div className="hidden bg-accent [grid-area:sand] lg:block" />
      <div className="hidden bg-inverse [grid-area:ink] lg:block" />
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pb-20 lg:pb-32">
      <Masthead />
      <div className="page-container">
        <h1 id="hero-title" className="mt-12 font-display text-display font-extrabold text-ink lg:mt-20">
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise">Thoughtful design.</span></span>
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise [animation-delay:110ms]">Functional digital experiences.</span></span>
        </h1>
        <div className="axis-grid mt-10 lg:mt-14">
          <p className="animate-fade-up text-body text-muted [animation-delay:350ms] lg:max-w-[30ch] lg:pr-8">
            DesignHub Studio is a fictional design and frontend studio, built as a portfolio project.
          </p>
          <div className="animate-fade-up [animation-delay:350ms]">
            <p className="max-w-[40ch] text-lead text-ink">
              We design and build digital experiences that help businesses connect with their customers and grow with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/work" size="lg" rightIcon={ArrowRight}>Explore our work</Button>
              <Button to="/contact" size="lg" variant="outline">Start a project</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section aria-labelledby="services-title" className="section-space bg-surface-2">
      <div className="page-container axis-grid gap-y-12">
        <div className="lg:pr-16">
          <div className="lg:sticky lg:top-28">
            <h2 id="services-title" data-reveal className="font-display text-h1 font-bold text-ink">What we do</h2>
            <p data-reveal style={{ '--reveal-index': 1 }} className="mt-5 max-w-md text-lead text-ink">
              Six services, one team. Designers and engineers work on the same project from the first day.
            </p>
            <Link data-reveal style={{ '--reveal-index': 2 }} to="/services" className="mt-6 inline-flex items-center gap-1.5 rounded-sm text-small font-semibold text-primary hover:underline underline-offset-4">
              See every service in detail <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
        <ul className="grid gap-x-12 gap-y-14 sm:grid-cols-2">
          {services.map((service, i) => (
            <li key={service.slug} data-reveal style={{ '--reveal-index': i % 2 }} className="group flex flex-col">
              <div className="flex items-center gap-3">
                <span className={cn('grid size-11 shrink-0 place-items-center rounded-md text-ink', service.tint === 'bg-surface-3' ? 'bg-surface' : service.tint)}>
                  <service.icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="font-display text-h3 font-bold text-ink">{service.name}</h3>
              </div>
              <p className="mt-4 text-body text-ink">{service.short}</p>
              <Link to={`/services#${service.slug}`} className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-sm text-small font-semibold text-primary hover:underline underline-offset-4">
                Learn more<span className="visually-hidden"> about {service.name}</span>
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Literal class names so Tailwind can detect them. Heights vary so the rhythm changes block to block.
const WORK_HEIGHTS = ['lg:h-[min(78svh,640px)]', 'lg:h-[min(60svh,500px)]', 'lg:h-[min(86svh,700px)]'];

function WorkBlock({ project, index }) {
  return (
    <article aria-labelledby={`work-${project.slug}`} className="grid items-end gap-8 lg:grid-cols-12 lg:gap-0">
      <div
        data-reveal
        className={cn('relative -ml-4 h-[min(100vw,520px)] overflow-hidden sm:-ml-6 lg:col-span-7 lg:-ml-8', WORK_HEIGHTS[index % 3])}
        style={{ background: project.preview.tint }}
      >
        <div className={cn('absolute w-[135%] lg:w-[120%]', index % 2 === 0 ? 'left-[10%] top-[12%]' : 'left-[6%] top-[18%]')}>
          <ProjectPreview project={project} />
        </div>
      </div>
      <div className="lg:col-span-4 lg:col-start-9">
        <div data-reveal className="flex items-end gap-5">
          <div className="w-[46%] max-w-[220px] shrink-0"><ProjectPreview project={project} device="mobile" /></div>
          <div className="flex flex-wrap gap-2 pb-2">
            <Badge tone="outline">Fictional project</Badge>
          </div>
        </div>
        <div data-reveal style={{ '--reveal-index': 1 }} className="mt-7">
          <p className="text-small font-medium text-muted">{project.category} · {project.year}</p>
          <h3 id={`work-${project.slug}`} className="mt-2 font-display text-h2 font-bold text-ink">{project.name}</h3>
          <p className="mt-3 text-body text-ink">{project.description}</p>
          <TechList tech={project.tech} className="mt-4" />
          <Link to={`/work/${project.slug}`} className="group mt-6 inline-flex items-center gap-1.5 rounded-sm text-small font-semibold text-primary hover:underline underline-offset-4">
            View case study<span className="visually-hidden">: {project.name}</span>
            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function WorkSection() {
  return (
    <section aria-labelledby="work-title" className="section-space overflow-hidden">
      <div className="page-container">
        <div className="axis-grid items-end">
          <h2 id="work-title" data-reveal className="font-display text-h1 font-bold text-ink">Selected work</h2>
          <div data-reveal style={{ '--reveal-index': 1 }} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-body text-ink">Three case studies written as demonstration work. The clients and results are fictional; the design process is real.</p>
            <Button to="/work" variant="outline" rightIcon={ArrowRight} className="shrink-0">All projects</Button>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-24 lg:mt-24 lg:gap-36">
          {featured.map((project, i) => <WorkBlock key={project.slug} project={project} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section aria-labelledby="process-title" className="section-space bg-surface-2">
      <div className="page-container axis-grid">
        <div className="lg:pr-16">
          <div className="overflow-hidden rounded-lg lg:sticky lg:top-28">
            <img src={photoC.src} alt={photoC.alt} width="1600" height="1000" loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover grayscale contrast-[1.05] max-lg:aspect-[16/9]" />
          </div>
        </div>
        <div className="max-w-[600px]">
          <h2 id="process-title" data-reveal className="font-display text-h1 font-bold text-ink">How we work</h2>
          <p data-reveal style={{ '--reveal-index': 1 }} className="mt-5 text-lead text-ink">Four stages, the same on every project, so you always know what happens next.</p>
          <ol className="mt-14 flex flex-col gap-14">
            {process.map((step) => (
              <li key={step.name} data-reveal>
                <h3 className="font-display text-h2 font-bold text-ink">{step.name}</h3>
                <p className="mt-3 text-body text-muted">
                  <strong className="font-semibold text-ink">{step.runIn}</strong> {step.text}
                </p>
                <p className="mt-4 text-small text-ink">
                  <span className="font-semibold">You receive: </span>
                  {step.deliverables.join(', ')}.
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function PlaygroundSection() {
  return (
    <section aria-labelledby="playground-heading" className="section-space">
      <div className="page-container"><TokenPlayground /></div>
    </section>
  );
}

export function ClosingCta({ title = 'Have a project in mind?', text = 'Tell us what you are building. We reply to every inquiry within two working days.' }) {
  return (
    <section aria-labelledby="cta-title" className="bg-primary text-primary-ink">
      <div className="page-container flex min-h-[70svh] flex-col justify-between gap-16 py-20 lg:min-h-[80svh] lg:py-28">
        <h2 id="cta-title" data-reveal className="max-w-[14ch] font-display text-display font-extrabold">{title}</h2>
        <div data-reveal className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-lead">{text}</p>
          <Link
            to="/contact"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-bg px-7 text-body font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-px focus-visible:outline-bg"
          >
            Start a project <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta({
    title: null,
    description: 'DesignHub Studio designs and builds websites, user interfaces and web applications for growing businesses. A fictional studio created as a frontend portfolio project.',
  });
  return (
    <>
      <Hero />
      <ServicesSection />
      <WorkSection />
      <PlaygroundSection />
      <ProcessSection />
      <ClosingCta />
    </>
  );
}
