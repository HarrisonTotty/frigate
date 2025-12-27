import React, { useState, useCallback, useEffect } from "react";
import {
  FrigateShell,
  MainMenu,
  Settings,
  PlayerSelectionView,
  TeamSelectionView,
  ShipSelectionView,
  ShipDesignWorkspace,
  InventoryWorkspace,
  AlertProvider,
  AlertManager,
  checkServerHealth,
  getRecentServers,
  addRecentServer,
  validateServerUrl,
  retryWithBackoff,
  useLobbyWorkflowStore,
} from "@frigate/ui";
import type { SchematicData, SchematicModule } from "@frigate/ui";
import { useSchematicFile } from "./hooks/useSchematicFile";

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [recentServers, setRecentServers] = useState<string[]>(getRecentServers());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>('');

  const handleConnect = useCallback(async (url: string) => {
    const validation = validateServerUrl(url);
    if (!validation.valid) {
      setConnectionStatus('error');
      setErrorMessage(validation.error);
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage(undefined);
    setServerUrl(url);

    try {
      // Use retry logic for connecting to server
      const health = await retryWithBackoff(() => checkServerHealth(url));
      
      if (health.status === 'healthy') {
        setConnectionStatus('connected');
        setIsConnected(true);
        addRecentServer(url);
        setRecentServers(getRecentServers());
        
        // Auto-resume: validate persisted lobby workflow state
        const workflowStore = useLobbyWorkflowStore.getState();
        if (workflowStore.selectedPlayerId || workflowStore.selectedTeamId || workflowStore.selectedBlueprintId) {
          console.log('Validating persisted lobby workflow state...');
          const isValid = await workflowStore.validatePersistedState(url);
          if (!isValid) {
            console.log('Persisted state was invalid and has been reset');
          } else {
            console.log('Persisted state validated, resuming workflow');
          }
        }
      } else {
        setConnectionStatus('error');
        setErrorMessage('Server is not healthy');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  }, []);

  // Show main menu if not connected
  if (!isConnected) {
    return (
      <AlertProvider>
        <FrigateShell>
          <MainMenu
            connectionStatus={connectionStatus}
            errorMessage={errorMessage}
            recentServers={recentServers}
            version="0.1.0-web"
            onConnect={handleConnect}
            onSettings={() => setSettingsVisible(true)}
          />
          <Settings
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
          />
          <AlertManager />
        </FrigateShell>
      </AlertProvider>
    );
  }

  // Once connected, show lobby workflow
  return (
    <AlertProvider>
      <FrigateShell>
        <LobbyWorkflow
          apiUrl={serverUrl}
          onDisconnect={() => {
            setIsConnected(false);
            setConnectionStatus('disconnected');
          }}
        />
        <AlertManager />
      </FrigateShell>
    </AlertProvider>
  );
}

/**
 * Lobby workflow component that routes between player/team/ship/design views
 */
function LobbyWorkflow({ apiUrl, onDisconnect }: { apiUrl: string; onDisconnect: () => void }) {
  const { currentStep, selectedPlayerId, selectedTeamId, selectedBlueprintId, reset } = useLobbyWorkflowStore();
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Schematic file operations
  const { saveSchematic, loadSchematic, loading: schematicLoading } = useSchematicFile();

  // Schematic save handler - converts SchematicData to SchematicFile format
  const handleSaveSchematic = useCallback(async (schematic: SchematicData): Promise<boolean> => {
    return saveSchematic({
      version: schematic.version,
      name: schematic.name,
      ship_class: schematic.ship_class,
      modules: schematic.modules.map((m: SchematicModule) => ({
        slot: m.slot,
        module: m.module,
      })),
    });
  }, [saveSchematic]);

  // Schematic load handler - converts SchematicFile to SchematicData format
  const handleLoadSchematic = useCallback(async (): Promise<SchematicData | null> => {
    const file = await loadSchematic();
    if (!file) return null;
    return {
      version: file.version,
      name: file.name,
      ship_class: file.ship_class,
      modules: file.modules.map((m): SchematicModule => ({
        slot: m.slot,
        module: m.module,
      })),
    };
  }, [loadSchematic]);

  // Load players to get the current player data
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await fetch(`${apiUrl}/v1/players`);
        if (response.ok) {
          const data = await response.json();
          if (data.players) {
            setPlayers(data.players);
          }
        }
      } catch (error) {
        console.error('Error loading players:', error);
      }
    };

    if (selectedPlayerId) {
      loadPlayers();
    }
  }, [apiUrl, selectedPlayerId]);

  // Load teams to get the current team data
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await fetch(`${apiUrl}/v1/teams`);
        if (response.ok) {
          const data = await response.json();
          if (data.teams) {
            setTeams(data.teams);
          }
        }
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };

    if (selectedTeamId) {
      loadTeams();
    }
  }, [apiUrl, selectedTeamId]);

  const handleDisconnect = () => {
    reset();
    onDisconnect();
  };

  // Route to appropriate view based on workflow step
  console.log('[LobbyWorkflow] Rendering with currentStep:', currentStep);
  console.log('[LobbyWorkflow] selectedPlayerId:', selectedPlayerId, 'selectedTeamId:', selectedTeamId, 'selectedBlueprintId:', selectedBlueprintId);
  console.log('[LobbyWorkflow] players array:', players, 'teams array:', teams);

  // Debug: Check if we're about to hit the inventory case
  if (currentStep === 'inventory') {
    const currentPlayer = players.find((p: any) => p.id === selectedPlayerId);
    const currentTeam = teams.find((t: any) => t.id === selectedTeamId);
    console.log('[LobbyWorkflow] INVENTORY CASE - currentPlayer:', currentPlayer, 'currentTeam:', currentTeam, 'blueprintId:', selectedBlueprintId);
  }

  switch (currentStep) {
    case 'player':
      return (
        <PlayerSelectionView
          apiUrl={apiUrl}
          onDisconnect={handleDisconnect}
        />
      );

    case 'team': {
      const currentPlayer = players.find(p => p.id === selectedPlayerId);
      if (!currentPlayer) {
        // If we don't have player data yet, go back to player selection
        return (
          <PlayerSelectionView
            apiUrl={apiUrl}
            onDisconnect={handleDisconnect}
          />
        );
      }
      return (
        <TeamSelectionView
          apiUrl={apiUrl}
          player={currentPlayer}
          onBack={() => {}}
          onDisconnect={handleDisconnect}
        />
      );
    }

    case 'ship': {
      const currentPlayer = players.find(p => p.id === selectedPlayerId);
      const currentTeam = teams.find(t => t.id === selectedTeamId);
      if (!currentPlayer || !currentTeam) {
        // If we don't have required data, go back
        return (
          <PlayerSelectionView
            apiUrl={apiUrl}
            onDisconnect={handleDisconnect}
          />
        );
      }
      return (
        <ShipSelectionView
          apiUrl={apiUrl}
          player={currentPlayer}
          team={currentTeam}
          onBack={() => {}}
          onDisconnect={handleDisconnect}
        />
      );
    }

    case 'design': {
      const currentPlayer = players.find(p => p.id === selectedPlayerId);
      const currentTeam = teams.find(t => t.id === selectedTeamId);
      
      // Show loading state while data is being fetched
      if (!currentPlayer || !currentTeam || !selectedBlueprintId) {
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            fontFamily: 'var(--frigate-font-mono)',
            color: 'var(--frigate-text-secondary)',
          }}>
            LOADING SHIP DESIGN WORKSPACE...
          </div>
        );
      }
      
      return (
        <ShipDesignWorkspace
          apiUrl={apiUrl}
          player={currentPlayer}
          team={currentTeam}
          blueprintId={selectedBlueprintId}
          onBack={() => reset()}
          onDisconnect={handleDisconnect}
          onSaveSchematic={handleSaveSchematic}
          onLoadSchematic={handleLoadSchematic}
          schematicLoading={schematicLoading}
        />
      );
    }

    case 'inventory': {
      console.log('[LobbyWorkflow] ENTERING INVENTORY CASE');
      const currentPlayer = players.find((p: any) => p.id === selectedPlayerId);
      const currentTeam = teams.find((t: any) => t.id === selectedTeamId);
      console.log('[LobbyWorkflow] inventory - currentPlayer:', currentPlayer, 'currentTeam:', currentTeam);

      // Show loading state while data is being fetched
      if (!currentPlayer || !currentTeam || !selectedBlueprintId) {
        console.log('[LobbyWorkflow] SHOWING LOADING SCREEN - missing:', !currentPlayer ? 'player' : '', !currentTeam ? 'team' : '', !selectedBlueprintId ? 'blueprintId' : '');
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'var(--frigate-font-mono)',
            color: 'var(--frigate-text-secondary)',
          }}>
            LOADING INVENTORY WORKSPACE...
          </div>
        );
      }

      console.log('[LobbyWorkflow] RENDERING INVENTORY WORKSPACE');
      return (
        <InventoryWorkspace
          apiUrl={apiUrl}
          player={currentPlayer}
          team={currentTeam}
          blueprintId={selectedBlueprintId}
          availableWeight={100} // TODO: Calculate from ship design
          installedModules={[]} // TODO: Get from blueprint
          onBack={() => {}}
          onDisconnect={handleDisconnect}
          onRegisterCargo={() => {
            // TODO: Handle cargo registration - advance to next step or complete
            console.log('Cargo registered!');
          }}
        />
      );
    }

    default:
      return (
        <PlayerSelectionView
          apiUrl={apiUrl}
          onDisconnect={handleDisconnect}
        />
      );
  }
}

export default App;
