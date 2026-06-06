import { toast } from 'sonner';

/**
 * Show a Sonner confirmation toast instead of window.confirm().
 * Resolves true if confirmed, false if cancelled.
 */
export function confirmToast(message, options = {}) {
  const {
    description,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'warning',
  } = options;

  return new Promise((resolve) => {
    const toastFn = variant === 'error' ? toast.error : toast.warning;

    toastFn(message, {
      description,
      duration: Infinity,
      closeButton: true,
      action: {
        label: confirmLabel,
        onClick: () => resolve(true),
      },
      cancel: {
        label: cancelLabel,
        onClick: () => resolve(false),
      },
      onDismiss: () => resolve(false),
      onAutoClose: () => resolve(false),
    });
  });
}

export async function confirmAndRun(message, action, options = {}) {
  const ok = await confirmToast(message, options);
  if (!ok) return false;
  await action();
  return true;
}
