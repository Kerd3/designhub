import { useMemo } from 'react';
import { Link } from 'react-router';
import { FolderKanban, Activity, CheckCircle2, Building2, ListChecks, Inbox, Plus, ArrowRight } from 'lucide-react';
import { labelFor, ACTIVE_PROJECT_STATUSES } from '@shared/domain.js';
import { Button, Card, CardHeader, ErrorState, SkeletonLoader, StatusBadge, PriorityBadge, ProgressBar, Avatar } from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { StatCard } from '@/components/dashboard/StatCard.jsx';
import { BarChartCard } from '@/components/dashboard/BarChartCard.jsx';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed.jsx';
import { useResource } from '@/hooks/useResource.js';
import { useSettings } from '@/context/SettingsContext.jsx';
import { dashboardService } from '@/services/dashboardService.js';
import { projectService } from '@/services/projectService.js';
import { taskService } from '@/services/taskService.js';
import { inquiryService } from '@/services/inquiryService.js';
import { clientService } from '@/services/clientService.js';
import { teamService } from '@/services/teamService.js';
import { cn, daysUntil, formatShortDate, relativeDue, timeAgo } from '@/utils/format.js';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function OverviewPage() {
  const { settings } = useSettings();
  // Every number on this page is computed by the data service from the dataset.
  const { data, status, error, reload } = useResource(async ({ signal }) => {
    const [summary, projects, tasks, inquiries, clients, team, activity] = await Promise.all([
      dashboardService.getSummary({ signal }), projectService.list({ signal }), taskService.list({ signal }),
      inquiryService.list({ signal }), clientService.list({ signal }), teamService.list({ signal }), dashboardService.getActivity({ signal }),
    ]);
    return { summary, projects, tasks, inquiries, clients, team, activity };
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const clientById = Object.fromEntries(data.clients.map((c) => [c.id, c]));
    const projectById = Object.fromEntries(data.projects.map((p) => [p.id, p]));
    const memberById = Object.fromEntries(data.team.map((m) => [m.id, m]));
    return {
      clientById, projectById, memberById,
      activeProjects: data.projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5),
      upcomingTasks: data.tasks.filter((t) => t.status !== 'completed').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6),
      recentInquiries: [...data.inquiries].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5),
    };
  }, [data]);

  const firstName = settings.profile.name.split(' ')[0];
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description={`${today}. Here is where the studio stands today.`}
        actions={
          <>
            <Button to="/workspace/inquiries" variant="outline" leftIcon={Inbox}>Inquiries</Button>
            <Button to="/workspace/projects?new=1" leftIcon={Plus}>New project</Button>
          </>
        }
      />

      {status === 'error' && <ErrorState title="The dashboard could not load" error={error} onRetry={reload} />}
      {status === 'loading' && (
        <div className="flex flex-col gap-6">
          <SkeletonLoader variant="stats" count={6} label="Loading dashboard" />
          <SkeletonLoader variant="cards" count={2} label="Loading charts" />
        </div>
      )}

      {status === 'success' && derived && (
        <div className="flex flex-col gap-6">
          <section aria-label="Summary">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-6">
              <StatCard id="total-projects" label="Total projects" value={data.summary.totals.totalProjects} helper="All statuses" icon={FolderKanban} to="/workspace/projects" />
              <StatCard id="active-projects" label="Active projects" value={data.summary.totals.activeProjects} helper="In progress or in review" icon={Activity} to="/workspace/projects?status=active" />
              <StatCard id="completed-projects" label="Completed projects" value={data.summary.totals.completedProjects} helper="Delivered" icon={CheckCircle2} to="/workspace/projects?status=completed" />
              <StatCard id="total-clients" label="Total clients" value={data.summary.totals.totalClients} helper={`${data.clients.filter((c) => c.status === 'active').length} active`} icon={Building2} to="/workspace/clients" />
              <StatCard id="pending-tasks" label="Pending tasks" value={data.summary.totals.pendingTasks} helper={data.summary.overdueTasks ? `${data.summary.overdueTasks} overdue` : 'None overdue'} icon={ListChecks} to="/workspace/tasks" />
              <StatCard id="new-inquiries" label="New inquiries" value={data.summary.totals.newInquiries} helper="Waiting for a reply" icon={Inbox} to="/workspace/inquiries?status=new" />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <BarChartCard
                title="Projects by status"
                description="Every project in the workspace, grouped by its current status."
                valueLabel="projects"
                data={data.summary.projectsByStatus.map((s) => ({ name: labelFor(s.key), value: s.count }))}
              />
            </div>
            <Card className="xl:col-span-5">
              <CardHeader title="Upcoming tasks" description="Open tasks, soonest first." action={<Button to="/workspace/tasks" variant="ghost" size="sm" rightIcon={ArrowRight}>All tasks</Button>} />
              <ul className="flex flex-col">
                {derived.upcomingTasks.map((t) => {
                  const overdue = daysUntil(t.dueDate) < 0;
                  return (
                    <li key={t.id} className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
                      <Avatar name={derived.memberById[t.assigneeId]?.name ?? 'Unassigned'} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link to={`/workspace/tasks?open=${t.id}`} className="block truncate text-small font-medium text-ink hover:underline">{t.title}</Link>
                        <p className={cn('text-caption', overdue ? 'font-semibold text-danger' : 'text-muted')}>{relativeDue(t.dueDate)} · {derived.projectById[t.projectId]?.name}</p>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-7">
              <CardHeader title="Active projects" description="In progress or in review, by due date." action={<Button to="/workspace/projects" variant="ghost" size="sm" rightIcon={ArrowRight}>All projects</Button>} />
              <ul className="flex flex-col">
                {derived.activeProjects.map((p) => (
                  <li key={p.id} className="grid gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[1fr_160px] sm:items-center sm:gap-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/workspace/projects/${p.id}`} className="truncate text-small font-semibold text-ink hover:underline">{p.name}</Link>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="mt-1 text-caption text-muted">{derived.clientById[p.clientId]?.companyName} · Due {formatShortDate(p.dueDate)}</p>
                    </div>
                    <ProgressBar value={p.progress} label={`${p.name} completion`} />
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="xl:col-span-5">
              <CardHeader title="Recent inquiries" description="From the public contact form." action={<Button to="/workspace/inquiries" variant="ghost" size="sm" rightIcon={ArrowRight}>All inquiries</Button>} />
              <ul className="flex flex-col">
                {derived.recentInquiries.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <Link to={`/workspace/inquiries?open=${i.id}`} className="block truncate text-small font-medium text-ink hover:underline">{i.company || i.name}</Link>
                      <p className="truncate text-caption text-muted">{i.projectType} · {i.budget} · {timeAgo(i.submittedAt)}</p>
                    </div>
                    <StatusBadge status={i.status} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <BarChartCard
                title="Open tasks by team member"
                description="Workload across the team. Tasks marked completed are excluded."
                valueLabel="open tasks"
                data={data.summary.teamWorkload.map((w) => ({ name: w.name.split(' ')[0], value: w.openTasks }))}
              />
            </div>
            <Card className="xl:col-span-5">
              <CardHeader title="Recent activity" description="Changes across the workspace." />
              <ActivityFeed items={data.activity} limit={6} />
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
