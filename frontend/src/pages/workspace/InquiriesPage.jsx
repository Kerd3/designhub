import { useMemo } from 'react';
import { Inbox, Archive, Mail, Eye } from 'lucide-react';
import { INQUIRY_STATUSES, INQUIRY_PROJECT_TYPES, labelFor } from '@shared/domain.js';
import { Button, DataTable, EmptyState, ErrorState, Modal, SearchInput, Select, SkeletonLoader, StatusBadge, Tabs, useToast } from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader.jsx';
import { useCollection } from '@/hooks/useResource.js';
import { useQueryParams } from '@/hooks/useQueryParams.js';
import { inquiryService } from '@/services/inquiryService.js';
import { formatDate, formatDateTime, matchesQuery, timeAgo } from '@/utils/format.js';

// Inquiries are created by the public form, so the generic create/remove are not exposed here.
const inquiryCollectionService = { list: inquiryService.list, update: (id, patch) => inquiryService.updateStatus(id, patch.status), create: inquiryService.submit, remove: () => Promise.reject(new Error('Inquiries are archived, not deleted.')) };

function InquiryDetail({ inquiry, onStatus, onArchive, busy }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2"><StatusBadge status={inquiry.status} /><span className="text-small text-muted">Received {formatDateTime(inquiry.submittedAt)}</span></div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-small text-muted">Contact</dt><dd className="mt-0.5 font-medium text-ink">{inquiry.name}</dd></div>
        <div><dt className="text-small text-muted">Company</dt><dd className="mt-0.5 font-medium text-ink">{inquiry.company || '—'}</dd></div>
        <div><dt className="text-small text-muted">Project type</dt><dd className="mt-0.5 font-medium text-ink">{inquiry.projectType}</dd></div>
        <div><dt className="text-small text-muted">Budget</dt><dd className="mt-0.5 font-medium text-ink">{inquiry.budget}</dd></div>
        <div className="sm:col-span-2"><dt className="text-small text-muted">Email</dt><dd className="mt-0.5"><a href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Your ${inquiry.projectType} inquiry`)}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline break-all"><Mail aria-hidden="true" className="size-4 shrink-0" />{inquiry.email}</a></dd></div>
      </dl>
      <div>
        <h3 className="font-sans text-small font-semibold text-ink">Project description</h3>
        <p className="mt-2 whitespace-pre-line rounded-md bg-surface-2 p-4 text-body text-ink">{inquiry.description}</p>
      </div>
      <Select label="Inquiry status" value={inquiry.status} disabled={busy} onChange={(e) => onStatus(inquiry, e.target.value)} options={INQUIRY_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))} hint="Changes are saved immediately." />
      {inquiry.status !== 'archived' && <Button variant="outline" leftIcon={Archive} onClick={() => onArchive(inquiry)} disabled={busy}>Archive inquiry</Button>}
    </div>
  );
}

export default function InquiriesPage() {
  const toast = useToast();
  const inquiries = useCollection(inquiryCollectionService);
  const { params, setParam, clearParams } = useQueryParams();

  const tab = INQUIRY_STATUSES.includes(params.get('status')) ? params.get('status') : 'all';
  const query = params.get('q') ?? '';
  const type = params.get('type') ?? '';
  const openId = params.get('open');

  const sorted = useMemo(() => [...inquiries.items].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)), [inquiries.items]);
  const filtered = useMemo(
    () => sorted.filter((i) => (!type || i.projectType === type) && matchesQuery(query, i.name, i.company, i.email, i.description, i.id)),
    [sorted, type, query],
  );
  const visible = tab === 'all' ? filtered : filtered.filter((i) => i.status === tab);
  const counts = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, filtered.filter((i) => i.status === s).length]));
  const selected = inquiries.items.find((i) => i.id === openId) ?? null;

  const setStatus = async (inquiry, status) => {
    try {
      await inquiries.update(inquiry.id, { status });
      toast.success(`Marked as ${labelFor(status)}`, inquiry.company || inquiry.name);
    } catch (error) {
      toast.error('Status not updated', error.message);
    }
  };

  const columns = [
    { key: 'name', header: 'From', sortable: true, render: (i) => <button type="button" onClick={() => setParam('open', i.id)} className="min-w-44 text-left"><span className="block font-semibold text-ink hover:underline">{i.company || i.name}</span><span className="block text-caption text-muted">{i.name} · {i.id}</span></button> },
    { key: 'projectType', header: 'Project type', sortable: true, hideBelow: 'md' },
    { key: 'budget', header: 'Budget', hideBelow: 'lg' },
    { key: 'submittedAt', header: 'Received', sortable: true, render: (i) => <time dateTime={i.submittedAt} title={formatDateTime(i.submittedAt)} className="whitespace-nowrap">{timeAgo(i.submittedAt)}</time> },
    { key: 'status', header: 'Status', sortable: true, render: (i) => <StatusBadge status={i.status} /> },
    { key: 'actions', header: <span className="visually-hidden">Actions</span>, align: 'right', render: (i) => <Button size="sm" variant="ghost" leftIcon={Eye} onClick={() => setParam('open', i.id)} aria-label={`View inquiry from ${i.company || i.name}`}>View</Button> },
  ];

  return (
    <>
      <PageHeader title="Inquiries" description="Project inquiries submitted through the public contact form." />

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <SearchInput value={query} onChange={(v) => setParam('q', v)} label="Search inquiries" placeholder="Search by name, company or description" className="md:flex-1" />
        <Select label="Project type" size="sm" placeholder="All project types" value={type} onChange={(e) => setParam('type', e.target.value)} options={INQUIRY_PROJECT_TYPES} className="md:w-56" />
      </div>

      <Tabs
        className="mt-4"
        label="Filter inquiries by status"
        value={tab}
        onChange={(id) => setParam('status', id)}
        tabs={[{ id: 'all', label: 'All', count: filtered.length }, ...INQUIRY_STATUSES.map((s) => ({ id: s, label: labelFor(s), count: counts[s] }))]}
      />

      <div className="mt-5">
        {inquiries.isError && <ErrorState title="Inquiries could not load" error={inquiries.error} onRetry={inquiries.reload} />}
        {inquiries.isLoading && <SkeletonLoader variant="table" count={6} label="Loading inquiries" />}
        {inquiries.status === 'success' && (
          <DataTable
            key={tab}
            caption={`Inquiries${tab === 'all' ? '' : `: ${labelFor(tab)}`}`}
            columns={columns}
            rows={visible}
            itemLabel="inquiries"
            pageSize={8}
            emptyState={<EmptyState icon={Inbox} title={tab === 'all' ? 'No inquiries found' : `No ${labelFor(tab).toLowerCase()} inquiries`} description={query || type ? 'Try a different search or project type.' : 'Inquiries from the contact form will appear here.'} />}
          />
        )}
      </div>

      <Modal open={Boolean(selected)} onClose={() => setParam('open', '')} variant="panel" title={selected ? `Inquiry from ${selected.company || selected.name}` : ''} description={selected ? `${selected.id} · ${formatDate(selected.submittedAt)}` : ''}>
        {selected && <InquiryDetail inquiry={selected} onStatus={setStatus} onArchive={(i) => setStatus(i, 'archived')} />}
      </Modal>
    </>
  );
}
