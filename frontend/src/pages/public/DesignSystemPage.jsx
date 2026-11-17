import { useState } from 'react';
import { Bell, Mail, Plus, Search, Settings, Trash2, Inbox } from 'lucide-react';
import {
  Avatar, AvatarGroup, Badge, Breadcrumb, Button, Card, CardHeader, Checkbox, ConfirmDialog, DataTable, Dropdown,
  EmptyState, ErrorState, IconButton, Input, LoadingState, Modal, Pagination, PriorityBadge, ProgressBar, RadioGroup,
  SearchInput, SegmentedControl, Select, SkeletonLoader, StatusBadge, Tabs, Textarea, Toggle, Tooltip, useToast,
} from '@/components/ui';
import { usePageMeta } from '@/hooks/usePageMeta.js';
import { cn } from '@/utils/format.js';

const COLORS = [
  ['Primary', 'primary', '#36539a', 'Actions, links, focus rings'],
  ['Secondary', 'secondary', '#16171a', 'Strong buttons, inverted fields'],
  ['Accent', 'accent', '#c8b48e', 'Flat field colour on marketing pages'],
  ['Background', 'bg', '#f6f4ef', 'Page ground'],
  ['Surface', 'surface', '#ffffff', 'Cards, panels, inputs'],
  ['Border', 'border', '#dedad1', 'Dividers inside data UI'],
  ['Text', 'ink', '#16171a', 'Primary text'],
  ['Muted text', 'muted', '#5b5e66', 'Secondary text (5.9:1)'],
  ['Success', 'success', '#2a6e47', 'Completed, saved'],
  ['Warning', 'warning', '#8f5b0c', 'Needs attention'],
  ['Error', 'danger', '#b3261e', 'Errors, destructive actions'],
  ['Information', 'info', '#286688', 'Neutral notices'],
];
const SWATCH = { primary: 'bg-primary', secondary: 'bg-secondary', accent: 'bg-accent', bg: 'bg-bg', surface: 'bg-surface', border: 'bg-border', ink: 'bg-ink', muted: 'bg-muted', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info' };

const TYPE = [
  ['Display', 'font-display text-display font-extrabold', 'Manrope 800 · 38–96px · −0.04em'],
  ['Heading 1', 'font-display text-h1 font-bold', 'Manrope 700 · 32–56px · −0.03em'],
  ['Heading 2', 'font-display text-h2 font-bold', 'Manrope 700 · 26–40px · −0.022em'],
  ['Heading 3', 'font-display text-h3 font-bold', 'Manrope 700 · 19–24px'],
  ['Body', 'text-body', 'Inter 400 · 16/26px'],
  ['Small', 'text-small', 'Inter 400 · 14/21px'],
  ['Caption', 'text-caption', 'Inter 500 · 13/18px'],
];
const SPACING = [[1, '4px'], [2, '8px'], [3, '12px'], [4, '16px'], [6, '24px'], [8, '32px'], [12, '48px'], [16, '64px']];
const SPACE_W = { 1: 'w-1', 2: 'w-2', 3: 'w-3', 4: 'w-4', 6: 'w-6', 8: 'w-8', 12: 'w-12', 16: 'w-16' };

function Block({ id, title, description, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-14">
      <h2 id={`${id}-title`} className="font-display text-h2 font-bold text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-[60ch] text-body text-muted">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Specimen({ label, children, className }) {
  return (
    <div className={cn('rounded-lg bg-surface p-5 ring-1 ring-border', className)}>
      <p className="mb-4 text-caption font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}

const SECTIONS = [['tokens', 'Colour'], ['type', 'Typography'], ['space', 'Spacing, radius, shadow'], ['buttons', 'Buttons'], ['forms', 'Form controls'], ['feedback', 'Badges and feedback'], ['navigation', 'Navigation'], ['data', 'Data display'], ['overlays', 'Overlays'], ['states', 'Page states']];

export default function DesignSystemPage() {
  usePageMeta({ title: 'Design system', description: 'The DesignHub design tokens and reusable React components, with every variant and state.' });
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [view, setView] = useState('grid');
  const [toggle, setToggle] = useState(true);
  const [radio, setRadio] = useState('email');
  const [page, setPage] = useState(2);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="page-container pb-24 pt-14 lg:pt-24">
      <h1 className="font-display text-display font-extrabold text-ink">Design system</h1>
      <p className="mt-6 max-w-[56ch] text-lead text-ink">
        The tokens and components behind every DesignHub screen. Each one lives once in code (<code className="rounded-sm bg-surface-2 px-2 py-1 text-[0.9em]">src/styles/index.css</code> and <code className="rounded-sm bg-surface-2 px-2 py-1 text-[0.9em]">src/components/ui</code>) and is documented in <code className="rounded-sm bg-surface-2 px-2 py-1 text-[0.9em]">docs/design-system.md</code>.
      </p>
      <nav aria-label="Design system sections" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} className="inline-flex h-9 items-center rounded-full bg-surface-2 px-4 text-small font-medium text-ink hover:bg-surface-3">{label}</a></li>
          ))}
        </ul>
      </nav>

      <Block id="tokens" title="Colour" description="One ground, one ink, one accent, plus four feedback colours. Each has a soft variant for backgrounds. Status is never shown by colour alone.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLORS.map(([name, token, hex, use]) => (
            <li key={token} className="overflow-hidden rounded-lg bg-surface ring-1 ring-border">
              <div className={cn('h-20', SWATCH[token])} />
              <div className="p-4">
                <p className="text-small font-semibold text-ink">{name}</p>
                <p className="text-caption text-muted">--color-{token} · {hex}</p>
                <p className="mt-1 text-caption text-muted">{use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block id="type" title="Typography" description="Manrope for headings, Inter for everything else. Sizes are fluid between 375px and 1440px.">
        <div className="flex flex-col gap-6 rounded-lg bg-surface p-6 ring-1 ring-border">
          {TYPE.map(([name, cls, spec]) => (
            <div key={name} className="grid gap-2 md:grid-cols-[180px_1fr] md:items-baseline">
              <div><p className="text-small font-semibold text-ink">{name}</p><p className="text-caption text-muted">{spec}</p></div>
              <p className={cn(cls, 'truncate text-ink')}>Thoughtful design</p>
            </div>
          ))}
        </div>
      </Block>

      <Block id="space" title="Spacing, radius and shadow" description="A 4px base grid. Four radii. Shadows only on things that float: menus, dialogs, toasts and lifted cards.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Specimen label="Spacing scale">
            <ul className="flex flex-col gap-3">
              {SPACING.map(([step, px]) => (
                <li key={step} className="flex items-center gap-3 text-caption text-muted">
                  <span className="w-12 tabular-nums">{px}</span>
                  <span className={cn('h-3 rounded-sm bg-primary', SPACE_W[step])} />
                  <span>spacing-{step}</span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="Radius">
            <div className="grid grid-cols-2 gap-3">
              {[['Small · 4px', 'rounded-sm'], ['Medium · 8px', 'rounded-md'], ['Large · 12px', 'rounded-lg'], ['Extra large · 20px', 'rounded-xl']].map(([l, c]) => (
                <div key={l}><div className={cn('h-16 bg-primary-soft ring-1 ring-primary/30', c)} /><p className="mt-2 text-caption text-muted">{l}</p></div>
              ))}
            </div>
          </Specimen>
          <Specimen label="Shadow">
            <div className="grid grid-cols-3 gap-4 py-2">
              {[['Small', 'shadow-sm'], ['Medium', 'shadow-md'], ['Large', 'shadow-lg']].map(([l, c]) => (
                <div key={l}><div className={cn('h-16 rounded-md bg-surface', c)} /><p className="mt-2 text-caption text-muted">{l}</p></div>
              ))}
            </div>
          </Specimen>
        </div>
      </Block>

      <Block id="buttons" title="Buttons" description="Five variants, three sizes. Loading disables the button and keeps its width; disabled is never the only signal that something is wrong.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen label="Variants">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" leftIcon={Trash2}>Danger</Button>
            </div>
          </Specimen>
          <Specimen label="Sizes and states">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md" leftIcon={Plus}>Medium</Button>
              <Button size="lg">Large</Button>
              <Button loading loadingText="Saving…">Save</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Specimen>
          <Specimen label="Icon buttons (tooltip on hover and focus)">
            <div className="flex flex-wrap gap-2">
              <IconButton icon={Bell} label="Notifications" badge={3} />
              <IconButton icon={Settings} label="Settings" variant="outline" />
              <IconButton icon={Plus} label="Add item" variant="solid" />
              <IconButton icon={Trash2} label="Delete" variant="danger" />
            </div>
          </Specimen>
          <Specimen label="Segmented control">
            <SegmentedControl label="View" value={view} onChange={setView} options={[{ value: 'grid', label: 'Grid' }, { value: 'table', label: 'Table' }, { value: 'board', label: 'Board' }]} />
          </Specimen>
        </div>
      </Block>

      <Block id="forms" title="Form controls" description="Labels are always visible. Errors are announced, linked to their field with aria-describedby and paired with an icon.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen label="Input states">
            <div className="flex flex-col gap-5">
              <Input label="Default" placeholder="Company name" />
              <Input label="With helper text" hint="We only use this to reply to you." placeholder="name@company.com" />
              <Input label="Invalid" defaultValue="name@" error="Enter a valid email address, like name@company.com" />
              <Input label="Disabled" defaultValue="Read only value" disabled />
            </div>
          </Specimen>
          <div className="flex flex-col gap-4">
            <Specimen label="Select, textarea and search">
              <div className="flex flex-col gap-5">
                <Select label="Project type" placeholder="Choose one" options={['Website Design', 'UI/UX Design', 'Web Application']} />
                <Textarea label="Description" maxLength={200} valueLength={64} defaultValue="A booking flow for four clinics, with reminders and rescheduling." rows={3} />
                <SearchInput value={query} onChange={setQuery} placeholder="Search projects" />
              </div>
            </Specimen>
            <Specimen label="Checkbox, radio and toggle">
              <div className="flex flex-col gap-5">
                <Checkbox label="Send me the weekly digest" description="Every Monday at 9:00." defaultChecked />
                <RadioGroup legend="Contact method" name="ds-contact" value={radio} onChange={setRadio} orientation="horizontal" options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }]} />
                <Toggle label="Task due reminders" description="Notify me a day before a task is due." checked={toggle} onChange={setToggle} />
              </div>
            </Specimen>
          </div>
        </div>
      </Block>

      <Block id="feedback" title="Badges and feedback" description="Status badges carry an icon and a word, so they read without colour.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen label="Badge tones">
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger</Badge>
              <Badge tone="info">Information</Badge><Badge tone="neutral">Neutral</Badge><Badge tone="primary">Primary</Badge>
            </div>
          </Specimen>
          <Specimen label="Status and priority">
            <div className="flex flex-wrap gap-2">
              {['planning', 'in-progress', 'review', 'completed', 'on-hold'].map((s) => <StatusBadge key={s} status={s} />)}
              {['low', 'medium', 'high', 'urgent'].map((p) => <PriorityBadge key={p} priority={p} />)}
            </div>
          </Specimen>
          <Specimen label="Toast notifications">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.success('Project saved', 'Northwind Reporting Dashboard was updated.')}>Show success</Button>
              <Button variant="outline" onClick={() => toast.error('Could not save', 'The server did not respond. Try again.')}>Show error</Button>
              <Button variant="outline" onClick={() => toast.info('Demo data reset', 'All records are back to the seed data.')}>Show info</Button>
            </div>
          </Specimen>
          <Specimen label="Avatars and progress">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4"><Avatar name="Maya Okafor" size="lg" /><Avatar name="Daniel Reyes" /><Avatar name="Priya Raman" size="sm" /><AvatarGroup names={['Maya Okafor', 'Daniel Reyes', 'Priya Raman', 'Hana Kimura', 'Lucas Bergström']} /></div>
              <ProgressBar value={62} /><ProgressBar value={100} />
            </div>
          </Specimen>
        </div>
      </Block>

      <Block id="navigation" title="Navigation" description="Tabs, breadcrumbs, pagination and menus all support the keyboard: arrows, Home, End and Escape.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen label="Tabs">
            <Tabs label="Example tabs" value={tab} onChange={setTab} tabs={[
              { id: 'overview', label: 'Overview', content: <p className="text-body text-ink">Tabs switch content without leaving the page.</p> },
              { id: 'tasks', label: 'Tasks', count: 4, content: <p className="text-body text-ink">Four open tasks.</p> },
              { id: 'files', label: 'Files', content: <p className="text-body text-ink">No files yet.</p> },
            ]} />
          </Specimen>
          <Specimen label="Breadcrumb, dropdown and pagination">
            <div className="flex flex-col gap-6">
              <Breadcrumb items={[{ label: 'Workspace', to: '/design-system' }, { label: 'Projects', to: '/design-system' }, { label: 'Finora' }]} />
              <Dropdown
                align="start"
                menuLabel="Example actions"
                renderTrigger={(props) => <Button variant="outline" {...props}>Open menu</Button>}
                items={[
                  { label: 'Send email', icon: Mail, onSelect: () => toast.info('Menu item selected', 'Send email') },
                  { label: 'Search', icon: Search, onSelect: () => toast.info('Menu item selected', 'Search') },
                  { divider: true },
                  { label: 'Delete', icon: Trash2, tone: 'danger', onSelect: () => setConfirm(true) },
                ]}
              />
              <Pagination page={page} pageSize={10} total={74} onPageChange={setPage} itemLabel="projects" />
            </div>
          </Specimen>
        </div>
      </Block>

      <Block id="data" title="Data display" description="Cards group related content; tables sort by column and scroll inside their own region on narrow screens.">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader title="Northwind Reporting Dashboard" description="Northwind Analytics" action={<StatusBadge status="in-progress" />} titleAs="h3" />
            <ProgressBar value={62} />
            <div className="mt-4 flex items-center justify-between"><AvatarGroup names={['Daniel Reyes', 'Priya Raman', 'Hana Kimura']} /><PriorityBadge priority="high" /></div>
          </Card>
          <DataTable
            caption="Example table"
            pageSize={3}
            itemLabel="rows"
            initialSort={{ key: 'name', direction: 'asc' }}
            columns={[
              { key: 'name', header: 'Name', sortable: true },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'progress', header: 'Progress', sortable: true, align: 'right', render: (r) => `${r.progress}%` },
            ]}
            rows={[
              { id: 1, name: 'Finora', status: 'in-progress', progress: 62 },
              { id: 2, name: 'Wellnest', status: 'review', progress: 88 },
              { id: 3, name: 'Marketly', status: 'completed', progress: 100 },
              { id: 4, name: 'Routewise', status: 'planning', progress: 10 },
            ]}
          />
        </div>
      </Block>

      <Block id="overlays" title="Overlays" description="Dialogs trap focus, close with Escape and return focus to the button that opened them. On phones they become bottom sheets.">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setModal(true)}>Open modal</Button>
          <Button variant="danger" leftIcon={Trash2} onClick={() => setConfirm(true)}>Open confirm dialog</Button>
          <Tooltip content="Tooltips describe, they never hold essential content"><Button variant="ghost">Hover or focus me</Button></Tooltip>
        </div>
        <Modal open={modal} onClose={() => setModal(false)} title="Example modal" description="A dialog with a form field and actions." footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => { setModal(false); toast.success('Saved'); }}>Save</Button></>}>
          <Input label="Project name" defaultValue="Finora" />
        </Modal>
        <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => new Promise((r) => setTimeout(r, 600)).then(() => toast.success('Deleted (demo only)'))} title="Delete this project?" message="This removes the example project. Nothing real is deleted on this page." />
      </Block>

      <Block id="states" title="Page states" description="Every data view has loading, empty and error states, and a success message after each change.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Specimen label="Loading"><LoadingState label="Loading projects…" /><SkeletonLoader variant="cards" count={1} /></Specimen>
          <Specimen label="Empty"><EmptyState icon={Inbox} title="No inquiries yet" description="New inquiries from the contact form will appear here." /></Specimen>
          <Specimen label="Error"><ErrorState title="Could not load projects" error={{ message: 'The server did not respond.' }} onRetry={() => toast.info('Retrying…')} /></Specimen>
        </div>
      </Block>
    </div>
  );
}
