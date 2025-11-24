import React, { useState, useCallback, useEffect } from "react";
import { 
  FrigateShell, 
  MainMenu, 
  Settings,
  PlayerSelectionView,
  TeamSelectionView,
  ShipSelectionView,
  ShipDesignWorkspace,
  AlertProvider,
  AlertManager,
  checkServerHealth,
  getRecentServers,
  addRecentServer,
  validateServerUrl,
  retryWithBackoff,
  useLobbyWorkflowStore,
} from "@frigate/ui";
import { invoke } from "@tauri-apps/api/core";

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

  const handleQuit = useCallback(async () => {
    try {
      await invoke('close_application');
    } catch (error) {
      console.error('Failed to close application:', error);
      // Fallback to window close
      window.close();
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
            version="0.1.0"
            onConnect={handleConnect}
            onSettings={() => setSettingsVisible(true)}
            onQuit={handleQuit}
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
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  console.log('[LobbyWorkflow] Rendering with currentStep:', currentStep, 'selectedTeamId:', selectedTeamId);

  // Load players to get the current player data
  useEffect(() => {
    const loadPlayers = async () => {
      setLoadingPlayers(true);
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
      } finally {
        setLoadingPlayers(false);
      }
    };

    if (selectedPlayerId) {
      loadPlayers();
    }
  }, [apiUrl, selectedPlayerId]);

  // Load teams to get the current team data
  useEffect(() => {
    const loadTeams = async () => {
      console.log('[LobbyWorkflow] Loading teams for selectedTeamId:', selectedTeamId);
      setLoadingTeams(true);
      try {
        const response = await fetch(`${apiUrl}/v1/teams`);
        if (response.ok) {
          const data = await response.json();
          if (data.teams) {
            console.log('[LobbyWorkflow] Teams loaded:', data.teams);
            setTeams(data.teams);
          }
        }
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoadingTeams(false);
      }
    };

    if (selectedTeamId) {
      loadTeams();
    }
  }, [apiUrl, selectedTeamId, currentStep]);

  const handleDisconnect = () => {
    reset();
    onDisconnect();
  };

  // Route to appropriate view based on workflow step
  switch (currentStep) {
    case 'player':
      return (
        <PlayerSelectionView
          apiUrl={apiUrl}
          onDisconnect={handleDisconnect}
        />
      );

    case 'team': {
      const currentPlayer = players.find((p: any) => p.id === selectedPlayerId);
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
      console.log('[LobbyWorkflow] Ship case - loadingPlayers:', loadingPlayers, 'loadingTeams:', loadingTeams);
      const currentPlayer = players.find((p: any) => p.id === selectedPlayerId);
      const currentTeam = teams.find((t: any) => t.id === selectedTeamId);
      console.log('[LobbyWorkflow] currentPlayer:', currentPlayer, 'currentTeam:', currentTeam);
      
      // Show loading state while data is being fetched
      if (loadingPlayers || loadingTeams || !currentPlayer || !currentTeam) {
        console.log('[LobbyWorkflow] Showing loading screen');
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            fontFamily: 'var(--frigate-font-mono)',
            color: 'var(--frigate-text-secondary)',
          }}>
            LOADING SHIP SELECTION...
          </div>
        );
      }
      
      console.log('[LobbyWorkflow] Rendering ShipSelectionView');
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
      const currentPlayer = players.find((p: any) => p.id === selectedPlayerId);
      const currentTeam = teams.find((t: any) => t.id === selectedTeamId);
      
      // Show loading state while data is being fetched
      if (loadingPlayers || loadingTeams || !currentPlayer || !currentTeam || !selectedBlueprintId) {
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
          onBack={() => {}}
          onDisconnect={handleDisconnect}
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
