/**
 * Engineering Console - Power and systems management
 * 
 * Features:
 * - Power allocation controls
 * - Cooling system management
 * - Module status grid
 * - Repair controls
 * - Integration with ship blueprint modules
 */

import React, { useState, useEffect } from 'react';
import { Panel, Grid } from '../../layout';
import { Button, ProgressBar } from '../../components';
import { useAlert } from '../../alerts';
import { ModuleDamageIndicator, RepairPriorityControl, type RepairQueueModule, type ModuleStatus as DamageStatus } from '../../modules';

export interface ModuleStatusData {
  id: string;
  name: string;
  category: string;
  health: number; // 0-100
  power_allocated: number; // 0-100%
  cooling_allocated: number; // 0-100%
  status: DamageStatus;
  efficiency?: number; // 0-100% based on power/cooling
}

export interface ShipModule {
  id: string;
  module_id: string;
  name: string;
  category: string;
  kind?: string | null;
}

export interface EngineeringConsoleProps {
  /** Ship ID */
  shipId: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Ship modules (from blueprint) */
  modules?: ModuleStatusData[] | ShipModule[];
  /** Total power available */
  totalPower?: number;
  /** Power in use */
  powerUsed?: number;
  /** Total cooling capacity */
  totalCooling?: number;
  /** Cooling in use */
  coolingUsed?: number;
  /** Callback when power allocated */
  onAllocatePower?: (moduleId: string, amount: number) => void;
  /** Callback when cooling allocated */
  onAllocateCooling?: (moduleId: string, amount: number) => void;
  /** Callback when repair initiated */
  onRepair?: (moduleId: string) => void;
}

/**
 * Engineering Console Component
 */
