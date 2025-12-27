/**
 * Lobby workflow state management
 *
 * Tracks progression through the sequential lobby workflow:
 * Player Selection → Team Selection → Ship Selection → Ship Design
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SchematicData } from './ShipDesignWorkspace';

/**
 * Workflow steps
 */
export type WorkflowStep = 'player' | 'team' | 'ship' | 'design' | 'inventory';

/**
 * Lobby workflow state
 */
export interface LobbyWorkflowState {
  /** Current step in the workflow */
  currentStep: WorkflowStep;
  
  /** Selected player ID */
  selectedPlayerId: string | null;
  
  /** Selected team ID */
  selectedTeamId: string | null;
  
  /** Selected blueprint/ship ID */
  selectedBlueprintId: string | null;

  /** Registered schematic ID (after design step completion) */
  registeredSchematicId: string | null;

  /** Whether there are unsaved changes in the current step */
  hasUnsavedChanges: boolean;

  /** Pending schematic to apply after ship creation (from LOAD SCHEMATIC in creation modal) */
  pendingSchematic: SchematicData | null;

  /** Set the selected player and advance to team selection */
  setPlayer: (playerId: string) => void;
  
  /** Set the selected team and advance to ship selection */
  setTeam: (teamId: string) => void;
  
  /** Set the selected blueprint and advance to ship design */
  setBlueprint: (blueprintId: string) => void;

  /** Register schematic and advance to inventory step */
  registerSchematic: (schematicId: string) => void;

  /** Go back to the previous step */
  goBack: () => void;
  
  /** Navigate to a specific step (validates prerequisites) */
  goToStep: (step: WorkflowStep) => boolean;
  
  /** Set unsaved changes flag */
  setUnsavedChanges: (dirty: boolean) => void;
  
  /** Reset workflow to initial state */
  reset: () => void;
  
  /** Clear selection for a specific entity (e.g., when changing player) */
  clearPlayer: () => void;
  clearTeam: () => void;
  clearBlueprint: () => void;
  clearSchematic: () => void;

  /** Set pending schematic (to apply after ship creation) */
  setPendingSchematic: (schematic: SchematicData | null) => void;

  /** Clear pending schematic (after it's been applied) */
  clearPendingSchematic: () => void;

  /** Validate persisted state against server (auto-resume) */
  validatePersistedState: (apiUrl: string) => Promise<boolean>;
  
  /** Navigate with unsaved changes confirmation */
  navigateWithConfirmation: (step: WorkflowStep, onConfirm?: () => void) => boolean | 'needs-confirmation';
}

/**
 * Lobby workflow store
 */
