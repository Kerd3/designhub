import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { getProject, portfolio, relatedProjects } from '@/data/portfolio.js';
import { ProjectPreview } from '@/components/portfolio/ProjectPreview.jsx';
import { ProjectCard, TechList } from '@/components/portfolio/ProjectCard.jsx';
import { Breadcrumb } from '@/components/ui';
import { usePageMeta } from '@/hooks/usePageMeta.js';
import NotFoundPage from './NotFoundPage.jsx';
import { ClosingCta } from './HomePage.jsx';

function StorySection({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="axis-grid py-14 lg:py-20">
      <h2 id={id} data-reveal className="font-display text-h2 font-bold text-ink lg:pr-16">{title}</h2>
      <div data-reveal style={{ '--reveal-index': 1 }} className="max-w-[64ch]">{children}</div>
    </section>
  );
}

export default function CaseStudyPage() {
  const { slug } = useParams();
  const project = getProject(slug);
  usePageMeta({
    title: project ? `${project.name} case study` : 'Case study not found',
    description: project ? `${project.summary} ${project.description} (Fictional demonstration project.)` : undefined,
    noindex: !project,
  });

  if (!project) {
    return <NotFoundPage title="We could not find that case study" message="It may have been renamed. Browse every project on the Our Work page." />;
  }

  const index = portfolio.findIndex((p) => p.slug === slug);
  const prev = portfolio[(index - 1 + portfolio.length) % portfolio.length];
  const next = portfolio[(index + 1) % portfolio.length];
  const related = relatedProjects(slug, 2);

  return (
    <article aria-labelledby="case-title">
      <header className="page-container pt-10 lg:pt-14">
        <Breadcrumb items={[{ label: 'Our Work', to: '/work' }, { label: project.name }]} />
        <h1 id="case-title" className="mt-8 font-display text-display font-extrabold text-ink">
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise">{project.name}</span></span>
        </h1>
        <div className="axis-grid mt-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-small lg:max-w-sm lg:pr-8">
            <div><dt className="text-muted">Category</dt><dd className="mt-1 font-medium text-ink">{project.category}</dd></div>
            <div><dt className="text-muted">Year</dt><dd className="mt-1 font-medium text-ink">{project.year}</dd></div>
            <div className="col-span-2"><dt className="text-muted">Stack</dt><dd className="mt-2"><TechList tech={project.tech} /></dd></div>
          </dl>
          <div>
            <p className="max-w-[48ch] text-lead text-ink">{project.description}</p>
            <p className="mt-6 flex max-w-[60ch] gap-3 rounded-md bg-info-soft px-4 py-3 text-small text-ink">
              <Info aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-info" />
              <span>Fictional demonstration project. The client, people and outcomes are invented to show the studio's process; no real engagement is described.</span>
            </p>
          </div>
        </div>
      </header>

      <div className="mt-14 lg:mt-20" style={{ background: project.preview.tint }}>
        <div className="page-container overflow-hidden pt-10 sm:pt-16 lg:pt-24">
          <div className="mx-auto max-w-6xl translate-y-[2%]"><ProjectPreview project={project} /></div>
        </div>
      </div>

      <div className="page-container">
        <StorySection id="problem" title="The problem">
          <p className="text-lead text-ink">{project.problem}</p>
        </StorySection>

        <StorySection id="goals" title="Project goals">
          <ul className="flex flex-col gap-4">
            {project.goals.map((goal) => (
              <li key={goal} className="flex gap-3 text-body text-ink">
                <span aria-hidden="true" className="icon-align-2 size-2 shrink-0 rounded-full bg-ink" />
                {goal}
              </li>
            ))}
          </ul>
        </StorySection>

        <StorySection id="process" title="Design process">
          <ol className="flex flex-col gap-8">
            {project.process.map((step) => (
              <li key={step.stage}>
                <h3 className="font-display text-h3 font-bold text-ink">{step.stage}</h3>
                <p className="mt-2 text-body text-ink">{step.text}</p>
              </li>
            ))}
          </ol>
        </StorySection>
      </div>

      <section aria-labelledby="screens" className="bg-surface-2 py-16 lg:py-24">
        <div className="page-container">
          <div className="axis-grid items-end">
            <h2 id="screens" data-reveal className="font-display text-h2 font-bold text-ink">Desktop and mobile</h2>
            <p data-reveal className="max-w-[50ch] text-body text-ink">The same interface, composed for each screen size rather than shrunk. Drawn in code as interface previews of the fictional product.</p>
          </div>
          <div className="mt-12 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <figure data-reveal>
              <ProjectPreview project={project} />
              <figcaption className="mt-3 text-small text-muted">Desktop, 1440px layout</figcaption>
            </figure>
            <figure data-reveal style={{ '--reveal-index': 1 }} className="mx-auto w-[min(62vw,240px)] lg:w-[260px]">
              <ProjectPreview project={project} device="mobile" />
              <figcaption className="mt-3 text-center text-small text-muted">Mobile, 390px layout</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <div className="page-container">
        <StorySection id="decisions" title="Design decisions">
          <div className="flex flex-col gap-8">
            {project.decisions.map((d) => (
              <div key={d.title}>
                <h3 className="font-display text-h3 font-bold text-ink">{d.title}</h3>
                <p className="mt-2 text-body text-ink">{d.text}</p>
              </div>
            ))}
          </div>
        </StorySection>

        <StorySection id="solution" title="Final solution">
          <p className="text-lead text-ink">{project.solution}</p>
          <h3 className="mt-8 font-sans text-small font-semibold text-ink">Technology stack</h3>
          <TechList tech={project.tech} className="mt-3" />
        </StorySection>
      </div>

      <section aria-labelledby="related" className="page-container py-16 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="related" className="font-display text-h2 font-bold text-ink">Related projects</h2>
          <nav aria-label="Case study navigation" className="flex gap-2">
            <Link to={`/work/${prev.slug}`} className="inline-flex h-11 items-center gap-2 rounded-md px-4 text-small font-medium text-ink ring-1 ring-inset ring-border-strong hover:bg-surface-2">
              <ArrowLeft aria-hidden="true" className="size-4" /> <span><span className="visually-hidden">Previous: </span>{prev.name}</span>
            </Link>
            <Link to={`/work/${next.slug}`} className="inline-flex h-11 items-center gap-2 rounded-md px-4 text-small font-medium text-ink ring-1 ring-inset ring-border-strong hover:bg-surface-2">
              <span><span className="visually-hidden">Next: </span>{next.name}</span> <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </nav>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {related.map((p, i) => <ProjectCard key={p.slug} project={p} index={i} />)}
        </div>
      </section>

      <ClosingCta title="Planning something similar?" />
    </article>
  );
}
