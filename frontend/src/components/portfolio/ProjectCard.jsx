import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/utils/format.js';
import { ProjectPreview } from './ProjectPreview.jsx';

export function TechList({ tech, className }) {
  return (
    <ul aria-label="Technologies" className={cn('flex flex-wrap gap-1.5', className)}>
      {tech.map((t) => (
        <li key={t} className="rounded-sm bg-surface-2 px-2 py-0.5 text-caption font-medium text-muted">{t}</li>
      ))}
    </ul>
  );
}

/** Portfolio grid card. The title link is stretched so the whole card is one target. */
export function ProjectCard({ project, headingLevel: H = 'h3', index = 0 }) {
  return (
    <article data-reveal style={{ '--reveal-index': index % 3 }} className="group relative flex flex-col">
      <div className="overflow-hidden rounded-lg px-[7%] pt-[8%]" style={{ background: project.preview.tint }}>
        <ProjectPreview
          project={project}
          className="translate-y-[3%] transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:-translate-y-[1%] group-focus-within:-translate-y-[1%]"
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-small font-medium text-muted">{project.category}</span>
        <span aria-hidden="true" className="text-subtle">·</span>
        <span className="text-small text-muted">{project.year}</span>
        <Badge tone="outline" className="ml-auto">Fictional project</Badge>
      </div>
      <H className="mt-2 font-display text-h3 font-bold text-ink">
        <Link to={`/work/${project.slug}`} className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {project.name}
        </Link>
      </H>
      <p className="mt-1.5 text-body text-muted">{project.description}</p>
      <TechList tech={project.tech} className="mt-4" />
      <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-primary">
        View case study <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute -inset-2 rounded-xl ring-2 ring-primary opacity-0 group-has-[:focus-visible]:opacity-100" />
    </article>
  );
}
