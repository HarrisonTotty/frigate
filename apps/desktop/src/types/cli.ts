/**
 * CLI Arguments Types
 *
 * TypeScript types for CLI arguments passed from the Rust backend
 * via the get_cli_args Tauri command.
 */

/**
 * CLI arguments passed from Rust backend
 */
export interface CliArgs {
  /** Normalized server URL (http://host:port) or null */
  connect: string | null;
  /** Player name to select or create */
  user: string | null;
  /** Team name to select or create */
  team: string | null;
  /** Faction ID for new team */
  faction: string | null;
  /** Ship/blueprint name to select or create */
  ship: string | null;
  /** Ship class for new ship */
  ship_class: string | null;
}

/**
 * Auto-setup progress steps
 */
export type AutoSetupStep =
  | 'idle'
  | 'connecting'
  | 'selecting-player'
  | 'creating-player'
  | 'selecting-team'
  | 'creating-team'
  | 'selecting-ship'
  | 'creating-ship'
  | 'complete'
  | 'error';

/**
 * Auto-setup progress state
 */
export interface AutoSetupProgress {
  /** Whether connection to server succeeded */
  connected: boolean;
  /** Selected or created player ID */
  playerId: string | null;
  /** Selected or created team ID */
  teamId: string | null;
  /** Selected or created blueprint ID */
  blueprintId: string | null;
}

/**
 * Auto-setup state
 */
export interface AutoSetupState {
  /** Current setup step */
  step: AutoSetupStep;
  /** Error message if step is 'error' */
  error: string | null;
  /** Progress of each sub-step */
  progress: AutoSetupProgress;
}

/**
 * Step display info for UI
 */
export interface StepDisplayInfo {
  label: string;
  detail?: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}
