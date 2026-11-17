import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Monitor, Moon, Sun, RotateCcw, Save, DatabaseZap } from 'lucide-react';
import { Button, Card, CardHeader, ConfirmDialog, Input, RadioGroup, Select, Tabs, Toggle, useToast } from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { useSettings } from '@/context/SettingsContext.jsx';
import { demoService } from '@/services/dashboardService.js';
import { DATA_SOURCE, dataSourceLabel } from '@/services/apiClient.js';

const profileSchema = z.object({
  name: z.string().trim().min(2, { error: 'Enter your name' }).max(60, { error: 'Keep it under 60 characters' }),
  title: z.string().trim().max(60, { error: 'Keep it under 60 characters' }),
  email: z.string().trim().pipe(z.email({ error: 'Enter a valid email address' })),
});
const workspaceSchema = z.object({
  name: z.string().trim().min(2, { error: 'Enter a workspace name' }).max(40, { error: 'Keep it under 40 characters' }),
  timezone: z.string(),
  weekStart: z.enum(['monday', 'sunday']),
});
const TIMEZONES = ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Manila', 'Asia/Tokyo', 'Australia/Sydney'];

function ProfileSettings() {
  const { settings, update } = useSettings();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm({ resolver: zodResolver(profileSchema), defaultValues: settings.profile });
  return (
    <Card>
      <CardHeader title="Profile" description="How you appear in the workspace. Stored in this browser only." />
      <form noValidate className="flex max-w-xl flex-col gap-5" onSubmit={handleSubmit((values) => { update('profile', values); reset(values); toast.success('Profile saved'); })}>
        <Input label="Display name" required error={errors.name?.message} {...register('name')} />
        <Input label="Job title" optional error={errors.title?.message} {...register('title')} />
        <Input label="Email" type="email" required hint="Demo address. Nothing is sent to it." error={errors.email?.message} {...register('email')} />
        <div className="flex gap-2">
          <Button type="submit" leftIcon={Save} disabled={!isDirty} loading={isSubmitting}>Save profile</Button>
          <Button variant="ghost" onClick={() => reset(settings.profile)} disabled={!isDirty}>Discard changes</Button>
        </div>
      </form>
    </Card>
  );
}

function AppearanceSettings() {
  const { settings, update } = useSettings();
  const toast = useToast();
  return (
    <Card>
      <CardHeader title="Appearance" description="Applied instantly and remembered in this browser." />
      <div className="flex max-w-xl flex-col gap-8">
        <RadioGroup
          legend="Theme"
          name="theme"
          value={settings.appearance.theme}
          onChange={(theme) => { update('appearance', { theme }); toast.success('Theme updated'); }}
          options={[
            { value: 'light', label: 'Light', description: 'Warm off-white surfaces.' },
            { value: 'dark', label: 'Dark', description: 'Low-glare surfaces for long sessions.' },
            { value: 'system', label: 'Match system', description: 'Follows your operating system setting.' },
          ]}
        />
        <div className="flex items-center gap-3 text-small text-muted" aria-hidden="true"><Sun className="size-4" /><Moon className="size-4" /><Monitor className="size-4" /></div>
        <Select label="Default projects view" value={settings.appearance.projectView} onChange={(e) => { update('appearance', { projectView: e.target.value }); toast.success('Default view saved'); }} options={[{ value: 'grid', label: 'Grid' }, { value: 'table', label: 'Table' }]} />
        <Select label="Default tasks view" value={settings.appearance.taskView} onChange={(e) => { update('appearance', { taskView: e.target.value }); toast.success('Default view saved'); }} options={[{ value: 'board', label: 'Board' }, { value: 'table', label: 'Table' }]} />
      </div>
    </Card>
  );
}

function NotificationSettings() {
  const { settings, update } = useSettings();
  const n = settings.notifications;
  const set = (key, value) => update('notifications', { [key]: value });
  return (
    <Card>
      <CardHeader title="Notification preferences" description="Controls what appears under the bell icon in the top bar." />
      <div className="flex max-w-xl flex-col gap-6">
        <Toggle label="New inquiry alerts" description="Show inquiries with the status New." checked={n.inquiries} onChange={(v) => set('inquiries', v)} />
        <Toggle label="Task due reminders" description="Show open tasks that are overdue or due within three days." checked={n.taskDue} onChange={(v) => set('taskDue', v)} />
        <Toggle label="Workspace activity" description="Show the five most recent changes made in the workspace." checked={n.activity} onChange={(v) => set('activity', v)} />
      </div>
    </Card>
  );
}

