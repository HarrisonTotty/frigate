// Re-export modal components from split files
export { CenteredModal } from './modals/CenteredModal';
export type { CenteredModalProps } from './modals/CenteredModal';
export { ConfirmationModal } from './modals/ConfirmationModal';
export type { ConfirmationModalProps } from './modals/ConfirmationModal';
export { FormModal } from './modals/FormModal';
export type { FormModalProps } from './modals/FormModal';
export { FormField } from './modals/FormField';
export type { FormFieldProps } from './modals/FormField';
export { FormSelect } from './modals/FormSelect';
export type { FormSelectProps } from './modals/FormSelect';

// Add fade-in animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
