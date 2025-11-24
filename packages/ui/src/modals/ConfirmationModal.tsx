import React from 'react';
import { CenteredModal } from './CenteredModal';
import { Button } from '../components';

export interface ConfirmationModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export function ConfirmationModal({
  title,
  message,
  isOpen,
  onConfirm,
  onCancel,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  isDanger = false,
}: ConfirmationModalProps) {
  return (
    <CenteredModal
      title={title}
      isOpen={isOpen}
      onClose={onCancel}
      width={500}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p
        style={{
          margin: 0,
          fontSize: 'var(--frigate-font-body)',
          lineHeight: 1.6,
          color: isDanger ? 'var(--frigate-danger)' : 'var(--frigate-text-primary)',
        }}
      >
        {message}
      </p>
    </CenteredModal>
  );
}
