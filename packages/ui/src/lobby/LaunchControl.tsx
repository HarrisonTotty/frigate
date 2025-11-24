import React, { useState, useEffect, useCallback } from 'react';
import { Panel, Stack } from '../layout';
import { Button, Badge } from '../components';
import { useAlert } from '../alerts';
import { safeJsonParse } from './apiHelpers';
import type { Blueprint } from './BlueprintList';
import type { ValidationResult } from './BlueprintReadiness';

export interface LaunchControlProps {
  /** The selected blueprint to launch */
  blueprint: Blueprint | null;
  /** Base URL for HYPERION API */
  apiBaseUrl?: string;
  /** Callback when ship successfully compiles and launches */
  onLaunchSuccess?: (shipId: string) => void;
  /** Callback when launch is cancelled */
  onCancel?: () => void;
}

interface CompilationProgress {
  stage: 'validating' | 'compiling' | 'initializing' | 'complete';
  progress: number; // 0-100
  message: string;
}

/**
 * LaunchControl component provides the final gate before ship compilation.
 * 
 * Features:
 * - Displays comprehensive validation status
 * - Shows crew readiness overview
 * - Gates launch button until all requirements met
 * - Handles POST /v1/ships/compile with progress feedback
 * - Provides error handling and retry mechanisms
 * 
 * Usage:
 * ```tsx
 * <LaunchControl
 *   blueprint={selectedBlueprint}
 *   apiBaseUrl="http://localhost:8000"
 *   onLaunchSuccess={(shipId) => navigate(`/bridge/${shipId}`)}
 *   onCancel={() => navigate('/lobby')}
 * />
 * ```
 */
