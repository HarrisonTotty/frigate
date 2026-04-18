/**
 * Bridge module exports
 *
 * Components for bridge station views including shared infrastructure
 * and individual station consoles.
 */

export { BridgeShell } from "./BridgeShell";
export type { BridgeStation, ShipStatus, BridgeShellProps } from "./BridgeShell";

export { CaptainConsole } from "./stations/CaptainConsole";
export type { CrewMember, AlertMessage, CaptainConsoleProps } from "./stations/CaptainConsole";

export { HelmConsole } from "./stations/HelmConsole";
export type { HelmStatus, HelmConsoleProps } from "./stations/HelmConsole";

export { EngineeringConsole } from "./stations/EngineeringConsole";
export type { ModuleStatusData, EngineeringConsoleProps } from "./stations/EngineeringConsole";

export { TacticalConsole } from "./stations/TacticalConsole";
export type { WeaponSystem, TacticalConsoleProps } from "./stations/TacticalConsole";
