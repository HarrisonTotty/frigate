import React from 'react';
import clsx from 'clsx';

/**
 * TabPanel Component
 * 
 * Content container for tab panels. Use in conjunction with Tabs.
 */
export interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  activeTab: string;
  className?: string;
}

export function TabPanel({ children, value, activeTab, className }: TabPanelProps) {
  if (value !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      className={clsx('frigate-tab-panel', className)}
      style={{
        padding: 'var(--frigate-space-4)',
        animation: 'frigate-fade-in var(--frigate-transition-fast)',
      }}
    >
      {children}
    </div>
  );
}
