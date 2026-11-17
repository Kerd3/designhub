import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@shared/schemas.js';
import { CLIENT_STATUSES, labelFor } from '@shared/domain.js';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { applyServerErrors, FormError } from './formHelpers.jsx';

const blank = { companyName: '', contactPerson: '', email: '', phone: '', industry: '', website: '', status: 'onboarding', notes: '' };

export function ClientFormModal({ open, onClose, client, onSubmit }) {
  const isEdit = Boolean(client);
  const [serverError, setServerError] = useState(null);
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: blank,
  });

  useEffect(() => {
    if (open) {
      reset(client ? { ...blank, ...client } : blank);
      setServerError(null);
    }
  }, [open, client, reset]);

  const notes = watch('notes') ?? '';

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
      title={isEdit ? `Edit ${client.companyName}` : 'Add client'}
      description="Use fictional details only: this is a demonstration workspace."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="client-form" loading={isSubmitting} loadingText="Saving…">{isEdit ? 'Save changes' : 'Add client'}</Button>
        </>
      }
    >
      <form id="client-form" noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
        <FormError message={serverError} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Company name" required maxLength={100} error={errors.companyName?.message} data-autofocus {...register('companyName')} />
          <Input label="Industry" required maxLength={60} error={errors.industry?.message} {...register('industry')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Contact person" required maxLength={80} autoComplete="off" error={errors.contactPerson?.message} {...register('contactPerson')} />
          <Input label="Email" type="email" required autoComplete="off" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Phone" optional type="tel" maxLength={30} autoComplete="off" hint="Use the 555 range for demo numbers." error={errors.phone?.message} {...register('phone')} />
          <Input label="Company website" optional type="url" placeholder="https://company.example" error={errors.website?.message} {...register('website')} />
        </div>
        <Select label="Client status" required options={CLIENT_STATUSES.map((s) => ({ value: s, label: labelFor(s) }))} error={errors.status?.message} {...register('status')} />
        <Textarea label="Notes" optional rows={3} maxLength={500} valueLength={notes.length} error={errors.notes?.message} {...register('notes')} />
      </form>
    </Modal>
  );
}