export function EngineeringConsole({
  shipId,
  apiBaseUrl = 'http://localhost:8000',
  modules = [],
  totalPower = 100,
  powerUsed = 0,
  totalCooling = 100,
  coolingUsed = 0,
  onAllocatePower,
  onAllocateCooling,
  onRepair
}: EngineeringConsoleProps) {
  const { success, danger } = useAlert();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [moduleStates, setModuleStates] = useState<Map<string, { power: number; cooling: number }>>(new Map());

  // Normalize modules to ModuleStatusData format
  /**
   * Normalize modules from either ModuleStatusData or ShipModule format
   */
  const normalizeModules = (
    modules: ModuleStatusData[] | ShipModule[]
  ): ModuleStatusData[] => {
    if (!modules || modules.length === 0) return [];

    // Check if already normalized
    if ('health' in modules[0]) {
      return modules as ModuleStatusData[];
    }
    
    // Convert ShipModule to ModuleStatusData with default values
    return (modules as ShipModule[]).map((shipModule) => {
      const state = moduleStates.get(shipModule.id) || { power: 100, cooling: 50 };
      
      return {
        id: shipModule.id,
        name: shipModule.name,
        category: shipModule.category,
        health: 100, // Default to full health
        power_allocated: state.power,
        cooling_allocated: state.cooling,
        status: 'operational' as DamageStatus,
        efficiency: 100,
      };
    });
  };

  const getStatusAbbreviation = (status: string): string => {
    switch (status) {
      case 'operational': return 'OPER';
      case 'damaged': return 'DMGD';
      case 'offline': return 'OFFL';
      default: return status.substring(0, 4).toUpperCase();
    }
  };

  const abbreviateModuleName = (name: string): string => {
    // Common module abbreviations
    const abbr: Record<string, string> = {
      'Power Core': 'PWR-CORE',
      'Shields': 'SHLD',
      'Impulse Engine': 'IMP-ENG',
      'Warp Drive': 'WARP',
      'Life Support': 'LIFE-SUP',
      'Sensors': 'SNSR',
      'Communications': 'COMM',
      'Weapons': 'WPNS',
      'Thrusters': 'THRS',
      'Cooling': 'COOL',
      'Reactor': 'RCTR'
    };
    return abbr[name] || name.toUpperCase().substring(0, 8);
  };

  const allocatePower = async (moduleId: string, percentage: number) => {
    // Update local state
    setModuleStates(prev => {
      const next = new Map(prev);
      const current = next.get(moduleId) || { power: 100, cooling: 50 };
      next.set(moduleId, { ...current, power: percentage });
      return next;
    });

    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}/power/allocate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId, power_percentage: percentage })
      });

      if (response.ok) {
        success('Power allocated');
        onAllocatePower?.(moduleId, percentage);
      } else {
        danger('Failed to allocate power');
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const allocateCooling = async (moduleId: string, percentage: number) => {
    // Update local state
    setModuleStates(prev => {
      const next = new Map(prev);
      const current = next.get(moduleId) || { power: 100, cooling: 50 };
      next.set(moduleId, { ...current, cooling: percentage });
      return next;
    });

    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}/cooling/allocate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId, cooling_percentage: percentage })
      });

      if (response.ok) {
        success('Cooling allocated');
        onAllocateCooling?.(moduleId, percentage);
      } else {
        danger('Failed to allocate cooling');
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const repairModule = async (moduleId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}/repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId })
      });

      if (response.ok) {
        success('Repair initiated');
        onRepair?.(moduleId);
      } else {
        danger('Repair failed');
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const powerRemaining = totalPower - powerUsed;
  const powerPercentage = (powerUsed / totalPower) * 100;
  const coolingRemaining = totalCooling - coolingUsed;
  const coolingPercentage = (coolingUsed / totalCooling) * 100;

  // Normalize modules for rendering
  const normalizedModules: ModuleStatusData[] = normalizeModules(modules || []);

  return (
    <Grid cols="2fr 1fr" gap={3} fullHeight>
      {/* Module Grid */}
      <Panel title="SHIP SYSTEMS" variant="default">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--frigate-space-3)' }}>
          {normalizedModules.map((module) => (
            <div
              key={module.id}
              onClick={() => setSelectedModule(module.id)}
              style={{
                padding: '8px',
                backgroundColor: selectedModule === module.id ? 'var(--frigate-surface-overlay)' : 'var(--frigate-surface-base)',
                border: '1px solid var(--frigate-border-base)',
                cursor: 'pointer',
                transition: 'background-color 50ms ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
                <span style={{ 
                  fontWeight: 700,
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-small)',
                  letterSpacing: '0.05em'
                }}>
                  {abbreviateModuleName(module.name)}
                </span>
                <span style={{
                  fontSize: 'var(--frigate-font-tiny)',
                  fontFamily: 'var(--frigate-font-mono)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: module.status === 'operational' ? 'var(--frigate-success)' :
                         module.status === 'damaged' ? 'var(--frigate-warning)' : 'var(--frigate-danger)'
                }}>
                  {getStatusAbbreviation(module.status)}
                </span>
              </div>
              
              <div style={{ marginBottom: 'var(--frigate-space-2)' }}>
                <div style={{ 
                  fontSize: 'var(--frigate-font-tiny)', 
                  color: 'var(--frigate-text-tertiary)', 
                  fontFamily: 'var(--frigate-font-mono)',
                  letterSpacing: '0.05em',
                  marginBottom: '4px' 
                }}>
                  HLTH: {module.health.toString().padStart(3, ' ')}%
                </div>
                <ProgressBar
                  value={module.health}
                  max={100}
                  variant={module.health > 70 ? 'success' : module.health > 30 ? 'warning' : 'danger'}
                />
              </div>

              <div>
                <div style={{ 
                  fontSize: 'var(--frigate-font-tiny)', 
                  color: 'var(--frigate-text-tertiary)',
                  fontFamily: 'var(--frigate-font-mono)',
                  letterSpacing: '0.05em',
                  marginBottom: '4px' 
                }}>
                  PWR: {module.power_allocated.toString().padStart(3, ' ')}%
                </div>
                <ProgressBar
                  value={module.power_allocated}
                  max={100}
                  variant="primary"
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Power and Cooling Management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--frigate-space-3)' }}>
        <Panel title="POWER DISTRIBUTION" variant="default">
          <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
              <span style={{ 
                fontSize: 'var(--frigate-font-tiny)', 
                color: 'var(--frigate-text-tertiary)',
                fontFamily: 'var(--frigate-font-mono)',
                letterSpacing: '0.05em'
              }}>
                TOTAL AVAIL
              </span>
              <span style={{ 
                fontSize: 'var(--frigate-font-small)', 
                fontWeight: 700,
                fontFamily: 'var(--frigate-font-mono)'
              }}>
                {totalPower} MW
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
              <span style={{ 
                fontSize: 'var(--frigate-font-tiny)', 
                color: 'var(--frigate-text-tertiary)',
                fontFamily: 'var(--frigate-font-mono)',
                letterSpacing: '0.05em'
              }}>
                IN USE
              </span>
              <span style={{ 
                fontSize: 'var(--frigate-font-small)', 
                fontWeight: 700,
                fontFamily: 'var(--frigate-font-mono)'
              }}>
                {powerUsed} MW
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
              <span style={{ 
                fontSize: 'var(--frigate-font-tiny)', 
                color: 'var(--frigate-text-tertiary)',
                fontFamily: 'var(--frigate-font-mono)',
                letterSpacing: '0.05em'
              }}>
                REMAINING
              </span>
              <span style={{ 
                fontSize: 'var(--frigate-font-small)', 
                fontWeight: 700,
                fontFamily: 'var(--frigate-font-mono)',
                color: powerRemaining < 10 ? 'var(--frigate-danger)' : 'var(--frigate-text-primary)'
              }}>
                {powerRemaining} MW
              </span>
            </div>
            
            <ProgressBar
              value={powerPercentage}
              max={100}
              variant={powerPercentage > 90 ? 'danger' : powerPercentage > 70 ? 'warning' : 'success'}
            />
          </div>
        </Panel>

        <Panel title="COOLING SYSTEMS" variant="default">
          <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
              <span style={{ 
                fontSize: 'var(--frigate-font-tiny)', 
                color: 'var(--frigate-text-tertiary)',
                fontFamily: 'var(--frigate-font-mono)',
                letterSpacing: '0.05em'
              }}>
                CAPACITY
              </span>
              <span style={{ 
                fontSize: 'var(--frigate-font-small)', 
                fontWeight: 700,
                fontFamily: 'var(--frigate-font-mono)'
              }}>
                {totalCooling} kW
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
              <span style={{ 
                fontSize: 'var(--frigate-font-tiny)', 
                color: 'var(--frigate-text-tertiary)',
                fontFamily: 'var(--frigate-font-mono)',
                letterSpacing: '0.05em'
              }}>
                IN USE
              </span>
              <span style={{ 
                fontSize: 'var(--frigate-font-small)', 
                fontWeight: 700,
                fontFamily: 'var(--frigate-font-mono)'
              }}>
                {coolingUsed} kW
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--frigate-space-2)' }}>
              <span style={{ 
                fontSize: 'var(--frigate-font-tiny)', 
                color: 'var(--frigate-text-tertiary)',
                fontFamily: 'var(--frigate-font-mono)',
                letterSpacing: '0.05em'
              }}>
                AVAILABLE
              </span>
              <span style={{ 
                fontSize: 'var(--frigate-font-small)', 
                fontWeight: 700,
                fontFamily: 'var(--frigate-font-mono)',
                color: coolingRemaining < 10 ? 'var(--frigate-danger)' : 'var(--frigate-text-primary)'
              }}>
                {coolingRemaining} kW
              </span>
            </div>
            
            <ProgressBar
              value={coolingPercentage}
              max={100}
              variant={coolingPercentage > 90 ? 'danger' : coolingPercentage > 70 ? 'warning' : 'success'}
            />
          </div>
        </Panel>

        {selectedModule && (
          <Panel title="MODULE CONTROL" variant="default">
            {(() => {
              const module = normalizedModules.find(m => m.id === selectedModule);
              if (!module) return null;

              return (
                <div>
                  <h4 style={{ 
                    marginBottom: 'var(--frigate-space-3)', 
                    fontSize: 'var(--frigate-font-body)',
                    fontFamily: 'var(--frigate-font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}>
                    {abbreviateModuleName(module.name)}
                  </h4>
                  
                  <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
                    <label style={{ 
                      fontSize: 'var(--frigate-font-tiny)', 
                      color: 'var(--frigate-text-tertiary)', 
                      fontFamily: 'var(--frigate-font-mono)',
                      letterSpacing: '0.05em',
                      display: 'block', 
                      marginBottom: 'var(--frigate-space-2)' 
                    }}>
                      PWR ALLOC: {module.power_allocated.toString().padStart(3, ' ')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={module.power_allocated}
                      onChange={(e) => allocatePower(module.id, Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
                    <label style={{ 
                      fontSize: 'var(--frigate-font-tiny)', 
                      color: 'var(--frigate-text-tertiary)', 
                      fontFamily: 'var(--frigate-font-mono)',
                      letterSpacing: '0.05em',
                      display: 'block', 
                      marginBottom: 'var(--frigate-space-2)' 
                    }}>
                      COOLING: {module.cooling_allocated.toString().padStart(3, ' ')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={module.cooling_allocated}
                      onChange={(e) => allocateCooling(module.id, Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--frigate-font-tiny)', 
                      color: 'var(--frigate-text-tertiary)',
                      fontFamily: 'var(--frigate-font-mono)',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--frigate-space-1)'
                    }}>
                      <span>EFFICIENCY:</span>
                      <span style={{
                        color: (module.efficiency || 100) > 80 ? 'var(--frigate-success)' :
                               (module.efficiency || 100) > 50 ? 'var(--frigate-warning)' : 'var(--frigate-danger)',
                        fontWeight: 700
                      }}>
                        {module.efficiency || 100}%
                      </span>
                    </div>
                    <ProgressBar
                      value={module.efficiency || 100}
                      max={100}
                      variant={(module.efficiency || 100) > 80 ? 'success' : (module.efficiency || 100) > 50 ? 'warning' : 'danger'}
                    />
                  </div>

                  {module.status === 'damaged' && (
                    <Button
                      variant="primary"
                      onClick={() => repairModule(module.id)}
                      style={{ width: '100%' }}
                    >
                      INITIATE REPAIRS
                    </Button>
                  )}

                  {module.status === 'offline' && (
                    <div style={{
                      padding: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--frigate-danger)',
                      fontSize: 'var(--frigate-font-tiny)',
                      fontFamily: 'var(--frigate-font-mono)',
                      letterSpacing: '0.05em',
                      color: 'var(--frigate-danger)'
                    }}>
                      [!!] MODULE OFFLINE - REPAIR REQ
                    </div>
                  )}
                </div>
              );
            })()}
          </Panel>
        )}

        {/* Repair Queue Panel */}
        {(() => {
          // Build repair queue from damaged modules
          const damagedModules: RepairQueueModule[] = normalizedModules
            .filter((m) => m.health < 100 && m.status !== 'operational')
            .map((m) => ({
              id: m.id,
              name: m.name,
              health: m.health,
              status: m.status,
              category: m.category,
              priority: m.status === 'offline' ? 1 : m.status === 'critical' ? 2 : 3,
              estimatedTime: Math.ceil((100 - m.health) / 10), // Rough estimate
            }));

          if (damagedModules.length === 0) return null;

          return (
            <Panel title="REPAIR MANAGEMENT" variant="default">
              <RepairPriorityControl
                modules={damagedModules}
                onPriorityChange={(moduleId: string, priority: number) => {
                  console.log(`Priority changed for ${moduleId}: ${priority}`);
                }}
                onStartRepair={(moduleId: string) => {
                  repairModule(moduleId);
                }}
                activeRepairId={null}
              />
            </Panel>
          );
        })()}
      </div>
    </Grid>
  );
}
