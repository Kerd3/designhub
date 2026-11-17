import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus, LayoutGrid, Table2, MoreHorizontal, Eye, Pencil, Trash2, FolderKanban, CalendarDays } from 'lucide-react';
import { PROJECT_STATUSES, PRIORITIES, ACTIVE_PROJECT_STATUSES, labelFor } from '@shared/domain.js';
import {
  AvatarGroup, Button, ConfirmDialog, DataTable, Dropdown, EmptyState, ErrorState, FilterPanel, PriorityBadge,
  ProgressBar, SearchInput, SegmentedControl, Select, SkeletonLoader, StatusBadge, useToast,
} from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { ProjectFormModal } from '@/components/forms/ProjectFormModal.jsx';
import { useCollection } from '@/hooks/useResource.js';
import { useQueryParams } from '@/hooks/useQueryParams.js';
import { useLookups } from '@/hooks/useLookups.js';
import { useSettings } from '@/context/SettingsContext.jsx';
import { projectService } from '@/services/projectService.js';
import { cn, daysUntil, formatShortDate, matchesQuery, PRIORITY_RANK, relativeDue } from '@/utils/format.js';

const SORTS = [
  { value: 'due-asc', label: 'Due date, soonest first', fn: (a, b) => a.dueDate.localeCompare(b.dueDate) },
  { value: 'due-desc', label: 'Due date, latest first', fn: (a, b) => b.dueDate.localeCompare(a.dueDate) },
  { value: 'name', label: 'Name, A to Z', fn: (a, b) => a.name.localeCompare(b.name) },
  { value: 'progress', label: 'Completion, highest first', fn: (a, b) => b.progress - a.progress },
  { value: 'priority', label: 'Priority, highest first', fn: (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] },
  { value: 'start-desc', label: 'Recently started', fn: (a, b) => b.startDate.localeCompare(a.startDate) },
];
const STATUS_OPTIONS = [{ value: 'active', label: 'Active (in progress or review)' }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))];

function DueText({ project }) {
  const overdue = project.status !== 'completed' && daysUntil(project.dueDate) < 0;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-small', overdue ? 'font-semibold text-danger' : 'text-muted')}>
      <CalendarDays aria-hidden="true" className="size-4" />
      {project.status === 'completed' ? `Delivered ${formatShortDate(project.dueDate)}` : relativeDue(project.dueDate)}
    </span>
  );
}

function ProjectActions({ project, onEdit, onDelete }) {
  return (
    <Dropdown
      menuLabel={`Actions for ${project.name}`}
      items={[
        { label: 'View details', icon: Eye, to: `/workspace/projects/${project.id}` },
        { label: 'Edit project', icon: Pencil, onSelect: () => onEdit(project) },
        { divider: true },
        { label: 'Delete project', icon: Trash2, tone: 'danger', onSelect: () => onDelete(project) },
      ]}
      renderTrigger={(props) => (
        <button type="button" {...props} aria-label={`Actions for ${project.name}`} className="relative z-10 grid size-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink">
          <MoreHorizontal aria-hidden="true" className="size-5" />
        </button>
      )}
    />
  );
}

