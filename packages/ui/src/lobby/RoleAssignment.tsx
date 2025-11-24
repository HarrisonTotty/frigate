/**
 * Crew role assignment component
 * 
 * Allows players to join blueprints and select their bridge roles.
 * Integrates with HYPERION API blueprint crew endpoints.
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Panel, Stack } from '../layout';
import { Button, Badge } from '../components';
import { useAlert } from '../alerts';
import type { Blueprint, BridgeRole, CrewAssignment } from './BlueprintList';

/**
 * Role assignment props
 */
export interface RoleAssignmentProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Current player ID */
  currentPlayerId?: string;
  /** Current blueprint */
  blueprint?: Blueprint;
  /** Callback when role assignments change */
  onRolesChanged?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Role metadata with technical abbreviations
 */
const ROLE_INFO: Record<BridgeRole, { name: string; abbr: string; description: string }> = {
  captain: {
    name: 'Captain',
    abbr: 'CAPT',
    description: 'Overall command and strategic decisions',
  },
  helm: {
    name: 'Helmsman',
    abbr: 'HELM',
    description: 'Navigation and movement control',
  },
  engineering: {
    name: 'Lead Engineer',
    abbr: 'ENGR',
    description: 'Power management and repairs',
  },
  comms: {
    name: 'Communications Officer',
    abbr: 'COMM',
    description: 'Hailing and message handling',
  },
  science: {
    name: 'Science Officer',
    abbr: 'SCNC',
    description: 'Sensors and analysis',
  },
  energy_weapons: {
    name: 'Directed Energy Weapons Officer',
    abbr: 'DEWO',
    description: 'Phaser and beam weapon systems',
  },
  kinetic_weapons: {
    name: 'Kinetic Weapons Officer',
    abbr: 'KNTC',
    description: 'Railgun and ballistic systems',
  },
  missile_weapons: {
    name: 'Missile Weapons Officer',
    abbr: 'MSSL',
    description: 'Torpedo and missile systems',
  },
  countermeasures: {
    name: 'Countermeasures Officer',
    abbr: 'CNTW',
    description: 'Shields and defensive systems',
  },
};

/**
 * Crew role assignment component
 */
