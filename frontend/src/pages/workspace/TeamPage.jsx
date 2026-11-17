import { useMemo } from 'react';
import { Link } from 'react-router';
import { Users, Mail } from 'lucide-react';
import { DEPARTMENTS, AVAILABILITY, ACTIVE_PROJECT_STATUSES, labelFor } from '@shared/domain.js';
import { Avatar, EmptyState, ErrorState, FilterPanel, Modal, SearchInput, Select, SkeletonLoader, StatusBadge, PriorityBadge, useToast } from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { useCollection, useResource } from '@/hooks/useResource.js';
import { useQueryParams } from '@/hooks/useQueryParams.js';
import { teamService } from '@/services/teamService.js';
import { projectService } from '@/services/projectService.js';
import { taskService } from '@/services/taskService.js';
import { cn, matchesQuery, relativeDue } from '@/utils/format.js';

const teamCollectionService = { list: teamService.list, update: (id, patch) => teamService.updateAvailability(id, patch.availability) };

/** Workload = open tasks against a simple capacity of 6 open tasks per full-time person. */
function workload(member, openTasks) {
  if (member.availability === 'unavailable') return { label: 'Unavailable', pct: 0, tone: 'bg-surface-3' };
  const capacity = Math.max(1, Math.round((member.capacityHours / 40) * 6));
  const pct = Math.min(100, Math.round((openTasks / capacity) * 100));
  return { label: pct >= 85 ? 'At capacity' : pct >= 50 ? 'Busy' : 'Has capacity', pct, tone: pct >= 85 ? 'bg-danger' : pct >= 50 ? 'bg-warning' : 'bg-success' };
}

