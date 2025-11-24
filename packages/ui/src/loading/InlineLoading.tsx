/**
 * Inline loading indicator that switches between content and loading state
 *
 * @example
 * ```tsx
 * <InlineLoading loading={isLoading} loadingText="SCANNING">
 *   <ContactList contacts={contacts} />
 * </InlineLoading>
 * ```
 */
import React from 'react';
import { LoadingText } from './LoadingText';

export interface InlineLoadingProps {
  /** Whether loading */
  loading: boolean;
  /** Text to show when loading */
  loadingText?: string;
  /** Content to show when not loading */
  children: React.ReactNode;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
}

export function InlineLoading({
  loading,
  loadingText = 'LOADING',
  children,
  size = 'medium',
  className = '',
}: InlineLoadingProps) {
  if (loading) {
    return <LoadingText message={loadingText} size={size} className={className} />;
  }

  return <>{children}</>;
}
