'use client';

import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      expand
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'ena-toast',
          title: 'ena-toast-title',
          description: 'ena-toast-desc',
          success: 'ena-toast-success',
          error: 'ena-toast-error',
          info: 'ena-toast-info',
          closeButton: 'ena-toast-close',
        },
      }}
    />
  );
}
