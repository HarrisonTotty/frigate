import React, { useEffect, ReactNode } from 'react';
import { CenteredModal } from './CenteredModal';
import { Button } from '../components';

export interface FormModalProps {
  title: string;
  isOpen: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  isLoading?: boolean;
  width?: number;
  isDirty?: boolean;
}

export function FormModal({
  title,
  isOpen,
  onSubmit,
  onCancel,
  children,
  submitLabel = 'CREATE',
  cancelLabel = 'CANCEL',
  submitDisabled = false,
  isLoading = false,
  width = 600,
  isDirty = false,
}: FormModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !submitDisabled && !isLoading) {
        e.preventDefault();
        onSubmit();
      }
    };
    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, onSubmit, submitDisabled, isLoading]);

  return (
    <CenteredModal
      title={title}
      isOpen={isOpen}
      onClose={onCancel}
      width={width}
      isDirty={isDirty}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={submitDisabled || isLoading}
            loading={isLoading}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--frigate-space-4)',
        }}
      >
        {children}
      </form>
    </CenteredModal>
  );
}
