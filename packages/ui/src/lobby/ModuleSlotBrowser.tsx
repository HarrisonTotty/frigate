import React, { useState, useMemo } from 'react';
import type { ModuleInstance, ModuleSlot } from '@frigate/api-client';
import { ModuleSlotBrowserCore } from '../modules/ModuleSlotBrowserCore';
import { BOX_DRAWING } from '../constants';

/**
 * Lobby Module Slot Browser Props
 */
export interface LobbyModuleSlotBrowserProps {
  /** API base URL */
  apiUrl: string;
  /** Blueprint ID for this design session */
  blueprintId: string;
  /** Currently installed module instances */
  installedModules?: ModuleInstance[];
  /** Pre-loaded module slots list (optional - if provided, skips fetching) */
  moduleSlots?: ModuleSlot[];
  /** Build points currently used */
  buildPointsUsed?: number;
  /** Maximum build points available */
  maxBuildPoints?: number;
  /** Callback when a module slot is selected for adding - receives the slot ID */
  onModuleAdded?: (slotId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Module Slot Browser Header Component
 * 
 * Displays title and build points allocation status.
 */
interface ModuleSlotBrowserHeaderProps {
  buildPointsUsed: number;
  buildPointsMax: number;
}

function ModuleSlotBrowserHeader({
  buildPointsUsed,
  buildPointsMax,
}: ModuleSlotBrowserHeaderProps) {
  const percentage = (buildPointsUsed / buildPointsMax) * 100;
  const filled = Math.round((percentage / 100) * 10);
  const empty = 10 - filled;
  const statusColor =
    percentage > 90
      ? 'var(--frigate-danger)'
      : percentage > 70
        ? 'var(--frigate-warning)'
        : 'var(--frigate-success)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--frigate-space-1)',
        backgroundColor: 'var(--frigate-bg-base)',
        padding: 'var(--frigate-space-2)',
        borderBottom: '1px solid var(--frigate-border-base)',
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 'var(--frigate-font-heading)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        MODULE SLOT BROWSER
      </div>
      <div
        style={{
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        BUILD POINTS: {buildPointsUsed} / {buildPointsMax}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--frigate-space-1)',
          fontSize: 'var(--frigate-font-small)',
        }}
      >
        <span style={{ color: statusColor, fontWeight: 700, letterSpacing: '-0.05em' }}>
          {'█'.repeat(filled)}
        </span>
        <span
          style={{
            color: 'var(--frigate-text-muted)',
            letterSpacing: '-0.05em',
            opacity: 0.3,
          }}
        >
          {'░'.repeat(empty)}
        </span>
        <span style={{ color: 'var(--frigate-text-muted)', marginLeft: 'var(--frigate-space-2)' }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Module Slot Browser Footer Component
 *
 * Displays keyboard navigation hints.
 */
function ModuleSlotBrowserFooter() {
  return (
    <div
      style={{
        fontSize: 'var(--frigate-font-tiny)',
        color: 'var(--frigate-text-muted)',
        backgroundColor: 'var(--frigate-bg-base)',
        padding: 'var(--frigate-space-1) var(--frigate-space-2)',
        borderTop: '1px solid var(--frigate-border-base)',
        letterSpacing: '0.05em',
      }}
    >
      [/] SEARCH  [S] SORT  [TAB] NAV  [ENTER] ADD
    </div>
  );
}

/**
 * Lobby Module Slot Browser Component
 * 
 * Wrapper component for the module slot browser that provides:
 * - Header with build points display and visual indicator
 * - Main browser for slot selection
 * - Footer with keyboard navigation hints
 * 
 * Features:
 * - Real-time build point tracking
 * - Visual status indicator (success/warning/danger)
 * - Accessible keyboard navigation
 * - Technical aesthetic with ASCII styling
 * 
 * @example
 * ```tsx
 * <ModuleSlotBrowser
 *   apiUrl="http://localhost:3000"
 *   blueprintId="bp1"
 *   buildPointsUsed={45}
 *   maxBuildPoints={100}
 *   onModuleAdded={() => console.log('Module added')}
 * />
 * ```
 */
export function ModuleSlotBrowser(props: LobbyModuleSlotBrowserProps) {
  const buildPointsUsed = props.buildPointsUsed ?? 0;
  const maxBuildPoints = props.maxBuildPoints ?? 100;

  return (
    <div
      style={{
        fontFamily: 'var(--frigate-font-mono)',
        background: 'var(--frigate-bg-base)',
        color: 'var(--frigate-text-primary)',
        border: '1px solid var(--frigate-border-base)',
        borderRadius: 0,
        boxShadow: 'none',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        overflow: 'hidden',
      }}
      aria-label="Module Slot Browser"
      role="region"
    >
      {/* Header */}
      <ModuleSlotBrowserHeader
        buildPointsUsed={buildPointsUsed}
        buildPointsMax={maxBuildPoints}
      />

      {/* Browser Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ModuleSlotBrowserCore
          apiUrl={props.apiUrl}
          blueprintId={props.blueprintId}
          installedModules={props.installedModules ?? []}
          moduleSlots={props.moduleSlots}
          buildPointsUsed={buildPointsUsed}
          maxBuildPoints={maxBuildPoints}
          onModuleAdded={props.onModuleAdded}
        />
      </div>

      {/* Footer */}
      <ModuleSlotBrowserFooter />
    </div>
  );
}

export default ModuleSlotBrowser;