export const useLobbyWorkflowStore = create<LobbyWorkflowState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'player',
      selectedPlayerId: null,
      selectedTeamId: null,
      selectedBlueprintId: null,
      registeredSchematicId: null,
      hasUnsavedChanges: false,
      pendingSchematic: null,

      // Set player and advance
      setPlayer: (playerId: string) => {
        set({
          selectedPlayerId: playerId,
          currentStep: 'team',
          hasUnsavedChanges: false,
        });
      },

      // Set team and advance
      setTeam: (teamId: string) => {
        console.log('[Workflow Store] setTeam called with:', teamId);
        console.log('[Workflow Store] Current state before update:', get());
        set({
          selectedTeamId: teamId,
          currentStep: 'ship',
          hasUnsavedChanges: false,
        });
        console.log('[Workflow Store] State after update:', get());
      },

      // Set blueprint and advance
      setBlueprint: (blueprintId: string) => {
        set({
          selectedBlueprintId: blueprintId,
          currentStep: 'design',
          hasUnsavedChanges: false,
        });
      },

      // Register schematic and advance to inventory
      registerSchematic: (schematicId: string) => {
        set({
          registeredSchematicId: schematicId,
          currentStep: 'inventory',
          hasUnsavedChanges: false,
        });
      },

      // Go back to previous step
      goBack: () => {
        const { currentStep } = get();

        switch (currentStep) {
          case 'team':
            set({ currentStep: 'player', hasUnsavedChanges: false });
            break;
          case 'ship':
            set({ currentStep: 'team', hasUnsavedChanges: false });
            break;
          case 'design':
            set({ currentStep: 'ship', hasUnsavedChanges: false });
            break;
          case 'inventory':
            set({ currentStep: 'design', hasUnsavedChanges: false });
            break;
          case 'player':
            // Already at first step
            break;
        }
      },

      // Navigate to specific step (with validation)
      goToStep: (step: WorkflowStep): boolean => {
        const { selectedPlayerId, selectedTeamId, selectedBlueprintId, registeredSchematicId } = get();

        // Validate prerequisites
        switch (step) {
          case 'player':
            set({ currentStep: 'player', hasUnsavedChanges: false });
            return true;

          case 'team':
            if (!selectedPlayerId) {
              console.warn('Cannot navigate to team selection without a player');
              return false;
            }
            set({ currentStep: 'team', hasUnsavedChanges: false });
            return true;

          case 'ship':
            if (!selectedPlayerId || !selectedTeamId) {
              console.warn('Cannot navigate to ship selection without player and team');
              return false;
            }
            set({ currentStep: 'ship', hasUnsavedChanges: false });
            return true;

          case 'design':
            if (!selectedPlayerId || !selectedTeamId || !selectedBlueprintId) {
              console.warn('Cannot navigate to ship design without player, team, and blueprint');
              return false;
            }
            set({ currentStep: 'design', hasUnsavedChanges: false });
            return true;

          case 'inventory':
            if (!selectedPlayerId || !selectedTeamId || !selectedBlueprintId || !registeredSchematicId) {
              console.warn('Cannot navigate to inventory without player, team, blueprint, and registered schematic');
              return false;
            }
            set({ currentStep: 'inventory', hasUnsavedChanges: false });
            return true;

          default:
            return false;
        }
      },

      // Set unsaved changes flag
      setUnsavedChanges: (dirty: boolean) => {
        set({ hasUnsavedChanges: dirty });
      },

      // Reset to initial state
      reset: () => {
        set({
          currentStep: 'player',
          selectedPlayerId: null,
          selectedTeamId: null,
          selectedBlueprintId: null,
          registeredSchematicId: null,
          hasUnsavedChanges: false,
          pendingSchematic: null,
        });
      },

      // Clear player (and dependent selections)
      clearPlayer: () => {
        set({
          selectedPlayerId: null,
          selectedTeamId: null,
          selectedBlueprintId: null,
          registeredSchematicId: null,
          currentStep: 'player',
          hasUnsavedChanges: false,
        });
      },

      // Clear team (and dependent selections)
      clearTeam: () => {
        set({
          selectedTeamId: null,
          selectedBlueprintId: null,
          registeredSchematicId: null,
          currentStep: 'team',
          hasUnsavedChanges: false,
        });
      },

      // Clear blueprint (and dependent selections)
      clearBlueprint: () => {
        set({
          selectedBlueprintId: null,
          registeredSchematicId: null,
          currentStep: 'ship',
          hasUnsavedChanges: false,
        });
      },

      // Clear registered schematic
      clearSchematic: () => {
        set({
          registeredSchematicId: null,
          currentStep: 'design',
          hasUnsavedChanges: false,
        });
      },

      // Set pending schematic (to apply after ship creation)
      setPendingSchematic: (schematic: SchematicData | null) => {
        set({ pendingSchematic: schematic });
      },

      // Clear pending schematic (after it's been applied)
      clearPendingSchematic: () => {
        set({ pendingSchematic: null });
      },

      // Validate persisted state against server (auto-resume)
      validatePersistedState: async (apiUrl: string): Promise<boolean> => {
        const { selectedPlayerId, selectedTeamId, selectedBlueprintId } = get();
        
        try {
          // Validate player exists
          if (selectedPlayerId) {
            const playerResponse = await fetch(`${apiUrl}/v1/players`);
            if (!playerResponse.ok) return false;
            const playerData = await playerResponse.json();
            const playerExists = playerData.players?.some((p: any) => p.id === selectedPlayerId);
            if (!playerExists) {
              console.warn('Persisted player no longer exists, resetting workflow');
              get().reset();
              return false;
            }
          }
          
          // Validate team exists
          if (selectedTeamId) {
            const teamResponse = await fetch(`${apiUrl}/v1/teams`);
            if (!teamResponse.ok) return false;
            const teamData = await teamResponse.json();
            const teamExists = teamData.teams?.some((t: any) => t.id === selectedTeamId);
            if (!teamExists) {
              console.warn('Persisted team no longer exists, clearing team selection');
              get().clearTeam();
              return false;
            }
          }
          
          // Validate blueprint exists
          if (selectedBlueprintId) {
            const blueprintResponse = await fetch(`${apiUrl}/v1/blueprints/${selectedBlueprintId}`);
            if (!blueprintResponse.ok) {
              console.warn('Persisted blueprint no longer exists, clearing blueprint selection');
              get().clearBlueprint();
              return false;
            }
          }
          
          return true;
        } catch (error) {
          console.error('Error validating persisted state:', error);
          return false;
        }
      },
      
      // Navigate with unsaved changes confirmation
      navigateWithConfirmation: (step: WorkflowStep, onConfirm?: () => void): boolean | 'needs-confirmation' => {
        const { hasUnsavedChanges, goToStep } = get();
        
        if (hasUnsavedChanges) {
          // Return special value indicating confirmation is needed
          // The caller should show a confirmation modal
          if (onConfirm) {
            onConfirm();
          }
          return 'needs-confirmation';
        }
        
        return goToStep(step);
      },
    }),
    {
      name: 'frigate-lobby-workflow',
      // Only persist selections, not unsaved changes flag
      partialize: (state) => ({
        selectedPlayerId: state.selectedPlayerId,
        selectedTeamId: state.selectedTeamId,
        selectedBlueprintId: state.selectedBlueprintId,
        registeredSchematicId: state.registeredSchematicId,
        currentStep: state.currentStep,
      }),
    }
  )
);