export function RoleAssignment({
  apiUrl,
  currentPlayerId,
  blueprint,
  onRolesChanged,
  className = '',
}: RoleAssignmentProps) {
  const [loading, setLoading] = useState(false);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const alert = useAlert();

  useEffect(() => {
    if (blueprint) {
      setCrewAssignments(blueprint.crew || []);
    }
  }, [blueprint?.id]);

  const joinBlueprint = async () => {
    if (!currentPlayerId || !blueprint) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/blueprints/${blueprint.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: currentPlayerId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join blueprint: ${response.statusText}`);
      }

      alert.success('Joined Blueprint', `You have joined ${blueprint.name}!`);
      
      if (onRolesChanged) {
        onRolesChanged();
      }
    } catch (error) {
      alert.danger('Join Failed', `Could not join blueprint: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (role: BridgeRole) => {
    if (!currentPlayerId || !blueprint) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/blueprints/${blueprint.id}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: {
            [currentPlayerId]: role,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign role: ${response.statusText}`);
      }

      alert.success('Role Assigned', `You are now ${ROLE_INFO[role].name}!`);
      
      if (onRolesChanged) {
        onRolesChanged();
      }
    } catch (error) {
      alert.danger('Assignment Failed', `Could not assign role: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlayerRole = (): BridgeRole | undefined => {
    if (!currentPlayerId) return undefined;
    return crewAssignments.find(c => c.player_id === currentPlayerId)?.role;
  };

  const isRoleTaken = (role: BridgeRole): boolean => {
    return crewAssignments.some(c => c.role === role);
  };

  const isPlayerInCrew = currentPlayerId && crewAssignments.some(c => c.player_id === currentPlayerId);
  const currentRole = getCurrentPlayerRole();

  if (!blueprint) {
    return (
      <Panel title="CREW ROSTER" className={className}>
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          [NO BLUEPRINT SELECTED]
        </div>
      </Panel>
    );
  }

  if (!currentPlayerId) {
    return (
      <Panel title="CREW ROSTER" className={className}>
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          [NO PLAYER SELECTED]
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="CREW ROSTER" className={className}>
      <Stack direction="column" gap={4}>
        {/* Blueprint info with technical details */}
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--frigate-bg-raised)',
          border: '1px solid var(--frigate-border-base)',
          fontFamily: 'var(--frigate-font-mono)',
        }}>
          <div style={{
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '4px',
          }}>
            BLUEPRINT
          </div>
          <div style={{
            fontSize: 'var(--frigate-font-body)',
            fontWeight: 600,
            color: 'var(--frigate-text-primary)',
            textTransform: 'uppercase',
          }}>
            {blueprint.name}
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
          }}>
            CREW: {crewAssignments.length} ASSIGNED
            {isPlayerInCrew && currentRole && (
              <span style={{ marginLeft: '12px', color: 'var(--frigate-primary)' }}>
                YOUR ROLE: {ROLE_INFO[currentRole].abbr}
              </span>
            )}
          </div>
        </div>

        {/* Join button or role selection */}
        {!isPlayerInCrew ? (
          <Button
            onClick={joinBlueprint}
            variant="success"
            disabled={loading}
            fullWidth
          >
            {loading ? '[JOINING...]' : '[JOIN CREW]'}
          </Button>
        ) : (
          <>
            {/* Current role display */}
            {currentRole && (
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--frigate-bg-surface)',
                border: '1px solid var(--frigate-primary)',
                fontFamily: 'var(--frigate-font-mono)',
              }}>
                <div style={{
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '4px',
                }}>
                  YOUR ROLE
                </div>
                <div style={{
                  fontSize: 'var(--frigate-font-body)',
                  fontWeight: 600,
                  color: 'var(--frigate-primary)',
                  textTransform: 'uppercase',
                }}>
                  {ROLE_INFO[currentRole].abbr} - {ROLE_INFO[currentRole].name}
                </div>
                <div style={{
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-secondary)',
                  marginTop: '4px',
                }}>
                  {ROLE_INFO[currentRole].description}
                </div>
              </div>
            )}

            {/* Available roles */}
            <div>
              <div style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
              }}>
                {currentRole ? 'REASSIGN ROLE:' : 'SELECT ROLE:'}
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {(Object.keys(ROLE_INFO) as BridgeRole[]).map((role) => {
                  const taken = isRoleTaken(role);
                  const isCurrent = role === currentRole;
                  const info = ROLE_INFO[role];

                  return (
                    <button
                      key={role}
                      onClick={() => !taken && assignRole(role)}
                      disabled={loading || taken}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontFamily: 'var(--frigate-font-mono)',
                        backgroundColor: isCurrent ? 'var(--frigate-primary-muted)' :
                                       taken ? 'var(--frigate-bg-base)' :
                                       'var(--frigate-bg-surface)',
                        border: isCurrent ? '1px solid var(--frigate-primary)' :
                               '1px solid var(--frigate-border-base)',
                        color: 'var(--frigate-text-primary)',
                        cursor: taken ? 'not-allowed' : 'pointer',
                        opacity: taken && !isCurrent ? 0.5 : 1,
                        transition: 'all 50ms',
                      }}
                      onMouseEnter={(e) => {
                        if (!taken && !loading) {
                          e.currentTarget.style.borderColor = 'var(--frigate-primary)';
                          e.currentTarget.style.backgroundColor = 'var(--frigate-bg-raised)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!taken && !loading && !isCurrent) {
                          e.currentTarget.style.borderColor = 'var(--frigate-border-base)';
                          e.currentTarget.style.backgroundColor = 'var(--frigate-bg-surface)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 'var(--frigate-font-small)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            marginBottom: '2px',
                          }}>
                            {info.abbr} - {info.name}
                          </div>
                          <div style={{
                            fontSize: 'var(--frigate-font-tiny)',
                            color: 'var(--frigate-text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {info.description}
                          </div>
                        </div>
                        <div>
                          {taken && !isCurrent && (
                            <Badge variant="danger">TAKEN</Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="success">ACTIVE</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Crew roster - technical display */}
        {crewAssignments.length > 0 && (
          <div>
            <div style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-tiny)',
              color: 'var(--frigate-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '8px',
              paddingBottom: '4px',
              borderBottom: '1px solid var(--frigate-border-base)',
            }}>
              ASSIGNED CREW ({crewAssignments.length}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {crewAssignments.map((assignment) => {
                const roleInfo = ROLE_INFO[assignment.role];
                const isCurrent = assignment.player_id === currentPlayerId;

                return (
                  <div
                    key={assignment.player_id}
                    style={{
                      padding: '8px 10px',
                      fontFamily: 'var(--frigate-font-mono)',
                      backgroundColor: isCurrent ? 'var(--frigate-primary-muted)' : 'var(--frigate-bg-raised)',
                      border: isCurrent ? '1px solid var(--frigate-primary)' : '1px solid var(--frigate-border-base)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--frigate-font-small)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--frigate-text-primary)',
                      }}>
                        {roleInfo.abbr}
                      </div>
                      <div style={{
                        fontSize: 'var(--frigate-font-tiny)',
                        color: 'var(--frigate-text-muted)',
                        fontFamily: 'var(--frigate-font-mono)',
                      }}>
                        ID: {assignment.player_id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {assignment.ready && (
                        <Badge variant="success">RDY</Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="primary">YOU</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Stack>
    </Panel>
  );
}
