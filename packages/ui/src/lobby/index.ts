/**
 * Lobby components
 */

export { PlayerRegistration } from "./PlayerRegistration";
export type { Player, PlayerRegistrationProps } from "./PlayerRegistration";

export { PlayerSelectionView } from "./PlayerSelectionView";
export type { PlayerSelectionViewProps } from "./PlayerSelectionView";

export { TeamSelectionView } from "./TeamSelectionView";
export type { TeamSelectionViewProps, Faction } from "./TeamSelectionView";

export { ShipSelectionView } from "./ShipSelectionView";
export type { ShipSelectionViewProps } from "./ShipSelectionView";

export { ShipDesignWorkspace } from "./ShipDesignWorkspace";
export type {
  ShipDesignWorkspaceProps,
  SchematicData,
  SchematicModule,
} from "./ShipDesignWorkspace";

export { TeamBrowser } from "./TeamBrowser";
export type { TeamBrowserProps, Team } from "./TeamBrowser";

export { TeamMembership } from "./TeamMembership";
export type { TeamMembershipProps } from "./TeamMembership";

export { LobbyView } from "./LobbyView";
export type { LobbyViewProps } from "./LobbyView";

export { BlueprintList } from "./BlueprintList";
export type {
  Blueprint,
  ShipClass,
  BridgeRole,
  CrewAssignment,
  ShipModule,
  BlueprintListProps,
} from "./BlueprintList";

export { RoleAssignment } from "./RoleAssignment";
export type { RoleAssignmentProps } from "./RoleAssignment";

export { BlueprintReadiness } from "./BlueprintReadiness";
export type { ValidationResult, BlueprintReadinessProps } from "./BlueprintReadiness";

export { BlueprintWorkflow } from "./BlueprintWorkflow";
export type { BlueprintWorkflowProps } from "./BlueprintWorkflow";

export { LaunchControl } from "./LaunchControl";
export type { LaunchControlProps } from "./LaunchControl";

export { useLobbyWorkflowStore } from "./lobbyWorkflowStore";
export type { LobbyWorkflowState, WorkflowStep } from "./lobbyWorkflowStore";

export * from "./ModuleSlotCard";
export * from "./ModuleSlotCategoryTabs";

export { ShipStatsPanel } from "./ShipStatsPanel";
export type {
  ShipStats,
  ShipStatsPanelProps,
  ShipProfile,
  ValidationState,
} from "./ShipStatsPanel";

// Inventory Workspace
export { InventoryWorkspace } from "./InventoryWorkspace";
export type {
  InventoryWorkspaceProps,
  Player as InventoryPlayer,
  Team as InventoryTeam,
} from "./InventoryWorkspace";

export { AmmunitionBrowser } from "./AmmunitionBrowser";
export type { AmmunitionBrowserProps } from "./AmmunitionBrowser";

export { AmmunitionCard } from "./AmmunitionCard";
export type { AmmunitionCardProps } from "./AmmunitionCard";

export { LoadedInventoryPanel } from "./LoadedInventoryPanel";
export type { LoadedInventoryPanelProps } from "./LoadedInventoryPanel";

export { InventoryConstraintsPanel } from "./InventoryConstraintsPanel";
export type { InventoryConstraintsPanelProps, InventoryStats } from "./InventoryConstraintsPanel";

export { AmmunitionDetailModal } from "./AmmunitionDetailModal";
export type { AmmunitionDetailModalProps } from "./AmmunitionDetailModal";

// Compatibility utilities
export {
  extractWeaponCompatibility,
  checkAmmoCompatibility,
  getIncompatibilityReason,
  getCompatibleWeapons,
  filterCompatibleAmmo,
} from "./utils/ammoCompatibility";
export type { WeaponCompatibility, CompatibilityResult } from "./utils/ammoCompatibility";
