/**
 * Ship blueprint components
 * 
 * Components for browsing, creating, and configuring ship blueprints.
 * Integrates with HYPERION API /v1/blueprints endpoints.
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Panel, Stack, Grid, Modal } from '../layout';
import { Button, Badge } from '../components';
import { useAlert } from '../alerts';
import { safeJsonParse } from './apiHelpers';

/**
 * Ship class types
 */
export type ShipClass = 
  | 'battleship' 
  | 'cruiser' 
  | 'destroyer' 
  | 'frigate' 
  | 'corvette'
  | 'scout'
  | 'carrier';

/**
 * Bridge role types
 */
export type BridgeRole =
  | 'captain'
  | 'helm'
  | 'engineering'
  | 'comms'
  | 'science'
  | 'energy_weapons'
  | 'kinetic_weapons'
  | 'missile_weapons'
  | 'countermeasures';

/**
 * Blueprint crew assignment
 */
export interface CrewAssignment {
  player_id: string;
  role: BridgeRole;
  ready: boolean;
}

/**
 * Ship module definition
 */
export interface ShipModule {
  id: string;
  module_id: string;
  name: string;
  category: string;
  position?: { x: number; y: number; z: number };
  power_allocation?: number;
  kind?: string | null;  // Variant ID for modules with multiple kinds
}

/**
 * Ship blueprint data from HYPERION API
 */
export interface Blueprint {
  id: string;
  name: string;
  class: ShipClass;
  faction: string;
  crew: CrewAssignment[];
  modules: ShipModule[];
  created_at?: string;
}

/**
 * Blueprint list props
 */
export interface BlueprintListProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Current player ID */
  currentPlayerId?: string;
  /** Callback when blueprint is selected */
  onBlueprintSelected?: (blueprint: Blueprint) => void;
  /** Currently selected blueprint */
  selectedBlueprint?: Blueprint;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Blueprint list component
 */
export function BlueprintList({
  apiUrl,
  currentPlayerId,
  onBlueprintSelected,
  selectedBlueprint,
  className = '',
}: BlueprintListProps) {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlueprintName, setNewBlueprintName] = useState('');
  const [selectedShipClass, setSelectedShipClass] = useState<ShipClass>('frigate');
  const [selectedFaction, setSelectedFaction] = useState('federation');
  const alert = useAlert();

  useEffect(() => {
    loadBlueprints();
  }, [apiUrl]);

  const loadBlueprints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/blueprints`);
      if (!response.ok) {
        throw new Error(`Failed to load blueprints: ${response.statusText}`);
      }
      
      const data = await safeJsonParse<Blueprint[]>(response);
      setBlueprints(data && Array.isArray(data) ? data : []);
    } catch (error) {
      alert.danger('Load Failed', `Could not load blueprints: ${error}`);
      setBlueprints([]);
    } finally {
      setLoading(false);
    }
  };

  const createBlueprint = async () => {
    if (!newBlueprintName.trim()) {
      alert.warning('Invalid Name', 'Please enter a blueprint name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBlueprintName.trim(),
          ship_class: selectedShipClass,
          faction: selectedFaction,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create blueprint: ${response.statusText}`);
      }

      const newBlueprint = await safeJsonParse<Blueprint>(response);
      if (!newBlueprint) {
        alert.warning('Endpoint Not Implemented', 'Blueprint creation endpoint not yet implemented on server');
        return;
      }
      
      setBlueprints((prev) => [...prev, newBlueprint]);
      setNewBlueprintName('');
      setShowCreateModal(false);
      alert.success('Blueprint Created', `${newBlueprint.name} has been created!`);

      if (onBlueprintSelected) {
        onBlueprintSelected(newBlueprint);
      }
    } catch (error) {
      alert.danger('Creation Failed', `Could not create blueprint: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const shipClasses: ShipClass[] = ['battleship', 'cruiser', 'destroyer', 'frigate', 'corvette', 'scout', 'carrier'];

  return (
    <>
      <Panel title="Ship Blueprints" className={className}>
        <Stack direction="column" gap={4}>
          {/* Selected blueprint */}
          {selectedBlueprint && (
            <div className="p-3 bg-primary-900/20 border border-primary-600 rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                    Current Blueprint
                  </div>
                  <div className="font-bold text-base">
                    {selectedBlueprint.name}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {selectedBlueprint.class}
                  </div>
                </div>
                <Badge variant="primary">{selectedBlueprint.crew.length} crew</Badge>
              </div>
            </div>
          )}

          {/* Blueprint list */}
          {blueprints.length > 0 ? (
            <div>
              <div className="text-sm text-text-muted mb-2">Available Blueprints:</div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {blueprints.map((blueprint) => {
                  const isSelected = selectedBlueprint?.id === blueprint.id;
                  const isPlayerInCrew = currentPlayerId && blueprint.crew.some(c => c.player_id === currentPlayerId);

                  return (
                    <button
                      key={blueprint.id}
                      onClick={() => onBlueprintSelected?.(blueprint)}
                      disabled={loading}
                      className={clsx(
                        'w-full text-left p-3 rounded border transition-colors',
                        isSelected
                          ? 'bg-primary-600 border-primary-500'
                          : 'bg-background-800 border-primary-700 hover:bg-background-700',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{blueprint.name}</div>
                          <div className="text-xs text-text-muted mt-1">
                            {blueprint.class} • {blueprint.faction}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant="info">{blueprint.crew.length} crew</Badge>
                          {isPlayerInCrew && (
                            <Badge variant="success">Joined</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              {loading ? 'Loading blueprints...' : 'No blueprints available. Create one to get started!'}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              disabled={loading}
              fullWidth
            >
              Create New Blueprint
            </Button>
            <Button
              onClick={loadBlueprints}
              variant="ghost"
              size="sm"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Refreshing...' : 'Refresh Blueprints'}
            </Button>
          </div>
        </Stack>
      </Panel>

      {/* Create blueprint modal */}
      <Modal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Blueprint"
        size="md"
      >
        <Stack direction="column" gap={4}>
          {/* Blueprint name */}
          <div>
            <label className="block text-sm text-text-muted mb-2">
              Ship Name:
            </label>
            <input
              type="text"
              value={newBlueprintName}
              onChange={(e) => setNewBlueprintName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createBlueprint();
                }
              }}
              placeholder="USS Enterprise"
              maxLength={50}
              className="w-full bg-background-900 border border-primary-700 rounded px-4 py-2 text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          {/* Ship class selection */}
          <div>
            <label className="block text-sm text-text-muted mb-2">
              Ship Class:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shipClasses.map((shipClass) => (
                <button
                  key={shipClass}
                  onClick={() => setSelectedShipClass(shipClass)}
                  disabled={loading}
                  className={clsx(
                    'p-3 rounded border transition-colors text-left',
                    selectedShipClass === shipClass
                      ? 'bg-primary-600 border-primary-500'
                      : 'bg-background-800 border-primary-700 hover:bg-background-700',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="font-medium capitalize">{shipClass}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Faction input */}
          <div>
            <label className="block text-sm text-text-muted mb-2">
              Faction:
            </label>
            <input
              type="text"
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              placeholder="federation"
              className="w-full bg-background-900 border border-primary-700 rounded px-4 py-2 text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={createBlueprint}
              variant="primary"
              disabled={loading || !newBlueprintName.trim()}
              fullWidth
            >
              {loading ? 'Creating...' : 'Create Blueprint'}
            </Button>
            <Button
              onClick={() => {
                setShowCreateModal(false);
                setNewBlueprintName('');
              }}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </Stack>
      </Modal>
    </>
  );
}
