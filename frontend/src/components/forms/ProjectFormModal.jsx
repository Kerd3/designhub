import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, LIMITS } from '@shared/schemas.js';
import { PROJECT_STATUSES, PRIORITIES, PROJECT_CATEGORIES, labelFor } from '@shared/domain.js';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { todayIso } from '@/utils/format.js';
import { applyServerErrors, FormError } from './formHelpers.jsx';

const blank = () => ({
  name: '', clientId: '', description: '', category: '', startDate: todayIso(), dueDate: '',
  status: 'planning', priority: 'medium', memberIds: [], progress: 0,
});

/** Create or edit a project. `project` null = create. */
export function ProjectFormModal({ open, onClose, project, clients, team, onSubmit }) {
  const isEdit = Boolean(project);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: blank(),
  });

  useEffect(() => {
    if (open) {
      reset(project ? { ...blank(), ...project, description: project.description ?? '' } : blank());
      setServerError(null);
    }
  }, [open, project, reset]);

  const description = watch('description') ?? '';
  const progress = watch('progress');

  const submit = async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      setServerError(applyServerErrors(error, setError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !isSubmitting && onClose()}
      title={isEdit ? `Edit ${project.name}` : 'New project'}
      description={isEdit ? `Project ${project.id}` : 'Add a project to the workspace.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="project-form" loading={isSubmitting} loadingText="Saving…">{isEdit ? 'Save changes' : 'Create project'}</Button>
        </>
      }
    >
      <form id="project-form" noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
        <FormError message={serverError} />
        <Input label="Project name" required maxLength={LIMITS.title} error={errors.name?.message} data-autofocus {...register('name')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Client" required placeholder="Choose a client" options={clients.map((c) => ({ value: c.id, label: c.companyName }))} error={errors.clientId?.message} {...register('clientId')} />
          <Select label="Category" required placeholder="Choose a category" options={PROJECT_CATEGORIES} error={errors.category?.message} {...register('category')} />
        </div>
        <Textarea label="Description" optional rows={3} maxLength={LIMITS.description} valueLength={description.length} error={errors.description?.message} {...register('description')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Start date" type="date" required error={errors.startDate?.message} {...register('startDate')} />
          <Input label="Due date" type="date" required error={errors.dueDate?.message} {...register('dueDate')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Status" required options={PROJECT_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))} error={errors.status?.message} {...register('status')} />
          <Select label="Priority" required options={PRIORITIES.map((p) => ({ value: p, label: labelFor(p) }))} error={errors.priority?.message} {...register('priority')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-progress" className="flex justify-between text-small font-medium text-ink">
            Completion <span className="tabular-nums text-muted">{Number.isFinite(progress) ? progress : 0}%</span>
          </label>
          <input id="project-progress" type="range" min="0" max="100" step="5" className="h-2 w-full cursor-pointer accent-[var(--color-primary)]" {...register('progress', { valueAsNumber: true })} />
          {errors.progress && <p className="text-small text-danger">{errors.progress.message}</p>}
        </div>
        <fieldset>
          <legend className="text-small font-medium text-ink">Assigned team members</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {team.map((m) => (
              <Checkbox key={m.id} value={m.id} label={m.name} description={m.role} {...register('memberIds')} />
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
