import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { inquirySchema, LIMITS } from '@shared/schemas.js';
import { INQUIRY_PROJECT_TYPES, BUDGET_RANGES } from '@shared/domain.js';
import { inquiryService } from '@/services/inquiryService.js';
import { dataSourceLabel } from '@/services/apiClient.js';
import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { contact } from '@/data/studio.js';
import { usePageMeta } from '@/hooks/usePageMeta.js';

const EMPTY = { name: '', email: '', company: '', projectType: '', budget: '', description: '' };

function SuccessPanel({ inquiry, onReset }) {
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div role="status" className="rounded-xl bg-success-soft p-6 sm:p-10">
      <CheckCircle2 aria-hidden="true" className="size-9 text-success" />
      <h2 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-h2 font-bold text-ink outline-none">
        Thanks, {inquiry.name.split(' ')[0]}. Your inquiry is in.
      </h2>
      <p className="mt-3 max-w-[52ch] text-body text-ink">
        We saved it as <strong className="font-semibold">{inquiry.id}</strong>. In a real studio, someone would reply to {inquiry.email} within two working days. In this demo, it now appears in the workspace inquiry list.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onReset} variant="primary">Send another inquiry</Button>
        <Button to="/workspace/inquiries" variant="outline" rightIcon={ArrowRight}>See it in the workspace</Button>
      </div>
    </div>
  );
}

function InquiryForm({ onSuccess }) {
  const [params] = useSearchParams();
  const presetType = INQUIRY_PROJECT_TYPES.includes(params.get('type')) ? params.get('type') : '';
  const toast = useToast();
  const [submitError, setSubmitError] = useState(null);
  const inFlight = useRef(false);

  const {
    register, handleSubmit, watch, setError, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: { ...EMPTY, projectType: presetType },
    mode: 'onTouched',
  });

  const description = watch('description') ?? '';

  const onSubmit = async (values) => {
    if (inFlight.current) return; // belt and braces against double submission
    inFlight.current = true;
    setSubmitError(null);
    try {
      const inquiry = await inquiryService.submit(values);
      toast.success('Inquiry sent', `Reference ${inquiry.id}`);
      onSuccess(inquiry);
    } catch (error) {
      if (error.isValidation && error.details) {
        Object.entries(error.details).forEach(([field, message]) => setError(field, { message }));
      }
      const message = error.isNetworkError
        ? 'We could not reach the server. Check your connection and try again; your answers are still here.'
        : `${error.message} Your answers are still here, so you can try again.`;
      setSubmitError(message);
      toast.error('Your inquiry was not sent', error.message);
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} aria-describedby="form-note" className="flex flex-col gap-6">
      {submitError && (
        <div role="alert" className="flex gap-3 rounded-lg bg-danger-soft p-4 text-small text-ink">
          <AlertCircle aria-hidden="true" className="icon-align-5 size-5 shrink-0 text-danger" />
          <div>
            <p className="font-semibold">Your inquiry was not sent.</p>
            <p className="mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Full name" required autoComplete="name" maxLength={LIMITS.name} error={errors.name?.message} {...register('name')} />
        <Input label="Email address" required type="email" autoComplete="email" inputMode="email" maxLength={120} error={errors.email?.message} {...register('email')} />
      </div>
      <Input label="Company name" optional autoComplete="organization" maxLength={LIMITS.company} error={errors.company?.message} {...register('company')} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Select label="Project type" required placeholder="Choose a project type" options={INQUIRY_PROJECT_TYPES} error={errors.projectType?.message} {...register('projectType')} />
        <Select label="Budget range" required placeholder="Choose a budget range" options={BUDGET_RANGES} hint="A rough range helps us suggest the right scope." error={errors.budget?.message} {...register('budget')} />
      </div>
      <Textarea
        label="Project description"
        required
        rows={6}
        maxLength={LIMITS.inquiryDescription}
        valueLength={description.length}
        hint="What are you building, who is it for, and is there a deadline? At least 30 characters."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-small text-muted">
          Fields marked <span aria-hidden="true" className="text-danger">*</span><span className="visually-hidden">with an asterisk</span> are required. Submissions go to the {dataSourceLabel.toLowerCase()}.
        </p>
        <Button type="submit" size="lg" loading={isSubmitting} loadingText="Sending…" rightIcon={Send} className="shrink-0">
          Send inquiry
        </Button>
      </div>
    </form>
  );
}

export default function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Tell DesignHub Studio about your project. A working inquiry form in a fictional studio portfolio project.',
  });
  const [submitted, setSubmitted] = useState(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <section aria-labelledby="contact-title" className="page-container pb-24 pt-14 lg:pb-36 lg:pt-24">
      <h1 id="contact-title" className="font-display text-display font-extrabold text-ink">
        <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"><span className="block animate-rise">Start a project</span></span>
      </h1>

      <div className="mt-10 grid gap-14 lg:mt-14 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-0">
        <aside aria-labelledby="alt-contact" className="flex flex-col gap-8 lg:pr-16">
          <p className="max-w-[36ch] text-lead text-ink">Tell us about the problem you want to solve. A short description is plenty to start.</p>
          <div className="rounded-xl bg-surface-2 p-6">
            <h2 id="alt-contact" className="font-display text-h3 font-bold text-ink">Prefer to talk?</h2>
            <ul className="mt-5 flex flex-col gap-4 text-body">
              <li className="flex gap-3"><Mail aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-muted" /><a href={`mailto:${contact.email}`} className="font-medium text-primary underline underline-offset-4">{contact.email}</a></li>
              <li className="flex gap-3"><Phone aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-muted" /><a href={contact.phoneHref} className="font-medium text-primary underline underline-offset-4">{contact.phone}</a></li>
              <li className="flex gap-3"><MapPin aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-muted" /><address className="not-italic text-ink">{contact.address.join(', ')}</address></li>
              <li className="flex gap-3"><Clock aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-muted" /><span className="text-ink">{contact.hours}</span></li>
            </ul>
            <p className="mt-5 text-small text-muted">{contact.notice}</p>
          </div>
          <div>
            <h2 className="font-display text-h3 font-bold text-ink">What happens next</h2>
            <ol className="mt-4 flex list-inside list-decimal flex-col gap-2 text-body text-ink marker:font-semibold marker:text-muted">
              <li>We read every inquiry and reply within two working days.</li>
              <li>A 30-minute call to understand the goal and constraints.</li>
              <li>A written proposal for the first phase, with a fixed price.</li>
            </ol>
            <p className="mt-4 text-small text-muted">Not ready yet? <Link to="/work" className="font-medium text-primary underline underline-offset-4">Browse our work</Link> first.</p>
          </div>
        </aside>

        <div>
          {submitted ? (
            <SuccessPanel inquiry={submitted} onReset={() => { setSubmitted(null); setFormKey((k) => k + 1); }} />
          ) : (
            <div className="rounded-xl bg-surface p-5 ring-1 ring-border sm:p-8">
              <InquiryForm key={formKey} onSuccess={setSubmitted} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
