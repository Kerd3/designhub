import { useMemo, useState } from 'react';
import { Plus, Columns3, Table2, ListChecks, CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { TASK_STATUSES, PRIORITIES, labelFor } from '@shared/domain.js';
import {
  Avatar, Button, ConfirmDialog, DataTable, Dropdown, EmptyState, ErrorState, FilterPanel, PriorityBadge, SearchInput,
  SegmentedControl, Select, SkeletonLoader, StatusBadge, useToast,
} from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { TaskFormModal } from '@/components/forms/TaskFormModal.jsx';
import { useCollection } from '@/hooks/useResource.js';
import { useQueryParams } from '@/hooks/useQueryParams.js';
import { useLookups } from '@/hooks/useLookups.js';
import { useSettings } from '@/context/SettingsContext.jsx';
import { taskService } from '@/services/taskService.js';
import { cn, daysUntil, formatShortDate, matchesQuery, PRIORITY_RANK, relativeDue } from '@/utils/format.js';

const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({ value: s, label: labelFor(s) }));

function TaskCard({ task, project, assignee, onOpen, onMove, onDragStart, dragging }) {
  const overdue = task.status !== 'completed' && daysUntil(task.dueDate) < 0;
  return (
    <li
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id); }}
      onDragEnd={() => onDragStart(null)}
      className={cn('cursor-grab rounded-lg bg-surface p-4 ring-1 ring-border transition-[box-shadow,opacity] hover:shadow-md active:cursor-grabbing', dragging && 'opacity-50')}
      data-testid="task-card"
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onOpen(task)} className="text-left text-small font-semibold text-ink hover:underline">{task.title}</button>
        <PriorityBadge priority={task.priority} className="shrink-0" />
      </div>
      <p className="mt-1 truncate text-caption text-muted">{project?.name ?? 'No project'}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-caption text-ink">
          <Avatar name={assignee?.name ?? 'Unassigned'} size="xs" decorative />
          <span className="truncate">{assignee?.name ?? 'Unassigned'}</span>
        </span>
        <span className={cn('inline-flex shrink-0 items-center gap-1 text-caption', overdue ? 'font-semibold text-danger' : 'text-muted')}>
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {task.status === 'completed' ? formatShortDate(task.dueDate) : relativeDue(task.dueDate)}
        </span>
      </div>
      {/* Keyboard and screen-reader alternative to drag and drop. */}
      <Select size="sm" label={`Move “${task.title}” to`} hideLabel value={task.status} onChange={(e) => onMove(task, e.target.value)} options={STATUS_OPTIONS} className="mt-3" />
    </li>
  );
}

