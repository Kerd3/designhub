import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams.js';
import { SearchX } from 'lucide-react';
import { portfolio, PORTFOLIO_CATEGORIES } from '@/data/portfolio.js';
import { ProjectCard } from '@/components/portfolio/ProjectCard.jsx';
import { Button, EmptyState, SearchInput } from '@/components/ui';
import { usePageMeta } from '@/hooks/usePageMeta.js';
import { cn, matchesQuery } from '@/utils/format.js';

export default function WorkPage() {
  usePageMeta({
    title: 'Our Work',
    description: 'Case studies in website design, UI/UX, web applications, dashboards and e-commerce. All projects are fictional demonstration work.',
  });

  // Filters live in the URL so results can be shared and survive reloads.
  const { params, setParam: setFilter, clearParams } = useQueryParams();
  const category = PORTFOLIO_CATEGORIES.includes(params.get('category')) ? params.get('category') : 'All';
  const query = params.get('q') ?? '';

  const results = useMemo(
    () =>
      portfolio.filter(
        (p) => (category === 'All' || p.category === category) && matchesQuery(query, p.name, p.summary, p.description, p.category, ...p.tech),
      ),
    [category, query],
  );

  const counts = useMemo(() => Object.fromEntries(PORTFOLIO_CATEGORIES.map((c) => [c, portfolio.filter((p) => p.category === c).length])), []);
  const clear = () => clearParams();

  return (
    <>
      <section aria-labelledby="work-page-title" className="page-container pb-12 pt-14 lg:pb-16 lg:pt-24">
        <h1 id="work-page-title" className="font-display text-display font-extrabold text-ink">
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise">Our work</span></span>
        </h1>
        <div className="axis-grid mt-8">
          <p className="text-body text-muted lg:max-w-[30ch] lg:pr-8">Every project on this page is fictional, written to demonstrate process and craft.</p>
          <p className="max-w-[50ch] text-lead text-ink">Websites, product design, web applications, dashboards and online shops. Filter by the kind of work you need, or search by technology.</p>
        </div>
      </section>

      <section aria-label="Projects" className="page-container pb-24 lg:pb-36">
        <div className="sticky top-18 z-20 -mx-4 bg-bg px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Filter by category" className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin lg:flex-wrap lg:overflow-visible">
              {['All', ...PORTFOLIO_CATEGORIES].map((c) => {
                const active = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter('category', c)}
                    className={cn(
                      'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-small font-medium transition-colors',
                      active ? 'bg-secondary text-bg' : 'bg-surface-2 text-ink hover:bg-surface-3',
                    )}
                  >
                    {c}
                    <span className={cn('tabular-nums', active ? 'text-bg/75' : 'text-muted')}>{c === 'All' ? portfolio.length : counts[c]}</span>
                  </button>
                );
              })}
            </div>
            <SearchInput
              value={query}
              onChange={(v) => setFilter('q', v)}
              label="Search projects"
              placeholder="Search projects or technologies"
              className="w-full lg:w-80"
            />
          </div>
          <p className="mt-3 text-small text-muted" aria-live="polite" data-testid="result-count">
            {results.length === 1 ? '1 project' : `${results.length} projects`}
            {category !== 'All' && ` in ${category}`}
            {query && ` matching “${query}”`}
          </p>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            className="mt-8"
            title="No projects match those filters"
            description="Try another category or a broader search term."
            action={<Button variant="outline" onClick={clear}>Clear filters</Button>}
          />
        ) : (
          <div className="mt-8 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((project, i) => <ProjectCard key={project.slug} project={project} headingLevel="h2" index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
