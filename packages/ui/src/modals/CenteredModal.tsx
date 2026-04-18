import React, { useEffect, useRef, ReactNode } from "react";
import { BOX_DRAWING } from "../constants";

export interface CenteredModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  width?: number;
  isDirty?: boolean;
  className?: string;
}

export function CenteredModal({
  title,
  isOpen,
  onClose,
  children,
  actions,
  width = 600,
  isDirty = false,
  className,
}: CenteredModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDirty, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (!confirmed) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 150ms ease-in-out",
      }}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        style={{
          backgroundColor: "var(--frigate-bg-primary)",
          border: "2px solid var(--frigate-primary)",
          borderRadius: 0,
          width: `${width}px`,
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--frigate-font-mono)",
          boxShadow: "none",
          outline: "none",
        }}
        className={className}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--frigate-space-4)",
            borderBottom: "1px solid var(--frigate-border-light)",
            backgroundColor: "var(--frigate-bg-secondary)",
          }}
        >
          <h2
            id="modal-title"
            style={{
              margin: 0,
              fontSize: "var(--frigate-font-heading)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--frigate-text-primary)",
            }}
          >
            {BOX_DRAWING.VERTICAL_HEAVY} {title}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--frigate-text-secondary)",
              fontSize: "var(--frigate-font-heading)",
              cursor: "pointer",
              padding: "var(--frigate-space-2)",
              fontFamily: "var(--frigate-font-mono)",
              fontWeight: 700,
              transition: "color 50ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--frigate-danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--frigate-text-secondary)";
            }}
          >
            [X]
          </button>
        </div>
        <div
          style={{
            padding: "var(--frigate-space-6)",
            overflowY: "auto",
            flex: 1,
            color: "var(--frigate-text-primary)",
          }}
        >
          {children}
        </div>
        {actions && (
          <div
            style={{
              padding: "var(--frigate-space-4)",
              borderTop: "1px solid var(--frigate-border-light)",
              backgroundColor: "var(--frigate-bg-secondary)",
              display: "flex",
              gap: "var(--frigate-space-3)",
              justifyContent: "flex-end",
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