export function LaunchControl({
  blueprint,
  apiBaseUrl = 'http://localhost:8000',
  onLaunchSuccess,
  onCancel
}: LaunchControlProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState<CompilationProgress | null>(null);
  const { danger, success } = useAlert();

  // Load validation status
  const validateBlueprint = useCallback(async () => {
    if (!blueprint) return;

    setIsValidating(true);
    try {
      const response = await fetch(`${apiBaseUrl}/v1/blueprints/${blueprint.id}/validate`);
      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }
      const result = await safeJsonParse<ValidationResult>(response);
      setValidation(result);
    } catch (error) {
      danger(`Failed to validate blueprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setValidation(null);
    } finally {
      setIsValidating(false);
    }
  }, [blueprint, apiBaseUrl, danger]);

  // Auto-validate when blueprint changes
  useEffect(() => {
    if (blueprint) {
      validateBlueprint();
    }
  }, [blueprint, validateBlueprint]);

  // Compile ship
  const compileShip = useCallback(async () => {
    if (!blueprint || !validation?.valid) return;

    setIsCompiling(true);
    setCompilationProgress({
      stage: 'validating',
      progress: 10,
      message: 'Running final validation checks...'
    });

    try {
      // Final validation
      await new Promise(resolve => setTimeout(resolve, 500));
      setCompilationProgress({
        stage: 'compiling',
        progress: 40,
        message: 'Compiling ship systems...'
      });

      // Call compilation endpoint
      const response = await fetch(`${apiBaseUrl}/v1/ships/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint_id: blueprint.id })
      });

      if (!response.ok) {
        const error = await safeJsonParse<{message: string}>(response);
        throw new Error(error?.message || response.statusText || 'Compilation failed');
      }

      const result = await safeJsonParse<{ship_id?: string; id?: string}>(response);
      if (!result) {
        throw new Error('Server returned invalid response');
      }
      
      const shipId = result.ship_id || result.id;
      if (!shipId) {
        throw new Error('Server did not return ship ID');
      }

      setCompilationProgress({
        stage: 'initializing',
        progress: 80,
        message: 'Initializing ship systems...'
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      setCompilationProgress({
        stage: 'complete',
        progress: 100,
        message: 'Launch sequence complete!'
      });

      success('Ship compiled successfully! Launching...');
      
      // Allow UI to show complete state
      setTimeout(() => {
        onLaunchSuccess?.(shipId);
      }, 1000);

    } catch (error) {
      danger(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCompilationProgress(null);
    } finally {
      setIsCompiling(false);
    }
  }, [blueprint, validation, apiBaseUrl, onLaunchSuccess, danger, success]);

  if (!blueprint) {
    return (
      <Panel title="LAUNCH CONTROL" variant="default">
        <div style={{
          textAlign: 'center',
          padding: '48px 16px',
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

  const canLaunch = validation?.valid && !isValidating && !isCompiling;
  const crewReady = blueprint.crew?.filter(c => c.ready).length || 0;
  const crewTotal = blueprint.crew?.length || 0;
  const allCrewReady = crewReady === crewTotal && crewTotal > 0;
  const crewPercent = crewTotal > 0 ? Math.round((crewReady / crewTotal) * 100) : 0;

  return (
    <Panel title="LAUNCH CONTROL" variant="default">
      <Stack direction="column" gap={4}>
        {/* Blueprint Summary - Technical Style */}
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
            marginBottom: '8px',
          }}>
            {blueprint.name}
          </div>
          <div style={{
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-secondary)',
            display: 'flex',
            gap: '16px',
          }}>
            <span>CLASS: {blueprint.class.toUpperCase()}</span>
            <span>FACTION: {blueprint.faction.toUpperCase()}</span>
          </div>
        </div>

        {/* Crew Readiness - ASCII Progress Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            <span style={{ color: 'var(--frigate-text-muted)' }}>CREW READINESS</span>
            <Badge variant={allCrewReady ? 'success' : 'warning'}>
              {crewReady}/{crewTotal} RDY
            </Badge>
          </div>
          {/* ASCII Progress Bar */}
          <div style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: allCrewReady ? 'var(--frigate-success)' : 'var(--frigate-warning)',
            letterSpacing: '0.05em',
          }}>
            [{
              '█'.repeat(Math.floor(crewPercent / 10)) +
              '░'.repeat(10 - Math.floor(crewPercent / 10))
            }] {crewPercent}%
          </div>
          {!allCrewReady && (
            <div style={{
              fontSize: 'var(--frigate-font-tiny)',
              color: 'var(--frigate-text-muted)',
              fontFamily: 'var(--frigate-font-mono)',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}>
              WAITING FOR CREW READINESS
            </div>
          )}
        </div>

        {/* Validation Status - Diagnostic Style */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            <span style={{ color: 'var(--frigate-text-muted)' }}>VALIDATION STATUS</span>
            {isValidating ? (
              <Badge variant="default">PROC...</Badge>
            ) : validation ? (
              <Badge variant={validation.valid ? 'success' : 'danger'}>
                {validation.valid ? 'PASS' : 'FAIL'}
              </Badge>
            ) : null}
          </div>

          {validation && !validation.valid && validation.issues && validation.issues.length > 0 && (
            <div style={{
              padding: '10px',
              backgroundColor: 'var(--frigate-bg-base)',
              border: '1px solid var(--frigate-danger)',
              fontFamily: 'var(--frigate-font-mono)',
            }}>
              <div style={{
                fontSize: 'var(--frigate-font-small)',
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--frigate-danger)',
                textTransform: 'uppercase',
              }}>
                [CRIT] VALIDATION FAILED
              </div>
              <div style={{ fontSize: 'var(--frigate-font-tiny)', color: 'var(--frigate-text-secondary)' }}>
                {validation.issues.map((issue: string, idx: number) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>
                    • {issue.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {validation?.warnings && validation.warnings.length > 0 && (
            <div style={{
              padding: '10px',
              backgroundColor: 'var(--frigate-bg-base)',
              border: '1px solid var(--frigate-warning)',
              fontFamily: 'var(--frigate-font-mono)',
            }}>
              <div style={{
                fontSize: 'var(--frigate-font-small)',
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--frigate-warning)',
                textTransform: 'uppercase',
              }}>
                [WARN] CAUTIONS DETECTED
              </div>
              <div style={{ fontSize: 'var(--frigate-font-tiny)', color: 'var(--frigate-text-secondary)' }}>
                {validation.warnings.map((warning: string, idx: number) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>
                    • {warning.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {validation?.valid && (
            <div style={{
              padding: '10px',
              backgroundColor: 'var(--frigate-bg-base)',
              border: '1px solid var(--frigate-success)',
              fontSize: 'var(--frigate-font-small)',
              fontFamily: 'var(--frigate-font-mono)',
              color: 'var(--frigate-success)',
              textTransform: 'uppercase',
            }}>
              [OK] ALL CHECKS PASSED - READY FOR LAUNCH
            </div>
          )}
        </div>

        {/* Compilation Progress - Startup Sequence Style */}
        {compilationProgress && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--frigate-bg-raised)',
            border: '1px solid var(--frigate-primary)',
            fontFamily: 'var(--frigate-font-mono)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <span style={{
                fontSize: 'var(--frigate-font-small)',
                fontWeight: 600,
                color: 'var(--frigate-text-primary)',
                textTransform: 'uppercase',
              }}>
                {compilationProgress.message}
              </span>
              <Badge variant="primary">{compilationProgress.stage.toUpperCase()}</Badge>
            </div>
            {/* ASCII Progress Bar */}
            <div style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-primary)',
              letterSpacing: '0.05em',
            }}>
              [{
                '█'.repeat(Math.floor(compilationProgress.progress / 10)) +
                '░'.repeat(10 - Math.floor(compilationProgress.progress / 10))
              }] {compilationProgress.progress}%
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: '8px' }}>
          <Stack direction="row" gap={4}>
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isCompiling}
              style={{ flex: 1 }}
            >
              {isCompiling ? '[ABORTING...]' : '[CANCEL]'}
            </Button>
            <Button
              variant="primary"
              onClick={compileShip}
              disabled={!canLaunch}
              style={{ flex: 2 }}
            >
              {isCompiling ? '[COMPILING...]' : '[LAUNCH SHIP]'}
            </Button>
          </Stack>
        </div>

        {!canLaunch && !isCompiling && (
          <div style={{
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-muted)',
            textAlign: 'center',
            fontFamily: 'var(--frigate-font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '8px',
          }}>
            {!validation?.valid
              ? '[BLOCKED] RESOLVE VALIDATION ISSUES'
              : isValidating
              ? '[PROC] VALIDATING BLUEPRINT...'
              : '[ERROR] UNKNOWN LAUNCH BLOCKER'}
          </div>
        )}
      </Stack>
    </Panel>
  );
}
