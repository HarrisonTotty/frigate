/**
 * Frigate UI Package
 * 
 * Component library and design system for the Frigate bridge interface.
 */

// Import global styles
import './theme.css';
import './animations.css';

// Export theme tokens
export { theme, colors, typography, spacing, radius, shadow, transition, zIndex, breakpoints } from './theme';
export type { Theme, ColorKey, SpacingKey, RadiusKey } from './theme';

// Export layout primitives
export { Grid, Panel, Overlay, Modal, Stack } from './layout';
export type { GridProps, PanelProps, OverlayProps, ModalProps, StackProps } from './layout';

// Export core components
export { Button, Badge, ProgressBar, Gauge, Select, RadarChart } from './components';
export type { ButtonProps, BadgeProps, ProgressBarProps, GaugeProps, SelectProps, RadarChartProps, RadarChartAxis } from './components';

// Export navigation components
export { Tabs, TabPanel, Accordion } from './navigation';
export type { TabsProps, TabPanelProps, AccordionProps, Tab, AccordionItem } from './navigation';

// Export data components
export { DataGrid } from './data-grid';
export type { DataGridProps, DataGridColumn } from './data-grid';

// Note: Chart components (BarChart, LineChart) planned for future implementation
// RadarChart is exported from ./components above

// Export interaction pattern components
export { KeyboardShortcutProvider, KeyboardShortcutHint, useKeyboardShortcuts, useKeyboardShortcut, formatShortcut } from './keyboard';
export type { KeyboardShortcut, KeyModifier } from './keyboard';

export { CommandPalette, useCommandPalette } from './command-palette';
export type { Command, CommandPaletteProps } from './command-palette';

export { Tooltip, Abbr } from './tooltip';
export type { TooltipProps, AbbrProps } from './tooltip';

export { AlertProvider, AlertManager, AlertBanner, useAlerts, useAlert } from './alerts';
export type { Alert, AlertSeverity, AlertBannerProps } from './alerts';

// Export loading components
export { LoadingText, LoadingOverlay, InlineLoading, ProgressText, ProcessingIndicator } from './loading';
export type { LoadingTextProps, LoadingOverlayProps, InlineLoadingProps, ProgressTextProps, ProcessingIndicatorProps } from './loading';

// Export modal components
export { CenteredModal, ConfirmationModal, FormModal, FormField, FormSelect } from './modals';
export type { CenteredModalProps, ConfirmationModalProps, FormModalProps, FormFieldProps, FormSelectProps } from './modals';

// Export lobby components
export { PlayerRegistration, TeamBrowser, TeamMembership, LobbyView, PlayerSelectionView, TeamSelectionView, ShipSelectionView, ShipDesignWorkspace } from './lobby';
export type { Player, PlayerRegistrationProps, Team, Faction, TeamBrowserProps, TeamMembershipProps, LobbyViewProps, PlayerSelectionViewProps, TeamSelectionViewProps, ShipSelectionViewProps, ShipDesignWorkspaceProps } from './lobby';

export { EnhancedShipCreationModal } from './lobby/EnhancedShipCreationModal';
export type { EnhancedShipCreationModalProps } from './lobby/EnhancedShipCreationModal';

export { BlueprintList, RoleAssignment, BlueprintReadiness, BlueprintWorkflow, LaunchControl } from './lobby';
export type { Blueprint, ShipClass, BridgeRole, CrewAssignment, ShipModule, BlueprintListProps, RoleAssignmentProps, ValidationResult, BlueprintReadinessProps, BlueprintWorkflowProps, LaunchControlProps } from './lobby';

export { useLobbyWorkflowStore } from './lobby';
export type { LobbyWorkflowState, WorkflowStep } from './lobby';

// Export module components (Phase 1.1)
export { ModuleKindSelector } from './modules';
export type { ModuleKindSelectorProps, ModuleVariant } from './modules';

// Export module stats components (Phase 2.1)
export { ModuleStatsDisplay } from './modules';
export type { ModuleStats, ModuleStatsDisplayProps } from './modules';

// Export API client and stores (Phase 4.12.1)
export { HyperionApiClient, createApiClient, defaultApiClient, ApiError } from './api/client';
export type { ApiConfig } from './api/client';

export { useShipClassStore, useShipClasses, useShipClassDetail } from './stores/shipClassStore';
export type { ShipClassStore } from './stores/shipClassStore';

export type {
  ShipSize,
  ShipRole,
  BonusCategory,
  ShipClassBonus,
  BonusCategoryMetadata,
  ManufacturerInfo,
  TechnicalSpecs,
  ShipClassSummary,
  ShipClassDetails,
  ShipClassVariant,
  OperationalMetadata,
  ShipClassFilter,
  ShipClassSortBy,
  SortOrder,
  ShipClassComparison,
} from './types/shipClass';

// Export ship class components (Phase 4.12.2)
export { ShipClassDetailPanel, TechnicalSpecsGrid, BuildConstraintsPanel } from './shipclass';
export type { ShipClassDetailPanelProps, TechnicalSpecsGridProps, BuildConstraintsPanelProps } from './shipclass';

// Export bonus display components (Phase 4.12.3)
export { ShipClassBonusList, BonusCategorySection, BonusItem } from './shipclass';
export type { ShipClassBonusListProps, BonusCategorySectionProps, BonusItemProps } from './shipclass';

// Export ship class browser components (Phase 4.12.5)
export { ShipClassBrowser, ShipClassCard } from './shipclass';
export type { ShipClassBrowserProps, ShipClassCardProps } from './shipclass';

// Export bridge components
export { BridgeShell, CaptainConsole, HelmConsole, EngineeringConsole, TacticalConsole } from './bridge';
export type { BridgeStation, ShipStatus, BridgeShellProps, CrewMember, AlertMessage, CaptainConsoleProps, HelmStatus, HelmConsoleProps, ModuleStatusData, EngineeringConsoleProps, WeaponSystem, TacticalConsoleProps } from './bridge';

// Export main menu components
export { MainMenu, Settings, loadSettings, saveSettings, validateServerUrl, checkServerHealth, getRecentServers, addRecentServer, removeRecentServer, clearRecentServers, measureLatency, retryWithBackoff } from './mainmenu';
export type { MainMenuProps, SettingsProps, UserSettings, ServerInfo, ServerHealthResponse } from './mainmenu';

// Shell component
import React from "react";
import { useSessionStore } from "@frigate/state";

export interface FrigateShellProps {
  readonly children?: React.ReactNode;
}

/**
 * FrigateShell Component
 * 
 * Root component that wraps the entire application.
 * Provides global theme and layout context.
 */
export function FrigateShell({ children }: FrigateShellProps): React.ReactElement {
  const session = useSessionStore();

  return (
    <div className="frigate-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: 'var(--frigate-bg-surface)',
          borderBottom: '1px solid var(--frigate-border-base)',
          padding: 'var(--frigate-space-3) var(--frigate-space-4)',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-small)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--frigate-primary)' }}>FRIGATE</span>
          {session && (
            <span style={{ color: 'var(--frigate-text-secondary)' }}>
              Player: {session.playerId} | Ship: {session.shipId}
            </span>
          )}
        </div>
      </header>
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}

// Default export keeps tree-shaking simple for consumers.
export default FrigateShell;
