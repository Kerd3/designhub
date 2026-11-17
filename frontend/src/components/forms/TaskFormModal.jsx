import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, LIMITS } from '@shared/schemas.js';
import { TASK_STATUSES, PRIORITIES, labelFor } from '@shared/domain.js';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { todayIso } from '@/utils/format.js';
import { applyServerErrors, FormError } from './formHelpers.jsx';

const blank = (preset = {}) => ({ title: '', description: '', projectId: '', assigneeId: '', dueDate: todayIso(), priority: 'medium', status: 'todo', ...preset });

export function TaskFormModal({ open, onClose, task, preset, projects, team, onSubmit, onDelete }) {
  const isEdit = Boolean(task);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: blank(),
  });

  useEffect(() => {
    if (open) {
      reset(task ? { ...blank(), ...task, description: task.description ?? '' } : blank(preset));
      setServerError(null);
    }
  }, [open, task, preset, reset]);

  const description = watch('description') ?? '';

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
      title={isEdit ? 'Edit task' : 'New task'}
      description={isEdit ? `Task ${task.id}` : 'Add a task and assign it to someone.'}
      size="lg"
      footer={
        <>
          {isEdit && onDelete && <Button variant="ghost" className="text-danger sm:mr-auto" onClick={() => onDelete(task)} disabled={isSubmitting}>Delete task</Button>}
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="task-form" loading={isSubmitting} loadingText="Saving…">{isEdit ? 'Save changes' : 'Create task'}</Button>
        </>
      }
    >
      <form id="task-form" noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
        <FormError message={serverError} />
        <Input label="Task title" required maxLength={LIMITS.title} error={errors.title?.message} data-autofocus {...register('title')} />
        <Textarea label="Description" optional rows={3} maxLength={600} valueLength={description.length} error={errors.description?.message} {...register('description')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Project" required placeholder="Choose a project" options={projects.map((p) => ({ value: p.id, label: p.name }))} error={errors.projectId?.message} {...register('projectId')} />
          <Select label="Assigned to" required placeholder="Choose a team member" options={team.map((m) => ({ value: m.id, label: `${m.name}${m.availability === 'unavailable' ? ' (unavailable)' : ''}` }))} error={errors.assigneeId?.message} {...register('assigneeId')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Input label="Due date" type="date" required error={errors.dueDate?.message} {...register('dueDate')} />
          <Select label="Priority" required options={PRIORITIES.map((p) => ({ value: p, label: labelFor(p) }))} {...register('priority')} />
          <Select label="Status" required options={TASK_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))} {...register('status')} />
        </div>
      </form>
    </Modal>
  );
}