function WorkspaceSettings() {
  const { settings, update } = useSettings();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(workspaceSchema), defaultValues: settings.workspace });
  return (
    <Card>
      <CardHeader title="Workspace information" description="The workspace name appears in the sidebar and browser tab." />
      <form noValidate className="flex max-w-xl flex-col gap-5" onSubmit={handleSubmit((values) => { update('workspace', values); reset(values); toast.success('Workspace saved'); })}>
        <Input label="Workspace name" required error={errors.name?.message} {...register('name')} />
        <Select label="Time zone" options={TIMEZONES.map((t) => ({ value: t, label: t.replace('_', ' ') }))} {...register('timezone')} />
        <Select label="Week starts on" options={[{ value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' }]} {...register('weekStart')} />
        <dl className="grid gap-3 rounded-md bg-surface-2 p-4 text-small sm:grid-cols-2">
          <div><dt className="text-muted">Data source</dt><dd className="font-medium text-ink">{dataSourceLabel}</dd></div>
          <div><dt className="text-muted">Mode</dt><dd className="font-medium text-ink">{DATA_SOURCE === 'api' ? 'Express + PostgreSQL API' : 'Portfolio demo (no server)'}</dd></div>
        </dl>
        <div><Button type="submit" leftIcon={Save} disabled={!isDirty}>Save workspace</Button></div>
      </form>
    </Card>
  );
}

function DemoDataSettings() {
  const toast = useToast();
  const { reset: resetSettings } = useSettings();
  const [confirmData, setConfirmData] = useState(false);
  const [confirmPrefs, setConfirmPrefs] = useState(false);
  return (
    <Card>
      <CardHeader title="Demo data" description="Everything here is fictional sample data you can freely change." />
      <div className="flex max-w-xl flex-col gap-6">
        <div className="rounded-md bg-surface-2 p-4">
          <h3 className="font-sans text-small font-semibold text-ink">Reset workspace data</h3>
          <p className="mt-1 text-small text-muted">Restores all projects, clients, tasks, inquiries and team records to the original seed data. Inquiries you submitted from the contact form are removed.</p>
          <Button className="mt-4" variant="danger" leftIcon={DatabaseZap} onClick={() => setConfirmData(true)}>Reset demo data</Button>
        </div>
        <div className="rounded-md bg-surface-2 p-4">
          <h3 className="font-sans text-small font-semibold text-ink">Reset preferences</h3>
          <p className="mt-1 text-small text-muted">Restores profile, appearance, notification and workspace settings to their defaults.</p>
          <Button className="mt-4" variant="outline" leftIcon={RotateCcw} onClick={() => setConfirmPrefs(true)}>Reset preferences</Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmData}
        onClose={() => setConfirmData(false)}
        title="Reset all demo data?"
        message="Every change you made to projects, clients, tasks, inquiries and team members will be replaced with the original sample data."
        confirmLabel="Reset data"
        onConfirm={async () => { await demoService.reset(); toast.success('Demo data reset', 'All records are back to the original sample data.'); }}
      />
      <ConfirmDialog
        open={confirmPrefs}
        onClose={() => setConfirmPrefs(false)}
        title="Reset preferences?"
        message="Profile, theme, notification and workspace settings return to their defaults."
        confirmLabel="Reset preferences"
        onConfirm={async () => { resetSettings(); toast.success('Preferences reset'); }}
      />
    </Card>
  );
}

const TABS = [
  { id: 'profile', label: 'Profile', Component: ProfileSettings },
  { id: 'appearance', label: 'Appearance', Component: AppearanceSettings },
  { id: 'notifications', label: 'Notifications', Component: NotificationSettings },
  { id: 'workspace', label: 'Workspace', Component: WorkspaceSettings },
  { id: 'data', label: 'Demo data', Component: DemoDataSettings },
];

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'profile';
  return (
    <>
      <PageHeader title="Settings" description="Preferences for this demo workspace, saved in your browser." />
      <Tabs
        label="Settings sections"
        value={tab}
        onChange={(id) => setParams(id === 'profile' ? {} : { tab: id }, { replace: true })}
        tabs={TABS.map(({ id, label, Component }) => ({ id, label, content: <Component /> }))}
      />
    </>
  );
}
