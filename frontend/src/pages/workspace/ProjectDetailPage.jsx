import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Pencil, Trash2, ListChecks, Save, FolderX } from 'lucide-react';
import { PROJECT_STATUSES, labelFor } from '@shared/domain.js';
import {
  Avatar, Breadcrumb, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, PriorityBadge, ProgressBar,
  Select, SkeletonLoader, StatusBadge, useToast,
} from '@/components/ui';
import { ProjectFormModal } from '@/components/forms/ProjectFormModal.jsx';
import { useResource } from '@/hooks/useResource.js';
import { useLookups } from '@/hooks/useLookups.js';
import { projectService } from '@/services/projectService.js';
import { taskService } from '@/services/taskService.js';
import { formatDate, relativeDue } from '@/utils/format.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const sliderId = useId();
  const project = useResource((opts) => projectService.get(projectId, opts), [projectId]);
  const tasks = useResource((opts) => taskService.list(opts), [projectId]);
  const lookups = useLookups({ projects: false });
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);

  const p = project.data;
  useEffect(() => { if (p) setProgress(p.progress); }, [p]);

  const projectTasks = useMemo(() => (tasks.data ?? []).filter((t) => t.projectId === projectId).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [tasks.data, projectId]);

  if (project.isError) {
    if (project.error?.isNotFound) {
      return (
        <EmptyState
          icon={FolderX}
          title="Project not found"
          description="It may have been deleted. Restore the original data any time from Settings."
          action={<Button to="/workspace/projects">Back to projects</Button>}
        />
      );
    }
    return <ErrorState title="This project could not load" error={project.error} onRetry={project.reload} />;
  }
  if (project.isLoading || lookups.isLoading) return <SkeletonLoader variant="cards" count={2} label="Loading project" />;

  const client = lookups.clientById[p.clientId];
  const members = p.memberIds.map((id) => lookups.memberById[id]).filter(Boolean);

  const update = async (patch, message) => {
    try {
      const updated = await projectService.update(p.id, patch);
      project.setData(updated);
      toast.success(message, p.name);
    } catch (error) {
      toast.error('Change not saved', error.message);
      throw error;
    }
  };

  const saveProgress = async () => {
    setSavingProgress(true);
    try {
      await update({ progress }, `Completion set to ${progress}%`);
    } catch { /* toast already shown */ } finally {
      setSavingProgress(false);
    }
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Projects', to: '/workspace/projects' }, { label: p.name }]} className="mb-4" />
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-small text-muted">{p.id} · {p.category}</p>
          <h1 className="mt-1 font-display text-h3 font-bold text-ink">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={p.status} />
            <PriorityBadge priority={p.priority} />
            {client && <Link to={`/workspace/clients?open=${client.id}`} className="text-small font-medium text-primary hover:underline">{client.companyName}</Link>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" leftIcon={Pencil} onClick={() => setEditing(true)}>Edit project</Button>
          <Button variant="danger" leftIcon={Trash2} onClick={() => setDeleting(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader title="Overview" />
            <p className="text-body text-ink">{p.description || 'No description yet.'}</p>
            <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-3">
              <div><dt className="text-small text-muted">Start date</dt><dd className="mt-1 font-medium text-ink">{formatDate(p.startDate)}</dd></div>
              <div><dt className="text-small text-muted">Due date</dt><dd className="mt-1 font-medium text-ink">{formatDate(p.dueDate)}</dd></div>
              <div><dt className="text-small text-muted">Schedule</dt><dd className="mt-1 font-medium text-ink">{p.status === 'completed' ? 'Delivered' : relativeDue(p.dueDate)}</dd></div>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Tasks"
              description={`${projectTasks.filter((t) => t.status !== 'completed').length} open of ${projectTasks.length}`}
              action={<Button to={`/workspace/tasks?project=${p.id}`} variant="ghost" size="sm" leftIcon={ListChecks}>Open in Tasks</Button>}
            />
            {tasks.isError && <ErrorState error={tasks.error} onRetry={tasks.reload} />}
            {!tasks.isError && projectTasks.length === 0 && <p className="py-4 text-small text-muted">No tasks for this project yet.</p>}
            <ul className="flex flex-col">
              {projectTasks.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <Link to={`/workspace/tasks?open=${t.id}`} className="text-small font-medium text-ink hover:underline">{t.title}</Link>
                    <p className="text-caption text-muted">{lookups.memberById[t.assigneeId]?.name ?? 'Unassigned'} · {relativeDue(t.dueDate)}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Status and progress" />
            <Select
              label="Project status"
              value={p.status}
              onChange={(e) => update({ status: e.target.value }, `Status changed to ${labelFor(e.target.value)}`).catch(() => {})}
              options={PROJECT_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))}
            />
            <div className="mt-6">
              <label htmlFor={sliderId} className="flex justify-between text-small font-medium text-ink">
                Completion <span className="tabular-nums text-muted">{progress}%</span>
              </label>
              <input id={sliderId} type="range" min="0" max="100" step="5" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-[var(--color-primary)]" />
              <ProgressBar value={p.progress} label="Saved completion" className="mt-3" />
              <Button className="mt-4" variant="secondary" size="sm" leftIcon={Save} onClick={saveProgress} loading={savingProgress} loadingText="Saving…" disabled={progress === p.progress}>
                Save completion
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Team" description={`${members.length} assigned`} />
            <ul className="flex flex-col gap-3">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" decorative />
                  <div className="min-w-0"><p className="truncate text-small font-medium text-ink">{m.name}</p><p className="truncate text-caption text-muted">{m.role}</p></div>
                </li>
              ))}
              {members.length === 0 && <li className="text-small text-muted">No one assigned yet.</li>}
            </ul>
          </Card>
        </div>
      </div>

      <ProjectFormModal
        open={editing}
        project={p}
        clients={lookups.clients}
        team={lookups.team}
        onClose={() => setEditing(false)}
        onSubmit={async (values) => {
          const updated = await projectService.update(p.id, values);
          project.setData(updated);
          toast.success('Project updated', updated.name);
        }}
      />
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete ${p.name}?`}
        message="This permanently removes the project and its tasks from the demo data. You can restore everything from Settings → Demo data."
        confirmLabel="Delete project"
        onConfirm={async () => {
          await projectService.remove(p.id);
          toast.success('Project deleted', p.name);
          navigate('/workspace/projects', { replace: true });
        }}
      />
    </>
  );
}
