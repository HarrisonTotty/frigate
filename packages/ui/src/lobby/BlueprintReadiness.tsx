/**
 * Blueprint readiness and validation component
 * 
 * Displays blueprint validation status and allows players to mark themselves ready.
 * Integrates with HYPERION API blueprint ready and validate endpoints.
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Panel, Stack } from '../layout';
import { Button, Badge } from '../components';
import { AlertBanner, useAlert } from '../alerts';
import { safeJsonParse } from './apiHelpers';
import type { Blueprint } from './BlueprintList';

/**
 * Validation result from API
 */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Readiness props
 */
export interface BlueprintReadinessProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Current player ID */
  currentPlayerId?: string;
  /** Current blueprint */
  blueprint?: Blueprint;
  /** Callback when readiness changes */
  onReadinessChanged?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Blueprint readiness and validation component
 */
export function BlueprintReadiness({
  apiUrl,
  currentPlayerId,
  blueprint,
  onReadinessChanged,
  className = '',
}: BlueprintReadinessProps) {
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const alert = useAlert();

  useEffect(() => {
    if (blueprint && currentPlayerId) {
      const playerCrew = blueprint.crew.find(c => c.player_id === currentPlayerId);
      setIsReady(playerCrew?.ready || false);
      validateBlueprint();
    }
  }, [blueprint?.id, currentPlayerId]);

  const validateBlueprint = async () => {
    if (!blueprint) return;

    try {
      const response = await fetch(`${apiUrl}/v1/blueprints/${blueprint.id}/validate`);
      if (!response.ok) {
        throw new Error(`Failed to validate: ${response.statusText}`);
      }
      const result = await safeJsonParse<ValidationResult>(response);
      setValidation(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidation(null);
    }
  };

  const toggleReady = async () => {
    if (!currentPlayerId || !blueprint) return;

    setLoading(true);
    try {
      if (isReady) {
        // Unmark ready
        const response = await fetch(
          `${apiUrl}/v1/blueprints/${blueprint.id}/ready/${currentPlayerId}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error(`Failed to unmark ready: ${response.statusText}`);
        }

        setIsReady(false);
        alert.info('Not Ready', 'You have unmarked yourself as ready');
      } else {
        // Mark ready
        const response = await fetch(`${apiUrl}/v1/blueprints/${blueprint.id}/ready`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: currentPlayerId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to mark ready: ${response.statusText}`);
        }

        setIsReady(true);
        alert.success('Ready!', 'You are now ready for launch');
      }

      if (onReadinessChanged) {
        onReadinessChanged();
      }
    } catch (error) {
      alert.danger('Ready Toggle Failed', `Could not update readiness: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!blueprint) {
    return (
      <Panel title="Readiness" className={className}>
        <div className="text-center py-8 text-text-muted">
          Select a blueprint to check readiness
        </div>
      </Panel>
    );
  }

  if (!currentPlayerId) {
    return (
      <Panel title="Readiness" className={className}>
        <div className="text-center py-8 text-text-muted">
          Select a player to mark ready
        </div>
      </Panel>
    );
  }

  const readyCount = blueprint.crew.filter(c => c.ready).length;
  const totalCrew = blueprint.crew.length;
  const allReady = totalCrew > 0 && readyCount === totalCrew;

  return (
    <Panel title="Launch Readiness" className={className}>
      <Stack direction="column" gap={4}>
        {/* Validation status */}
        {validation && (
          <div className="space-y-2">
            {/* Valid/Invalid status */}
            <div
              className={clsx(
                'p-3 rounded border-2',
                validation.valid
                  ? 'bg-success-900/20 border-success-500'
                  : 'bg-danger-900/20 border-danger-500'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{validation.valid ? '[OK]' : '[X]'}</span>
                <div className="flex-1">
                  <div className="font-bold">
                    {validation.valid ? 'Blueprint Valid' : 'Blueprint Invalid'}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {validation.valid
                      ? 'Ready for compilation'
                      : 'Issues must be resolved before launch'}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues */}
            {validation.issues.length > 0 && (
              <div className="space-y-2">
                {validation.issues.map((issue, i) => (
                  <AlertBanner
                    key={i}
                    severity="danger"
                    title="Issue"
                    message={issue}
                  />
                ))}
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="space-y-2">
                {validation.warnings.map((warning, i) => (
                  <AlertBanner
                    key={i}
                    severity="warning"
                    title="Warning"
                    message={warning}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Crew readiness */}
        <div className="p-3 bg-background-800 rounded border border-primary-700">
          <div className="text-sm text-text-muted mb-2">Crew Readiness</div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold">
              {readyCount} / {totalCrew} Ready
            </div>
            {allReady ? (
              <Badge variant="success">All Ready</Badge>
            ) : (
              <Badge variant="warning">Waiting</Badge>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-background-900 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full transition-all duration-300',
                allReady ? 'bg-success-500' : 'bg-primary-500'
              )}
              style={{ width: `${totalCrew > 0 ? (readyCount / totalCrew) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Ready toggle */}
        <Button
          onClick={toggleReady}
          variant={isReady ? 'secondary' : 'success'}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Updating...' : isReady ? 'Unmark Ready' : 'Mark Ready'}
        </Button>

        {/* Refresh validation */}
        <Button
          onClick={validateBlueprint}
          variant="ghost"
          size="sm"
          disabled={loading}
          fullWidth
        >
          Refresh Validation
        </Button>

        {/* Launch status */}
        {allReady && validation?.valid && (
          <div className="p-3 bg-success-900/20 border-2 border-success-500 rounded animate-pulse">
            <div className="text-center">
              <div className="font-bold text-success-400">Ready for Launch!</div>
              <div className="text-xs text-text-secondary mt-1">
                All crew members are ready and blueprint is valid
              </div>
            </div>
          </div>
        )}
      </Stack>
    </Panel>
  );
}
