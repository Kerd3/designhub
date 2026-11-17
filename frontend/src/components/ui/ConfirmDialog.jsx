import { useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

/**
 * Confirmation step for destructive or irreversible actions.
 * Focus starts on Cancel so Enter never destroys anything by accident.
 * `onConfirm` may return a promise; the dialog stays open and shows progress until it settles.
 */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', tone = 'danger' }) {
  const cancelRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (busy) return;
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button ref={cancelRef} variant="outline" onClick={close} disabled={busy}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} loading={busy} loadingText="Working…">
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {tone === 'danger' && (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
        )}
        <div className="text-body text-muted">{message}</div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-small text-danger">{error}</p>}
    </Modal>
  );
}
