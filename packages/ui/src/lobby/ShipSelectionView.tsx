/**
 * Ship selection view - Phase 4.6 + 4.12.1 + 4.12.4 + 4.12.5
 * Third step in the lobby workflow - join existing ship or create new one
 * Enhanced with API-driven ship class data (Phase 4.12.1)
 * Enhanced ship creation modal with comprehensive details (Phase 4.12.4)
 * Ship class browser for exploration (Phase 4.12.5)
 */

import React, { useState, useEffect } from "react";
import { Button } from "../components";
import { useAlert } from "../alerts";
import { useLobbyWorkflowStore } from "./lobbyWorkflowStore";
import { useShipClassStore } from "../stores/shipClassStore";
import { EnhancedShipCreationModal } from "./EnhancedShipCreationModal";
import type { SchematicDataForModal } from "./EnhancedShipCreationModal";
import { ShipClassBrowser } from "../shipclass";
import ShipSelectionHeader from "./ShipSelectionHeader";
import ShipList from "./ShipList";
import type { Player, Team } from "../types";
import type { Blueprint } from "./BlueprintList";

export interface ShipSelectionViewProps {
  apiUrl: string;
  player: Player;
  team: Team;
  onBack?: () => void;
  onDisconnect?: () => void;
  className?: string;
  /** Callback to load schematic from file - returns schematic data or null if cancelled */
  onLoadSchematic?: () => Promise<SchematicDataForModal | null>;
  /** Whether a schematic file operation is in progress */
  schematicLoading?: boolean;
}

export function ShipSelectionView({
  apiUrl,
  player,
  team,
  onBack,
  onDisconnect,
  className = "",
  onLoadSchematic,
  schematicLoading = false,
}: ShipSelectionViewProps): React.ReactElement {
  const [ships, setShips] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [creating, setCreating] = useState(false);

  const alert = useAlert();
  const { setBlueprint, goBack, setPendingSchematic } = useLobbyWorkflowStore();

  // Phase 4.12.1: Use ship class store with faction-aware filtering
  const shipClassStore = useShipClassStore();

  // Load ship classes on mount, filtered by team's faction
  useEffect(() => {
    console.log("[ShipSelectionView] Loading ship classes for faction:", team.faction);
    shipClassStore.loadShipClasses(team.faction);
  }, [team.faction]);

  useEffect(() => {
    const loadShips = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/v1/blueprints?team_id=${team.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.blueprints) setShips(data.blueprints);
        }
      } catch (error) {
        console.error("Failed to load ships:", error);
      } finally {
        setLoading(false);
      }
    };
    loadShips();
  }, [apiUrl, team.id]);

  const handleCreateShip = async (shipName: string, shipClassId: string) => {
    // Validation: 3-32 characters
    if (shipName.length < 3 || shipName.length > 32) {
      alert.danger("Invalid Name", "Ship name must be 3-32 characters");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${apiUrl}/v1/blueprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shipName,
          ship_class: shipClassId,
          team_id: team.id,
          player_id: player.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          alert.success("Ship Created", `Successfully created ${shipName}`);
          setBlueprint(data.id);
          setShowCreateModal(false);
          // Reload ships list
          const reloadResponse = await fetch(`${apiUrl}/v1/blueprints?team_id=${team.id}`);
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json();
            if (reloadData && reloadData.blueprints) setShips(reloadData.blueprints);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert.danger("Creation Failed", errorData.error || "Failed to create ship");
      }
    } catch (error) {
      console.error("Failed to create ship:", error);
      alert.danger("Network Error", "Failed to connect to server");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectShip = (shipId: string) => {
    setBlueprint(shipId);
    alert.success("Ship Selected", "Successfully joined ship");
  };

  const handleBack = () => {
    goBack();
    if (onBack) onBack();
  };

  const handleChangePlayer = () => {
    // Go back to player selection (2 steps back)
    const store = useLobbyWorkflowStore.getState();
    store.reset();
    if (onBack) onBack();
  };

  const handleChangeTeam = () => {
    // Go back to team selection (1 step back)
    goBack();
    if (onBack) onBack();
  };

  // Handle loading a schematic file - creates ship directly and advances to design workspace
  const handleLoadSchematic = async () => {
    if (!onLoadSchematic) return;

    const schematic = await onLoadSchematic();
    if (!schematic) return;

    // Validate schematic has required fields
    if (!schematic.name || !schematic.ship_class) {
      alert.danger("Invalid Schematic", "Schematic must have a name and ship class");
      return;
    }

    // Create the ship directly using schematic data
    setCreating(true);
    try {
      const response = await fetch(`${apiUrl}/v1/blueprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: schematic.name,
          ship_class: schematic.ship_class,
          team_id: team.id,
          player_id: player.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          // Store the schematic in workflow for application in design workspace
          setPendingSchematic({
            version: schematic.version,
            name: schematic.name,
            ship_class: schematic.ship_class,
            modules: schematic.modules.map((m) => ({
              slot: m.slot,
              module: m.module,
            })),
          });

          alert.success("Schematic Loaded", `Creating ${schematic.name} from schematic...`);
          // Advance to design workspace - the pending schematic will be applied there
          setBlueprint(data.id);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert.danger("Creation Failed", errorData.error || "Failed to create ship from schematic");
      }
    } catch (error) {
      console.error("Failed to create ship from schematic:", error);
      alert.danger("Network Error", "Failed to connect to server");
    } finally {
      setCreating(false);
    }
  };

  // Close the creation modal
  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  // Phase 4.12.1: Get ship classes from store (sorted by build points)
  const availableShipClasses = shipClassStore.sortShipClasses(
    shipClassStore.shipClasses,
    "buildPoints",
    "asc"
  );

  return (
    <div className={className} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ShipSelectionHeader
        player={player}
        team={team}
        onChangePlayer={handleChangePlayer}
        onChangeTeam={handleChangeTeam}
        onDisconnect={onDisconnect}
      />

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "var(--frigate-space-4)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <ShipList
              ships={ships}
              loading={loading}
              availableShipClasses={availableShipClasses}
              onSelectShip={handleSelectShip}
            />

            <div
              style={{
                display: "flex",
                gap: "var(--frigate-space-2)",
                flexWrap: "wrap",
                marginTop: "var(--frigate-space-3)",
              }}
            >
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                [CREATE NEW SHIP]
              </Button>
              {onLoadSchematic && (
                <Button variant="primary" onClick={handleLoadSchematic} disabled={schematicLoading}>
                  {schematicLoading ? "[LOADING...]" : "[LOAD SCHEMATIC]"}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowBrowser(true)}>
                [BROWSE SHIP CLASSES]
              </Button>
              <Button variant="secondary" onClick={handleBack}>
                [BACK]
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ship Class Browser - Phase 4.12.5 */}
      <ShipClassBrowser
        factionId={team.faction}
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
      />

      {/* Enhanced Ship Creation Modal - Phase 4.12.4 */}
      <EnhancedShipCreationModal
        factionId={team.faction}
        team={{ id: team.id, credits: team.credits ?? 0 }}
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCreate={handleCreateShip}
        isCreating={creating}
      />
    </div>
  );
}
