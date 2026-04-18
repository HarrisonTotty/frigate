/**
 * Module Components
 * Module selection and configuration UI components
 */

export { ModuleKindSelector } from "./ModuleKindSelector";
export type { ModuleKindSelectorProps, ModuleVariant } from "./ModuleKindSelector";

export { ModuleStatsDisplay } from "./ModuleStatsDisplay";
export type { ModuleStats, ModuleStatsDisplayProps } from "./ModuleStatsDisplay";

export { ModuleDamageIndicator, ModuleDamageList, determineStatus } from "./ModuleDamageIndicator";
export type {
  ModuleDamageIndicatorProps,
  ModuleDamageListProps,
  ModuleStatus,
} from "./ModuleDamageIndicator";

export { RepairPriorityControl } from "./RepairPriorityControl";
export type { RepairPriorityControlProps, RepairQueueModule } from "./RepairPriorityControl";

export { CriticalDamageAlert, CriticalDamageToast } from "./CriticalDamageAlert";
export type {
  CriticalDamageAlertProps,
  CriticalDamageToastProps,
  CriticalModuleAlert,
} from "./CriticalDamageAlert";