export default function TeamPage() {
  const toast = useToast();
  const team = useCollection(teamCollectionService);
  const data = useResource(async ({ signal }) => {
    const [projects, tasks] = await Promise.all([projectService.list({ signal }), taskService.list({ signal })]);
    return { projects, tasks };
  }, []);
  const { params, setParam, clearParams } = useQueryParams();
  const query = params.get('q') ?? '';
  const department = params.get('department') ?? '';
  const openId = params.get('open');

  const stats = useMemo(() => {
    const out = {};
    for (const m of team.items) {
      const projects = (data.data?.projects ?? []).filter((p) => p.memberIds.includes(m.id) && ACTIVE_PROJECT_STATUSES.includes(p.status));
      const tasks = (data.data?.tasks ?? []).filter((t) => t.assigneeId === m.id && t.status !== 'completed').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      out[m.id] = { projects, tasks, load: workload(m, tasks.length) };
    }
    return out;
  }, [team.items, data.data]);

  const visible = team.items.filter((m) => (!department || m.department === department) && matchesQuery(query, m.name, m.role, m.department, ...(m.skills ?? [])));
  const selected = team.items.find((m) => m.id === openId);
  const loading = team.isLoading || data.isLoading;

  return (
    <>
      <PageHeader title="Team" description="Fictional studio members, their projects and current workload." />
      <FilterPanel
        search={<SearchInput value={query} onChange={(v) => setParam('q', v)} label="Search team" placeholder="Search by name, role or skill" />}
        activeCount={[query, department].filter(Boolean).length}
        onClear={() => clearParams()}
      >
        <Select label="Department" size="sm" placeholder="All departments" value={department} onChange={(e) => setParam('department', e.target.value)} options={DEPARTMENTS} className="md:w-48" />
      </FilterPanel>
      <p className="mb-4 mt-4 text-small text-muted" aria-live="polite">{loading ? 'Loading team…' : `${visible.length} of ${team.items.length} people`}</p>

      {(team.isError || data.isError) && <ErrorState title="The team could not load" error={team.error ?? data.error} onRetry={() => { team.reload(); data.reload(); }} />}
      {loading && <SkeletonLoader variant="cards" count={6} label="Loading team" />}
      {!loading && !team.isError && visible.length === 0 && <EmptyState icon={Users} title="No one matches" description="Try another name, role or department." />}

      {!loading && !team.isError && visible.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => {
            const s = stats[m.id];
            return (
              <li key={m.id} className="relative flex flex-col rounded-lg bg-surface p-5 ring-1 ring-border transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  <Avatar name={m.name} size="lg" decorative />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-h3 font-bold text-ink">
                      <button type="button" onClick={() => setParam('open', m.id)} className="text-left after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:underline">{m.name}</button>
                    </h2>
                    <p className="text-small text-muted">{m.role}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge status={m.availability} /><span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-caption font-medium text-ink">{m.department}</span></div>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-caption"><span className="font-medium text-ink">{s.load.label}</span><span className="text-muted">{s.tasks.length} open tasks · {s.projects.length} active projects</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={`Workload ${s.load.pct}% of capacity`}>
                    <div className={cn('h-full rounded-full', s.load.tone)} style={{ width: `${s.load.pct}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={Boolean(selected)} onClose={() => setParam('open', '')} variant="panel" title={selected?.name ?? ''} description={selected ? `${selected.role} · ${selected.department}` : ''}>
        {selected && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4"><Avatar name={selected.name} size="xl" decorative /><p className="text-body text-ink">{selected.bio}</p></div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><dt className="text-small text-muted">Work email</dt><dd className="mt-0.5"><a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline break-all"><Mail aria-hidden="true" className="size-4 shrink-0" />{selected.email}</a></dd></div>
              <div><dt className="text-small text-muted">Location</dt><dd className="mt-0.5 font-medium text-ink">{selected.location}</dd></div>
              <div><dt className="text-small text-muted">Weekly capacity</dt><dd className="mt-0.5 font-medium text-ink">{selected.capacityHours} hours</dd></div>
            </dl>
            <Select
              label="Availability"
              value={selected.availability}
              options={AVAILABILITY.map((a) => ({ value: a, label: labelFor(a) }))}
              onChange={async (e) => {
                try {
                  await team.update(selected.id, { availability: e.target.value });
                  toast.success('Availability updated', `${selected.name} is ${labelFor(e.target.value).toLowerCase()}.`);
                } catch (error) {
                  toast.error('Availability not updated', error.message);
                }
              }}
            />
            <div><h3 className="font-sans text-small font-semibold text-ink">Skills</h3><ul className="mt-2 flex flex-wrap gap-1.5">{selected.skills.map((sk) => <li key={sk} className="rounded-sm bg-surface-2 px-2 py-0.5 text-caption font-medium text-ink">{sk}</li>)}</ul></div>
            <div>
              <h3 className="font-sans text-small font-semibold text-ink">Active projects ({stats[selected.id].projects.length})</h3>
              <ul className="mt-2 flex flex-col gap-2">{stats[selected.id].projects.map((p) => <li key={p.id} className="flex items-center justify-between gap-3"><Link to={`/workspace/projects/${p.id}`} className="truncate text-small font-medium text-ink hover:underline">{p.name}</Link><StatusBadge status={p.status} /></li>)}</ul>
              {stats[selected.id].projects.length === 0 && <p className="mt-2 text-small text-muted">No active projects.</p>}
            </div>
            <div>
              <h3 className="font-sans text-small font-semibold text-ink">Open tasks ({stats[selected.id].tasks.length})</h3>
              <ul className="mt-2 flex flex-col gap-2">{stats[selected.id].tasks.map((t) => <li key={t.id} className="flex items-center justify-between gap-3"><Link to={`/workspace/tasks?open=${t.id}`} className="min-w-0 truncate text-small text-ink hover:underline">{t.title} <span className="text-muted">· {relativeDue(t.dueDate)}</span></Link><PriorityBadge priority={t.priority} /></li>)}</ul>
              {stats[selected.id].tasks.length === 0 && <p className="mt-2 text-small text-muted">No open tasks.</p>}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
