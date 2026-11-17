import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Building2, FolderKanban, ListChecks, User, SearchX } from 'lucide-react';
import { Modal, SearchInput, LoadingState, ErrorState, StatusBadge } from '@/components/ui';
import { useLookups } from '@/hooks/useLookups.js';
import { useResource } from '@/hooks/useResource.js';
import { taskService } from '@/services/taskService.js';
import { matchesQuery } from '@/utils/format.js';

function ResultGroup({ title, icon: Icon, items, onSelect }) {
  if (!items.length) return null;
  return (
    <section aria-label={title} className="mt-5 first:mt-4">
      <h3 className="px-1 font-sans text-caption font-semibold text-muted">{title}</h3>
      <ul className="mt-2 flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={item.to} onClick={onSelect} className="flex items-center gap-3 rounded-md px-2 py-3 hover:bg-surface-2 focus-visible:bg-surface-2">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-small font-medium text-ink">{item.label}</span>
                {item.detail && <span className="block truncate text-caption text-muted">{item.detail}</span>}
              </span>
              {item.status && <StatusBadge status={item.status} />}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Workspace-wide search across projects, clients, tasks and team members. */
export function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Search the workspace" description="Projects, clients, tasks and team members." size="md">
      <SearchInput value={query} onChange={setQuery} label="Search the workspace" placeholder="Type a name, company or task" data-autofocus />
      {open && <SearchResults query={query} onSelect={onClose} />}
    </Modal>
  );
}

function SearchResults({ query, onSelect }) {
  const lookups = useLookups();
  const tasks = useResource((opts) => taskService.list(opts), []);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const cap = (list) => list.slice(0, 5);
    return {
      projects: cap(lookups.projects.filter((p) => matchesQuery(query, p.name, p.id, lookups.clientById[p.clientId]?.companyName)).map((p) => ({ id: p.id, label: p.name, detail: lookups.clientById[p.clientId]?.companyName, status: p.status, to: `/workspace/projects/${p.id}` }))),
      clients: cap(lookups.clients.filter((c) => matchesQuery(query, c.companyName, c.contactPerson, c.industry)).map((c) => ({ id: c.id, label: c.companyName, detail: c.contactPerson, status: c.status, to: `/workspace/clients?open=${c.id}` }))),
      tasks: cap((tasks.data ?? []).filter((t) => matchesQuery(query, t.title, t.id)).map((t) => ({ id: t.id, label: t.title, detail: lookups.projectById[t.projectId]?.name, status: t.status, to: `/workspace/tasks?open=${t.id}` }))),
      team: cap(lookups.team.filter((m) => matchesQuery(query, m.name, m.role, m.department)).map((m) => ({ id: m.id, label: m.name, detail: m.role, to: `/workspace/team?open=${m.id}` }))),
    };
  }, [query, lookups, tasks.data]);

  if (lookups.isError || tasks.isError) return <ErrorState className="mt-4" error={lookups.error ?? tasks.error} onRetry={() => { lookups.reload(); tasks.reload(); }} />;
  if (lookups.isLoading || tasks.isLoading) return <LoadingState label="Loading workspace data…" />;
  if (!results) return <p className="mt-4 px-1 text-small text-muted">Start typing to search. Press Escape to close.</p>;

  const total = Object.values(results).reduce((n, list) => n + list.length, 0);
  return (
    <div aria-live="polite">
      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center text-small text-muted">
          <SearchX aria-hidden="true" className="size-6" />
          No results for “{query}”.
        </div>
      ) : (
        <>
          <p className="visually-hidden">{total} results</p>
          <ResultGroup title="Projects" icon={FolderKanban} items={results.projects} onSelect={onSelect} />
          <ResultGroup title="Clients" icon={Building2} items={results.clients} onSelect={onSelect} />
          <ResultGroup title="Tasks" icon={ListChecks} items={results.tasks} onSelect={onSelect} />
          <ResultGroup title="Team" icon={User} items={results.team} onSelect={onSelect} />
        </>
      )}
    </div>
  );
}
