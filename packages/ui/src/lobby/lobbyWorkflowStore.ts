/**
 * Lobby workflow state management
 * 
 * Tracks progression through the sequential lobby workflow:
 * Player Selection → Team Selection → Ship Selection → Ship Design
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workflow steps
 */
export type WorkflowStep = 'player' | 'team' | 'ship' | 'design';

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
  
  /** Whether there are unsaved changes in the current step */
  hasUnsavedChanges: boolean;
  
  /** Set the selected player and advance to team selection */
  setPlayer: (playerId: string) => void;
  
  /** Set the selected team and advance to ship selection */
  setTeam: (teamId: string) => void;
  
  /** Set the selected blueprint and advance to ship design */
  setBlueprint: (blueprintId: string) => void;
  
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
      hasUnsavedChanges: false,

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

      // Go back to previous step
      goBack: () => {
        const { currentStep, selectedPlayerId, selectedTeamId } = get();
        
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
          case 'player':
            // Already at first step
            break;
        }
      },

      // Navigate to specific step (with validation)
      goToStep: (step: WorkflowStep): boolean => {
        const { selectedPlayerId, selectedTeamId, selectedBlueprintId } = get();
        
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
          hasUnsavedChanges: false,
        });
      },

      // Clear player (and dependent selections)
      clearPlayer: () => {
        set({
          selectedPlayerId: null,
          selectedTeamId: null,
          selectedBlueprintId: null,
          currentStep: 'player',
          hasUnsavedChanges: false,
        });
      },

      // Clear team (and dependent selections)
      clearTeam: () => {
        set({
          selectedTeamId: null,
          selectedBlueprintId: null,
          currentStep: 'team',
          hasUnsavedChanges: false,
        });
      },

      // Clear blueprint
      clearBlueprint: () => {
        set({
          selectedBlueprintId: null,
          currentStep: 'ship',
          hasUnsavedChanges: false,
        });
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
        currentStep: state.currentStep,
      }),
    }
  )
);
