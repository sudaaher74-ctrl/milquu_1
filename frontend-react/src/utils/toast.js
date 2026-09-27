import { eventBus } from './eventBus';

// Small non-blocking notices for the admin panel, replacing window.alert —
// which froze the page and could not be styled or stacked. Rendered by
// <ToastHost /> in components/admin/Toast.jsx.

let nextId = 1;
const push = (type, message, duration) =>
  eventBus.emit('TOAST', { id: nextId++, type, message: String(message ?? ''), duration });

/**
 * toast('Saved') picks success or error from the wording; toast.success,
 * toast.error and toast.info are explicit.
 */
const ERROR_WORDS = /\b(fail|failed|error|could not|couldn't|cannot|can't|invalid|insufficient|please|required|not allowed|denied|unable|missing|no data)\b/i;
export const toast = (message, duration) => push(ERROR_WORDS.test(String(message)) ? 'error' : 'success', message, duration);
toast.success = (message, duration) => push('success', message, duration);
toast.error = (message, duration) => push('error', message, duration ?? 6000);
toast.info = (message, duration) => push('info', message, duration);

export default toast;