function Board({ tasks, columns, lookups, onOpen, onMove }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 pb-4 scrollbar-thin sm:mx-0 sm:px-0">
      <div className={cn('grid gap-4', columns.length > 1 ? 'min-w-[960px] grid-cols-4' : 'max-w-md')}>
        {columns.map((status) => {
          const items = tasks.filter((t) => t.status === status);
          return (
            <section
              key={status}
              aria-labelledby={`col-${status}`}
              onDragOver={(e) => { e.preventDefault(); setOverColumn(status); }}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverColumn(null);
                const task = tasks.find((t) => t.id === e.dataTransfer.getData('text/plain'));
                if (task && task.status !== status) onMove(task, status);
              }}
              className={cn('flex flex-col rounded-xl bg-surface-2 p-3 transition-colors', overColumn === status && 'bg-primary-soft ring-2 ring-primary')}
              data-testid={`column-${status}`}
            >
              <div className="flex items-center justify-between px-1 pb-3 pt-1">
                <h2 id={`col-${status}`} className="flex items-center gap-2"><StatusBadge status={status} /></h2>
                <span className="text-caption font-semibold tabular-nums text-muted">{items.length}<span className="visually-hidden"> tasks</span></span>
              </div>
              <ul className="flex min-h-24 flex-col gap-3">
                {items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={lookups.projectById[task.projectId]}
                    assignee={lookups.memberById[task.assigneeId]}
                    onOpen={onOpen}
                    onMove={onMove}
                    onDragStart={setDraggingId}
                    dragging={draggingId === task.id}
                  />
                ))}
                {items.length === 0 && <li className="rounded-lg px-3 py-6 text-center text-caption text-muted border border-dashed border-border-strong">Drop a task here</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const toast = useToast();
  const { settings, update } = useSettings();
  const tasks = useCollection(taskService);
  const lookups = useLookups({ clients: false });
  const { params, setParam, clearParams } = useQueryParams();
  const [form, setForm] = useState({ open: false, task: null });
  const [toDelete, setToDelete] = useState(null);
  const view = settings.appearance.taskView;

  const query = params.get('q') ?? '';
  const project = params.get('project') ?? '';
  const status = params.get('status') ?? '';
  const priority = params.get('priority') ?? '';
  const assignee = params.get('assignee') ?? '';
  const openId = params.get('open');


  const visible = useMemo(
    () => tasks.items
      .filter((t) => (!project || t.projectId === project) && (!status || t.status === status) && (!priority || t.priority === priority) && (!assignee || t.assigneeId === assignee))
      .filter((t) => matchesQuery(query, t.title, t.description, t.id, lookups.projectById[t.projectId]?.name))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks.items, project, status, priority, assignee, query, lookups.projectById],
  );

  const editing = form.task ?? (openId ? tasks.items.find((t) => t.id === openId) : null);
  const formOpen = form.open || Boolean(editing);
  const closeForm = () => { setForm({ open: false, task: null }); if (openId) setParam('open', ''); };

  const move = async (task, nextStatus) => {
    try {
      await tasks.update(task.id, { status: nextStatus });
      toast.success(`Moved to ${labelFor(nextStatus)}`, task.title);
    } catch (error) {
      toast.error('Task not moved', error.message);
    }
  };
  const assign = async (task, assigneeId) => {
    try {
      await tasks.update(task.id, { assigneeId });
      toast.success('Task reassigned', `${task.title} → ${lookups.memberById[assigneeId]?.name}`);
    } catch (error) {
      toast.error('Task not reassigned', error.message);
    }
  };

  const loading = tasks.isLoading || lookups.isLoading;
  const failed = tasks.isError || lookups.isError;
  const activeFilters = [query, project, status, priority, assignee].filter(Boolean).length;

  const columns = [
    { key: 'title', header: 'Task', sortable: true, render: (t) => <div className="min-w-52"><button type="button" onClick={() => setForm({ open: true, task: t })} className="text-left font-semibold text-ink hover:underline">{t.title}</button><p className="text-caption text-muted">{lookups.projectById[t.projectId]?.name}</p></div> },
    {
      key: 'assigneeId', header: 'Assigned to', sortable: true, hideBelow: 'md', sortValue: (t) => lookups.memberById[t.assigneeId]?.name ?? '',
      render: (t) => <Select size="sm" label={`Assignee for ${t.title}`} hideLabel value={t.assigneeId} onChange={(e) => assign(t, e.target.value)} options={lookups.team.map((m) => ({ value: m.id, label: m.name }))} className="w-44" />,
    },
    { key: 'dueDate', header: 'Due', sortable: true, render: (t) => <span className={cn('whitespace-nowrap', t.status !== 'completed' && daysUntil(t.dueDate) < 0 && 'font-semibold text-danger')}>{formatShortDate(t.dueDate)}</span> },
    { key: 'priority', header: 'Priority', sortable: true, hideBelow: 'sm', sortValue: (t) => PRIORITY_RANK[t.priority], render: (t) => <PriorityBadge priority={t.priority} /> },
    { key: 'status', header: 'Status', sortable: true, render: (t) => <Select size="sm" label={`Status of ${t.title}`} hideLabel value={t.status} onChange={(e) => move(t, e.target.value)} options={STATUS_OPTIONS} className="w-36" /> },
    {
      key: 'actions', header: <span className="visually-hidden">Actions</span>, align: 'right',
      render: (t) => (
        <Dropdown
          menuLabel={`Actions for ${t.title}`}
          items={[{ label: 'Edit task', icon: Pencil, onSelect: () => setForm({ open: true, task: t }) }, { divider: true }, { label: 'Delete task', icon: Trash2, tone: 'danger', onSelect: () => setToDelete(t) }]}
          renderTrigger={(props) => <button type="button" {...props} aria-label={`Actions for ${t.title}`} className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"><MoreHorizontal aria-hidden="true" className="size-5" /></button>}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Tasks" description="Plan, assign and track work across every project." actions={<Button leftIcon={Plus} onClick={() => setForm({ open: true, task: null })}>New task</Button>} />

      <FilterPanel
        search={<SearchInput value={query} onChange={(v) => setParam('q', v)} label="Search tasks" placeholder="Search tasks" />}
        activeCount={activeFilters}
        onClear={() => clearParams()}
      >
        <Select label="Project" size="sm" placeholder="All projects" value={project} onChange={(e) => setParam('project', e.target.value)} options={lookups.projects.map((p) => ({ value: p.id, label: p.name }))} className="md:w-56" />
        <Select label="Status" size="sm" placeholder="All statuses" value={status} onChange={(e) => setParam('status', e.target.value)} options={STATUS_OPTIONS} className="md:w-36" />
        <Select label="Priority" size="sm" placeholder="All priorities" value={priority} onChange={(e) => setParam('priority', e.target.value)} options={PRIORITIES.map((p) => ({ value: p, label: labelFor(p) }))} className="md:w-36" />
        <Select label="Assignee" size="sm" placeholder="Everyone" value={assignee} onChange={(e) => setParam('assignee', e.target.value)} options={lookups.team.map((m) => ({ value: m.id, label: m.name }))} className="md:w-44" />
        <div className="flex flex-col gap-1.5 md:ml-auto">
          <span className="text-small font-medium text-ink">View</span>
          <SegmentedControl label="View" size="sm" value={view} onChange={(v) => update('appearance', { taskView: v })} options={[{ value: 'board', label: 'Board', icon: Columns3 }, { value: 'table', label: 'Table', icon: Table2 }]} />
        </div>
      </FilterPanel>
      <p className="mb-4 mt-4 text-small text-muted" aria-live="polite" data-testid="task-count">
        {loading ? 'Loading tasks…' : `${visible.length} of ${tasks.items.length} tasks`}
        {view === 'board' && !loading && <span className="hidden md:inline"> · Drag cards between columns, or use the status menu on each card.</span>}
      </p>

      {failed && <ErrorState title="Tasks could not load" error={tasks.error ?? lookups.error} onRetry={() => { tasks.reload(); lookups.reload(); }} />}
      {loading && !failed && <SkeletonLoader variant={view === 'board' ? 'cards' : 'table'} count={4} label="Loading tasks" />}
      {!loading && !failed && visible.length === 0 && (
        <EmptyState icon={ListChecks} title={tasks.items.length ? 'No tasks match these filters' : 'No tasks yet'} description="Change the filters or create a task." action={<Button variant="outline" onClick={() => clearParams()}>Clear filters</Button>} />
      )}
      {!loading && !failed && visible.length > 0 && (view === 'board'
        ? <Board tasks={visible} columns={status ? [status] : TASK_STATUSES} lookups={lookups} onOpen={(t) => setForm({ open: true, task: t })} onMove={move} />
        : <DataTable caption="Tasks" columns={columns} rows={visible} pageSize={10} itemLabel="tasks" />)}

      <TaskFormModal
        open={formOpen}
        task={editing}
        preset={project ? { projectId: project } : undefined}
        projects={lookups.projects}
        team={lookups.team}
        onClose={closeForm}
        onDelete={(t) => { closeForm(); setToDelete(t); }}
        onSubmit={async (values) => {
          if (editing) {
            await tasks.update(editing.id, values);
            toast.success('Task updated', values.title);
          } else {
            const created = await tasks.create(values);
            toast.success('Task created', `${created.title} (${created.id})`);
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete this task?"
        message={<>“{toDelete?.title}” will be removed. Restore all demo data any time from Settings.</>}
        confirmLabel="Delete task"
        onConfirm={async () => {
          const title = toDelete.title;
          await tasks.remove(toDelete.id);
          toast.success('Task deleted', title);
        }}
      />
    </>
  );
}
