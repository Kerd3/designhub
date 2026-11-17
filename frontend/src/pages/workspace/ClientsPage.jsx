import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Building2, Mail, Phone, Globe, Pencil, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import { CLIENT_STATUSES, labelFor } from '@shared/domain.js';
import {
  Button, ConfirmDialog, DataTable, Dropdown, EmptyState, ErrorState, FilterPanel, Modal, SearchInput, Select,
  SkeletonLoader, StatusBadge, ProgressBar, Avatar, useToast,
} from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { ClientFormModal } from '@/components/forms/ClientFormModal.jsx';
import { useCollection, useResource } from '@/hooks/useResource.js';
import { useQueryParams } from '@/hooks/useQueryParams.js';
import { clientService } from '@/services/clientService.js';
import { projectService } from '@/services/projectService.js';
import { formatDate, formatShortDate, matchesQuery } from '@/utils/format.js';

function ClientDetail({ client, projects, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={client.companyName} size="lg" decorative />
        <div className="min-w-0">
          <p className="text-small text-muted">{client.industry} · {client.id}</p>
          <div className="mt-1"><StatusBadge status={client.status} /></div>
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-small text-muted">Contact person</dt><dd className="mt-0.5 font-medium text-ink">{client.contactPerson}</dd></div>
        <div><dt className="text-small text-muted">Client since</dt><dd className="mt-0.5 font-medium text-ink">{formatDate(client.clientSince)}</dd></div>
        <div className="sm:col-span-2"><dt className="text-small text-muted">Email</dt><dd className="mt-0.5"><a href={`mailto:${client.email}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"><Mail aria-hidden="true" className="size-4" />{client.email}</a></dd></div>
        {client.phone && <div><dt className="text-small text-muted">Phone</dt><dd className="mt-0.5"><a href={`tel:${client.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"><Phone aria-hidden="true" className="size-4" />{client.phone}</a></dd></div>}
        {client.website && <div><dt className="text-small text-muted">Website</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink break-all"><Globe aria-hidden="true" className="size-4 shrink-0 text-muted" />{client.website.replace(/^https?:\/\//, '')}</dd></div>}
      </dl>
      {client.notes && <div><h3 className="font-sans text-small font-semibold text-ink">Notes</h3><p className="mt-1 text-body text-ink">{client.notes}</p></div>}
      <div>
        <h3 className="font-sans text-small font-semibold text-ink">Projects ({projects.length})</h3>
        {projects.length === 0 ? <p className="mt-2 text-small text-muted">No projects yet.</p> : (
          <ul className="mt-2 flex flex-col">
            {projects.map((p) => (
              <li key={p.id} className="border-t border-border py-3 first:border-t-0">
                <div className="flex items-center justify-between gap-3">
                  <Link to={`/workspace/projects/${p.id}`} className="min-w-0 truncate text-small font-semibold text-ink hover:underline">{p.name}</Link>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-2 flex items-center gap-4"><ProgressBar value={p.progress} size="sm" label={`${p.name} completion`} className="flex-1" /><span className="text-caption text-muted">Due {formatShortDate(p.dueDate)}</span></div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" leftIcon={Pencil} onClick={onEdit}>Edit client</Button>
        <Button variant="ghost" className="text-danger" leftIcon={Trash2} onClick={onDelete}>Delete client</Button>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const toast = useToast();
  const clients = useCollection(clientService);
  const projects = useResource((opts) => projectService.list(opts), []);
  const { params, setParam, clearParams } = useQueryParams();
  const [form, setForm] = useState({ open: false, client: null });
  const [toDelete, setToDelete] = useState(null);

  const query = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const openId = params.get('open');

  const projectsByClient = useMemo(() => {
    const map = {};
    for (const p of projects.data ?? []) (map[p.clientId] ??= []).push(p);
    return map;
  }, [projects.data]);

  const visible = useMemo(
    () => clients.items.filter((c) => (!status || c.status === status) && matchesQuery(query, c.companyName, c.contactPerson, c.industry, c.email)).sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [clients.items, status, query],
  );

  const selected = clients.items.find((c) => c.id === openId) ?? null;
  const loading = clients.isLoading || projects.isLoading;

  const columns = [
    {
      key: 'companyName', header: 'Company', sortable: true,
      render: (c) => (
        <button type="button" onClick={() => setParam('open', c.id)} className="flex min-w-48 items-center gap-3 text-left">
          <Avatar name={c.companyName} size="sm" decorative />
          <span><span className="block font-semibold text-ink hover:underline">{c.companyName}</span><span className="block text-caption text-muted">{c.id}</span></span>
        </button>
      ),
    },
    { key: 'contactPerson', header: 'Contact', sortable: true, hideBelow: 'md', render: (c) => <span><span className="block text-ink">{c.contactPerson}</span><span className="block text-caption text-muted">{c.email}</span></span> },
    { key: 'industry', header: 'Industry', sortable: true, hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortable: true, render: (c) => <StatusBadge status={c.status} /> },
    { key: 'projects', header: 'Projects', sortable: true, align: 'right', hideBelow: 'sm', sortValue: (c) => projectsByClient[c.id]?.length ?? 0, render: (c) => <span className="tabular-nums">{projectsByClient[c.id]?.length ?? 0}</span> },
    {
      key: 'actions', header: <span className="visually-hidden">Actions</span>, align: 'right',
      render: (c) => (
        <Dropdown
          menuLabel={`Actions for ${c.companyName}`}
          items={[
            { label: 'View details', icon: Eye, onSelect: () => setParam('open', c.id) },
            { label: 'Edit client', icon: Pencil, onSelect: () => setForm({ open: true, client: c }) },
            { divider: true },
            { label: 'Delete client', icon: Trash2, tone: 'danger', onSelect: () => setToDelete(c) },
          ]}
          renderTrigger={(props) => <button type="button" {...props} aria-label={`Actions for ${c.companyName}`} className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"><MoreHorizontal aria-hidden="true" className="size-5" /></button>}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Clients" description="Fictional businesses the studio works with." actions={<Button leftIcon={Plus} onClick={() => setForm({ open: true, client: null })}>Add client</Button>} />

      <FilterPanel
        search={<SearchInput value={query} onChange={(v) => setParam('q', v)} label="Search clients" placeholder="Search by company, contact or industry" />}
        activeCount={[query, status].filter(Boolean).length}
        onClear={() => clearParams()}
      >
        <Select label="Status" size="sm" placeholder="All statuses" value={status} onChange={(e) => setParam('status', e.target.value)} options={CLIENT_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))} className="md:w-48" />
      </FilterPanel>
      <p className="mb-4 mt-4 text-small text-muted" aria-live="polite">{loading ? 'Loading clients…' : `${visible.length} of ${clients.items.length} clients`}</p>

      {clients.isError && <ErrorState title="Clients could not load" error={clients.error} onRetry={clients.reload} />}
      {loading && !clients.isError && <SkeletonLoader variant="table" count={6} label="Loading clients" />}
      {!loading && !clients.isError && (
        <DataTable
          caption="Clients"
          columns={columns}
          rows={visible}
          itemLabel="clients"
          pageSize={8}
          emptyState={
            <EmptyState icon={Building2} title={clients.items.length ? 'No clients match these filters' : 'No clients yet'} description="Try a different search, or add a client." action={<Button variant="outline" onClick={() => clearParams()}>Clear filters</Button>} />
          }
        />
      )}

      <Modal open={Boolean(selected)} onClose={() => setParam('open', '')} variant="panel" title={selected?.companyName ?? ''} description="Client details">
        {selected && (
          <ClientDetail
            client={selected}
            projects={projectsByClient[selected.id] ?? []}
            onEdit={() => setForm({ open: true, client: selected })}
            onDelete={() => setToDelete(selected)}
          />
        )}
      </Modal>

      <ClientFormModal
        open={form.open}
        client={form.client}
        onClose={() => setForm({ open: false, client: null })}
        onSubmit={async (values) => {
          if (form.client) {
            const updated = await clients.update(form.client.id, values);
            toast.success('Client updated', updated.companyName);
          } else {
            const created = await clients.create(values);
            toast.success('Client added', `${created.companyName} (${created.id})`);
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.companyName ?? 'client'}?`}
        message={`This also removes their ${projectsByClient[toDelete?.id]?.length ?? 0} project(s) and related tasks from the demo data. Restore everything from Settings → Demo data.`}
        confirmLabel="Delete client"
        onConfirm={async () => {
          const name = toDelete.companyName;
          await clients.remove(toDelete.id);
          setParam('open', '');
          projects.reload();
          toast.success('Client deleted', name);
        }}
      />
    </>
  );
}