function ProjectGridCard({ project, client, members, onEdit, onDelete }) {
  return (
    <article className="group relative flex flex-col rounded-lg bg-surface p-5 ring-1 ring-border transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md" data-testid="project-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-caption font-medium text-muted">{client?.companyName ?? 'Unknown client'} · {project.id}</p>
          <h2 className="mt-1 font-display text-h3 font-bold text-ink">
            <Link to={`/workspace/projects/${project.id}`} className="after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:underline">{project.name}</Link>
          </h2>
        </div>
        <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5"><StatusBadge status={project.status} /><PriorityBadge priority={project.priority} /></div>
      <p className="mt-3 line-clamp-2 text-small text-muted">{project.description}</p>
      <div className="mt-auto pt-5">
        <ProgressBar value={project.progress} label={`${project.name} completion`} />
        <div className="mt-4 flex items-center justify-between gap-3">
          <DueText project={project} />
          <AvatarGroup names={members.map((m) => m.name)} />
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const toast = useToast();
  const { settings, update } = useSettings();
  const projects = useCollection(projectService);
  const lookups = useLookups({ projects: false });
  const { params, setParam, clearParams } = useQueryParams();
  const [formState, setFormState] = useState({ open: false, project: null });
  const [toDelete, setToDelete] = useState(null);

  const query = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const priority = params.get('priority') ?? '';
  const sort = params.get('sort') ?? 'due-asc';
  const view = settings.appearance.projectView;


  // Deep link: /workspace/projects?new=1 opens the create dialog.
  useEffect(() => {
    if (params.get('new') === '1') {
      setFormState({ open: true, project: null });
      setParam('new', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const visible = useMemo(() => {
    const sorter = SORTS.find((s) => s.value === sort) ?? SORTS[0];
    return projects.items
      .filter((p) => !status || (status === 'active' ? ACTIVE_PROJECT_STATUSES.includes(p.status) : p.status === status))
      .filter((p) => !priority || p.priority === priority)
      .filter((p) => matchesQuery(query, p.name, p.id, p.description, p.category, lookups.clientById[p.clientId]?.companyName))
      .sort(sorter.fn);
  }, [projects.items, status, priority, query, sort, lookups.clientById]);

  const activeFilters = [query, status, priority].filter(Boolean).length;
  const membersOf = (p) => p.memberIds.map((id) => lookups.memberById[id]).filter(Boolean);

  const saveProject = async (values) => {
    if (formState.project) {
      const updated = await projects.update(formState.project.id, values);
      toast.success('Project updated', updated.name);
    } else {
      const created = await projects.create(values);
      toast.success('Project created', `${created.name} (${created.id})`);
    }
  };

  const changeStatus = async (project, nextStatus) => {
    try {
      await projects.update(project.id, { status: nextStatus });
      toast.success('Status updated', `${project.name} is now ${labelFor(nextStatus)}.`);
    } catch (error) {
      toast.error('Status not updated', error.message);
    }
  };

  const openEdit = (project) => setFormState({ open: true, project });
  const loading = projects.isLoading || lookups.isLoading;
  const failed = projects.isError || lookups.isError;

  const columns = [
    {
      key: 'name', header: 'Project', sortable: true,
      render: (p) => (
        <div className="min-w-48">
          <Link to={`/workspace/projects/${p.id}`} className="font-semibold text-ink hover:underline">{p.name}</Link>
          <p className="text-caption text-muted">{p.id} · {p.category}</p>
        </div>
      ),
    },
    { key: 'client', header: 'Client', sortable: true, hideBelow: 'md', sortValue: (p) => lookups.clientById[p.clientId]?.companyName ?? '', render: (p) => lookups.clientById[p.clientId]?.companyName ?? '—' },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (p) => (
        <Select size="sm" label={`Status of ${p.name}`} hideLabel value={p.status} onChange={(e) => changeStatus(p, e.target.value)} options={PROJECT_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))} className="w-36" />
      ),
    },
    { key: 'priority', header: 'Priority', sortable: true, hideBelow: 'lg', sortValue: (p) => PRIORITY_RANK[p.priority], render: (p) => <PriorityBadge priority={p.priority} /> },
    { key: 'dueDate', header: 'Due', sortable: true, render: (p) => <span className="whitespace-nowrap">{formatShortDate(p.dueDate)}</span> },
    { key: 'progress', header: 'Completion', sortable: true, hideBelow: 'sm', render: (p) => <ProgressBar value={p.progress} label={`${p.name} completion`} className="w-36" /> },
    { key: 'team', header: 'Team', hideBelow: 'xl', render: (p) => <AvatarGroup names={membersOf(p).map((m) => m.name)} /> },
    { key: 'actions', header: <span className="visually-hidden">Actions</span>, align: 'right', render: (p) => <ProjectActions project={p} onEdit={openEdit} onDelete={setToDelete} /> },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every client project, its status, schedule and team."
        actions={<Button leftIcon={Plus} onClick={() => setFormState({ open: true, project: null })}>New project</Button>}
      />

      <FilterPanel
        search={<SearchInput value={query} onChange={(v) => setParam('q', v)} label="Search projects" placeholder="Search by name, client or ID" />}
        activeCount={activeFilters}
        onClear={() => clearParams()}
      >
        <Select label="Status" size="sm" placeholder="All statuses" value={status} onChange={(e) => setParam('status', e.target.value)} options={STATUS_OPTIONS} className="md:w-52" />
        <Select label="Priority" size="sm" placeholder="All priorities" value={priority} onChange={(e) => setParam('priority', e.target.value)} options={PRIORITIES.map((p) => ({ value: p, label: labelFor(p) }))} className="md:w-40" />
        <Select label="Sort by" size="sm" value={sort} onChange={(e) => setParam('sort', e.target.value === 'due-asc' ? '' : e.target.value)} options={SORTS} className="md:w-56" />
        <div className="flex flex-col gap-1.5 md:ml-auto">
          <span className="text-small font-medium text-ink" id="view-label">View</span>
          <SegmentedControl
            label="View"
            size="sm"
            value={view}
            onChange={(v) => update('appearance', { projectView: v })}
            options={[{ value: 'grid', label: 'Grid', icon: LayoutGrid }, { value: 'table', label: 'Table', icon: Table2 }]}
          />
        </div>
      </FilterPanel>

      <p className="mb-4 mt-4 text-small text-muted" aria-live="polite" data-testid="project-count">
        {loading ? 'Loading projects…' : `${visible.length} of ${projects.items.length} projects`}
      </p>

      {failed && <ErrorState title="Projects could not load" error={projects.error ?? lookups.error} onRetry={() => { projects.reload(); lookups.reload(); }} />}
      {loading && !failed && <SkeletonLoader variant={view === 'table' ? 'table' : 'cards'} count={6} label="Loading projects" />}

      {!loading && !failed && visible.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title={projects.items.length ? 'No projects match these filters' : 'No projects yet'}
          description={projects.items.length ? 'Try a different search or clear the filters.' : 'Create the first project to get started.'}
          action={projects.items.length ? <Button variant="outline" onClick={() => clearParams()}>Clear filters</Button> : <Button leftIcon={Plus} onClick={() => setFormState({ open: true, project: null })}>New project</Button>}
        />
      )}

      {!loading && !failed && visible.length > 0 && (view === 'table' ? (
        <DataTable caption="Projects" columns={columns} rows={visible} pageSize={8} itemLabel="projects" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProjectGridCard key={p.id} project={p} client={lookups.clientById[p.clientId]} members={membersOf(p)} onEdit={openEdit} onDelete={setToDelete} />
          ))}
        </div>
      ))}

      <ProjectFormModal
        open={formState.open}
        project={formState.project}
        clients={lookups.clients}
        team={lookups.team}
        onClose={() => setFormState({ open: false, project: null })}
        onSubmit={saveProject}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.name ?? 'project'}?`}
        message={<>This permanently removes the project <strong className="font-semibold text-ink">{toDelete?.name}</strong> and its tasks from the demo data. You can restore everything with Settings → Demo data → Reset.</>}
        confirmLabel="Delete project"
        onConfirm={async () => {
          const name = toDelete.name;
          await projects.remove(toDelete.id);
          toast.success('Project deleted', name);
        }}
      />
    </>
  );
}
