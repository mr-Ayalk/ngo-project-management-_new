import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message, options) =>
    sonnerToast.success(message, {
      duration: 3500,
      ...options,
    }),
  error: (message, options) =>
    sonnerToast.error(message, {
      duration: 4500,
      ...options,
    }),
  info: (message, options) =>
    sonnerToast.info(message, {
      duration: 3500,
      ...options,
    }),
  loading: (message, options) => sonnerToast.loading(message, options),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};

export default toast;
