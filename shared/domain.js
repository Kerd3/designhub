/**
 * Domain constants and pure functions shared by the frontend mock API
 * and the Express backend, so both compute identical dashboard numbers.
 * No framework imports: this file must run in the browser and in Node.
 */

export const PROJECT_STATUSES = ['planning', 'in-progress', 'review', 'completed', 'on-hold'];
export const TASK_STATUSES = ['todo', 'in-progress', 'in-review', 'completed'];
export const INQUIRY_STATUSES = ['new', 'reviewing', 'contacted', 'converted', 'archived'];
export const CLIENT_STATUSES = ['active', 'onboarding', 'inactive'];
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const AVAILABILITY = ['available', 'limited', 'unavailable'];
export const PROJECT_CATEGORIES = ['Website Design', 'UI/UX Design', 'Web Applications', 'Dashboard Design', 'E-commerce'];
export const DEPARTMENTS = ['Design', 'Engineering', 'Delivery'];
export const INQUIRY_PROJECT_TYPES = ['Website Design', 'Frontend Development', 'UI/UX Design', 'Web Application', 'Design System', 'API Integration', 'Other'];
export const BUDGET_RANGES = ['Under $5k', '$5k–$10k', '$10k–$25k', '$25k–$50k', '$50k+', 'Not sure yet'];

export const STATUS_LABELS = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  review: 'Review',
  completed: 'Completed',
  'on-hold': 'On Hold',
  todo: 'To Do',
  'in-review': 'In Review',
  new: 'New',
  reviewing: 'Reviewing',
  contacted: 'Contacted',
  converted: 'Converted',
  archived: 'Archived',
  active: 'Active',
  onboarding: 'Onboarding',
  inactive: 'Inactive',
  available: 'Available',
  limited: 'Limited',
  unavailable: 'Unavailable',
};
export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
export const labelFor = (value) => STATUS_LABELS[value] ?? PRIORITY_LABELS[value] ?? value;

/** Human-readable activity line for a change, used by mock API and backend alike. */
export function describeChange(collection, action, record, before) {
  const name = record.name ?? record.title ?? record.companyName ?? record.id;
  if (collection === 'inquiries' && action === 'create') return `New inquiry from ${record.company || record.name}`;
  if (action === 'create') return `${singular(collection)} "${name}" created`;
  if (action === 'delete') return `${singular(collection)} "${name}" deleted`;
  if (before && record.status && before.status !== record.status) {
    const who = collection === 'inquiries' ? `Inquiry from ${record.company || record.name}` : `"${name}"`;
    return `${who} moved to ${labelFor(record.status)}`;
  }
  if (before && 'progress' in record && before.progress !== record.progress) return `"${name}" is now ${record.progress}% complete`;
  return `${singular(collection)} "${name}" updated`;
}
const singular = (c) => ({ projects: 'Project', clients: 'Client', tasks: 'Task', inquiries: 'Inquiry', team: 'Team member' })[c] ?? 'Record';
const ACTIVITY_TYPE = { projects: 'project', clients: 'client', tasks: 'task', inquiries: 'inquiry', team: 'team' };
export const activityTypeFor = (collection) => ACTIVITY_TYPE[collection] ?? 'other';

/** "Active" means work is underway: in progress or in client review. */
export const ACTIVE_PROJECT_STATUSES = ['in-progress', 'review'];

const ID_PREFIX = { projects: 'pr', clients: 'cl', tasks: 'tk', inquiries: 'iq', team: 'tm', activities: 'ac' };

/** Next sequential id for a collection, e.g. pr-111 after pr-110. */
export function nextId(collection, items) {
  const prefix = ID_PREFIX[collection] ?? 'id';
  let max = 0;
  let width = 2;
  for (const item of items) {
    const digits = String(item.id).split('-')[1] ?? '';
    const n = Number(digits);
    if (Number.isFinite(n) && n > max) max = n;
    width = Math.max(width, digits.length);
  }
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}

/** Dashboard summary derived purely from the dataset. */
export function computeDashboardSummary({ projects, clients, tasks, inquiries, team }, today = new Date()) {
  const countBy = (items, key, values) =>
    values.map((value) => ({ key: value, count: items.filter((item) => item[key] === value).length }));

  const todayIso = toIsoDate(today);
  const openTasks = tasks.filter((t) => t.status !== 'completed');

  return {
    totals: {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status)).length,
      completedProjects: projects.filter((p) => p.status === 'completed').length,
      totalClients: clients.length,
      pendingTasks: openTasks.length,
      newInquiries: inquiries.filter((i) => i.status === 'new').length,
    },
    projectsByStatus: countBy(projects, 'status', PROJECT_STATUSES),
    tasksByStatus: countBy(tasks, 'status', TASK_STATUSES),
    overdueTasks: openTasks.filter((t) => t.dueDate < todayIso).length,
    teamWorkload: team.map((member) => ({
      memberId: member.id,
      name: member.name,
      openTasks: openTasks.filter((t) => t.assigneeId === member.id).length,
      activeProjects: projects.filter(
        (p) => p.memberIds.includes(member.id) && ACTIVE_PROJECT_STATUSES.includes(p.status),
      ).length,
    })),
  };
}

export function toIsoDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
