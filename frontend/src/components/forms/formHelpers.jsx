import { AlertCircle } from 'lucide-react';

/**
 * Maps a server 422 response onto form fields and returns a message for the
 * form-level alert, so server-side validation is shown exactly like client-side.
 */
export function applyServerErrors(error, setError) {
  if (error?.isValidation && error.details) {
    Object.entries(error.details).forEach(([field, message]) => setError(field, { message }));
    return 'Some fields need attention. Check the highlighted fields.';
  }
  return error?.message || 'Something went wrong. Please try again.';
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex gap-3 rounded-md bg-danger-soft px-4 py-3 text-small text-ink">
      <AlertCircle aria-hidden="true" className="icon-align-4 size-4 shrink-0 text-danger" /> {message}
    </p>
  );
}
