import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { ModuleSlot, ModuleVariant } from '@frigate/api-client';
import { Button } from '../components';
import { useCatalog } from '../hooks/useCatalog';
import { useAlert } from '../alerts';

/**
 * Custom hook for focus trap within a container element.
 * Keeps focus within the modal and handles Escape key to close.
 */
function useFocusTrap(isOpen: boolean, onClose?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus first focusable element when modal opens, restore focus on close
  useEffect(() => {
    if (!isOpen) {
      // Restore focus to previous element when closed
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      return;
    }

    // Focus first focusable element in the container
    const container = containerRef.current;
    if (!container) return;

    // Small delay to ensure DOM is ready
    const focusTimeout = setTimeout(() => {
      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 10);

    return () => clearTimeout(focusTimeout);
  }, [isOpen]);

  // Handle keyboard events for focus trap and Escape key
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) return;

    // Close on Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
      return;
    }

    // Focus trap on Tab
    if (event.key === 'Tab') {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, onClose]);

  return { containerRef, handleKeyDown };
}

export interface ModuleCatalogProps {
  isOpen: boolean;
  slotType?: ModuleSlot | null;
  variants?: readonly ModuleVariant[] | null;
  selectedVariantId?: string | null;
  /** Currently confirmed variant ID (for cost delta comparison) */
  currentVariantId?: string | null;
  onSelect?: (variantId: string) => void;
  apiBase?: string;
  /** Optional: blueprint context to apply variant directly into a blueprint instance */
  blueprintId?: string;
  instanceId?: string;
  onClose?: () => void;
  buildPointsUsed?: number;
  maxBuildPoints?: number;
  className?: string;
}

export function ModuleCatalog({
  isOpen,
  slotType,
  variants = null,
  selectedVariantId: controlledSelectedVariantId = null,
  currentVariantId = null,
  onSelect,
  onClose,
  blueprintId: _blueprintId,
  instanceId: _instanceId,
  apiBase = '',
  buildPointsUsed = 0,
  maxBuildPoints = 100,
  className = '',
}: ModuleCatalogProps) {
  // Note: blueprintId and instanceId props are kept for API compatibility but
  // persistence is now handled by the parent component via onSelect callback
  const catalog = useCatalog(apiBase ?? '');
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [remoteVariants, setRemoteVariants] = useState<ModuleVariant[] | null>(variants ? Array.from(variants) : null);

  // Internal selection state - used when parent doesn't control selection
  const [internalSelectedVariantId, setInternalSelectedVariantId] = useState<string | null>(null);
  // Use controlled value if provided, otherwise use internal state
  const selectedVariantId = controlledSelectedVariantId ?? internalSelectedVariantId;

  // Focus trap for accessibility - keeps focus within modal and handles Escape
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen, onClose);

  // Reset state when slot type changes or modal closes
  useEffect(() => {
    setRemoteVariants(null);
    setLoading(false);
    setInternalSelectedVariantId(null);
  }, [slotType?.id]);

  // Reset internal selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setInternalSelectedVariantId(null);
    }
  }, [isOpen]);

  // Fetch variants when catalog opens
  useEffect(() => {
    if (!isOpen || !slotType) return;

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const v = await catalog.getModuleVariants(slotType.id);
        if (!mounted) return;
        setRemoteVariants(v && v.length ? v : []);
      } catch (err) {
        console.error('Failed to load variants:', err);
        alert.danger('Failed to load variants');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, slotType?.id]);

  if (!isOpen) return null;

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const catalogStyles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'var(--frigate-bg-primary)',
      border: '2px solid var(--frigate-primary)',
      borderRadius: 0,
      width: '80%',
      maxWidth: '1000px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--frigate-font-mono)',
      boxShadow: 'none',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--frigate-space-3)',
      borderBottom: '1px solid var(--frigate-border-base)',
      backgroundColor: 'var(--frigate-bg-surface)',
    },
    title: {
      margin: 0,
      fontSize: 'var(--frigate-font-heading)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--frigate-text-primary)',
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      color: 'var(--frigate-text-secondary)',
      fontSize: 'var(--frigate-font-body)',
      cursor: 'pointer',
      padding: 'var(--frigate-space-1)',
      fontFamily: 'var(--frigate-font-mono)',
      fontWeight: 700,
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      padding: 'var(--frigate-space-3)',
    },
    container: {
      display: 'flex',
      gap: 'var(--frigate-space-4)',
      flex: 1,
      minHeight: 0,
    },
    leftColumn: {
      flex: 1,
      maxHeight: 'calc(100vh - 200px)',
      overflow: 'auto',
      borderRight: '1px dashed var(--frigate-border-base)',
      paddingRight: 'var(--frigate-space-3)',
    },
    variantItem: {
      padding: 'var(--frigate-space-2) 0',
      borderBottom: '1px solid var(--frigate-border-base)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 'var(--frigate-space-3)',
      cursor: 'pointer',
      transition: 'background-color 150ms ease-in-out',
    },
    variantItemHover: {
      backgroundColor: 'var(--frigate-bg-hover)',
    },
    variantInfo: {
      flex: 1,
    },
    variantName: {
      fontWeight: 700,
      fontSize: 'var(--frigate-font-body)',
      color: 'var(--frigate-text-primary)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: 'var(--frigate-space-1)',
    },
    variantDesc: {
      fontSize: 'var(--frigate-font-small)',
      color: 'var(--frigate-text-secondary)',
      lineHeight: 1.4,
    },
    rightColumn: {
      width: '320px',
      paddingLeft: 'var(--frigate-space-3)',
      borderLeft: '1px dashed var(--frigate-border-base)',
      display: 'flex',
      flexDirection: 'column',
    },
    detailsHeader: {
      fontWeight: 700,
      fontSize: 'var(--frigate-font-heading)',
      color: 'var(--frigate-text-primary)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: 'var(--frigate-space-3)',
      borderBottom: '1px solid var(--frigate-border-base)',
      paddingBottom: 'var(--frigate-space-2)',
    },
    detailsContent: {
      flex: 1,
      overflow: 'auto',
      marginBottom: 'var(--frigate-space-3)',
      minHeight: 0,
    },
    emptyState: {
      color: 'var(--frigate-text-muted)',
      textAlign: 'center',
      padding: 'var(--frigate-space-4)',
      fontSize: 'var(--frigate-font-small)',
    },
    loadingState: {
      color: 'var(--frigate-text-secondary)',
      padding: 'var(--frigate-space-3)',
      fontSize: 'var(--frigate-font-small)',
    },
    buttonGroup: {
      display: 'flex',
      gap: 'var(--frigate-space-2)',
      justifyContent: 'flex-end',
      marginTop: 'auto',
    },
  };

  return (
    <div
      style={catalogStyles.overlay}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        className={className}
        style={catalogStyles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="module-catalog-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div style={catalogStyles.header}>
          <h2 id="module-catalog-title" style={catalogStyles.title}>
            MODULE CATALOG: {slotType?.name ?? 'UNKNOWN'}
          </h2>
          <button
            onClick={onClose}
            style={catalogStyles.closeButton}
            aria-label="Close module catalog"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div style={catalogStyles.content}>
          <div style={catalogStyles.container}>
            <div style={catalogStyles.leftColumn}>
            {remoteVariants && remoteVariants.length > 0 ? (
              remoteVariants.map((v) => {
                // Calculate if this variant would exceed the budget
                // Total cost = slot base cost + variant cost
                const variantCost = (slotType?.base_cost ?? 0) + (v.cost ?? 0);
                const wouldExceedBudget = buildPointsUsed + variantCost > maxBuildPoints;

                return (
                <div
                  key={v.id}
                  role="option"
                  aria-selected={selectedVariantId === v.id}
                  onClick={() => {
                    // Update local selection state - variant is persisted on [CONFIRM]
                    setInternalSelectedVariantId(v.id);
                  }}
                  style={{
                    ...catalogStyles.variantItem,
                    ...(selectedVariantId === v.id && { backgroundColor: 'var(--frigate-bg-selected)' }),
                  }}
                  onMouseEnter={(e) => {
                    if (selectedVariantId !== v.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--frigate-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVariantId !== v.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).click();
                    }
                  }}
                >
                  <div style={catalogStyles.variantInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)' }}>
                      <span style={catalogStyles.variantName}>{v.name}</span>
                      {wouldExceedBudget && (
                        <span style={{
                          color: 'var(--frigate-warning)',
                          fontSize: 'var(--frigate-font-tiny)',
                          fontWeight: 700,
                        }}>
                          [OVER BUDGET]
                        </span>
                      )}
                    </div>
                    <div style={catalogStyles.variantDesc}>{v.desc || v.description || '—'}</div>
                    <div style={{
                      fontSize: 'var(--frigate-font-tiny)',
                      color: wouldExceedBudget ? 'var(--frigate-warning)' : 'var(--frigate-text-muted)',
                      marginTop: 'var(--frigate-space-1)',
                    }}>
                      COST: {variantCost} BP
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedVariantId === v.id ? 'primary' : 'secondary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      const optionElement = (e.currentTarget as HTMLElement).closest('[role="option"]') as HTMLElement;
                      if (optionElement) {
                        optionElement.click();
                      }
                    }}
                    aria-label={`Select ${v.name}`}
                  >
                    {selectedVariantId === v.id ? '[SEL]' : '[+]'}
                  </Button>
                </div>
                );
              })
            ) : loading ? (
              <div style={catalogStyles.loadingState} aria-live="polite">
                [LOADING...]
              </div>
            ) : (
              <div style={{ ...catalogStyles.emptyState, padding: 'var(--frigate-space-6)' }} role="status">
                <div style={{
                  marginBottom: 'var(--frigate-space-3)',
                  fontSize: 'var(--frigate-font-body)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--frigate-text-secondary)',
                }}>
                  [NO VARIANTS]
                </div>
                <div style={{ lineHeight: 1.4, marginBottom: 'var(--frigate-space-3)' }}>
                  This module slot does not have selectable variants.
                </div>
                <div style={{
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-muted)',
                  padding: 'var(--frigate-space-2)',
                  backgroundColor: 'var(--frigate-bg-surface)',
                  border: '1px dashed var(--frigate-border-base)',
                }}>
                  The base module will be used automatically.
                </div>
              </div>
            )}
          </div>

          <div style={catalogStyles.rightColumn}>
            <div style={catalogStyles.detailsHeader}>SPECIFICATIONS</div>
            <div style={catalogStyles.detailsContent}>
              {selectedVariantId ? (
                (() => {
                  const selectedVariant = remoteVariants?.find(v => v.id === selectedVariantId);
                  const currentVariant = currentVariantId ? remoteVariants?.find(v => v.id === currentVariantId) : null;
                  if (!selectedVariant) return null;

                  // Calculate cost delta from current variant
                  const selectedCost = (slotType?.base_cost ?? 0) + (selectedVariant.cost ?? 0);
                  const currentCost = currentVariant ? (slotType?.base_cost ?? 0) + (currentVariant.cost ?? 0) : 0;
                  const costDelta = currentVariant ? selectedCost - currentCost : null;

                  // Type assertion for extended variant properties
                  const v = selectedVariant as ModuleVariant & {
                    lore?: string;
                    model?: string;
                    manufacturer?: string;
                    additional_hp?: number;
                    additional_power_consumption?: number;
                    additional_heat_generation?: number;
                    additional_weight?: number;
                  };

                  return (
                    <div style={{ color: 'var(--frigate-text-primary)', fontSize: 'var(--frigate-font-small)' }}>
                      {/* Header: Name and Model */}
                      <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--frigate-font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {v.name}
                        </div>
                        {v.model && (
                          <div style={{ color: 'var(--frigate-text-muted)', fontSize: 'var(--frigate-font-tiny)', marginTop: '2px' }}>
                            MODEL: {v.model}
                          </div>
                        )}
                        {v.manufacturer && (
                          <div style={{ color: 'var(--frigate-text-muted)', fontSize: 'var(--frigate-font-tiny)' }}>
                            MFR: {v.manufacturer}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
                        <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)', textTransform: 'uppercase', marginBottom: '4px' }}>DESCRIPTION</div>
                        <div style={{ lineHeight: 1.4 }}>{v.description || v.desc || '—'}</div>
                      </div>

                      {/* Lore/Flavor Text */}
                      {v.lore && (
                        <div style={{ marginBottom: 'var(--frigate-space-3)', padding: 'var(--frigate-space-2)', backgroundColor: 'var(--frigate-bg-surface)', border: '1px dashed var(--frigate-border-base)' }}>
                          <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)', textTransform: 'uppercase', marginBottom: '4px' }}>LORE</div>
                          <div style={{ fontStyle: 'italic', color: 'var(--frigate-text-secondary)', lineHeight: 1.4, fontSize: 'var(--frigate-font-tiny)' }}>{v.lore}</div>
                        </div>
                      )}

                      {/* Cost with Delta */}
                      <div style={{ marginBottom: 'var(--frigate-space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)', textTransform: 'uppercase' }}>COST</div>
                          <div style={{ fontWeight: 700 }}>{selectedCost} BP</div>
                        </div>
                        {costDelta !== null && costDelta !== 0 && (
                          <div style={{
                            color: costDelta > 0 ? 'var(--frigate-warning)' : 'var(--frigate-success)',
                            fontWeight: 700,
                            fontSize: 'var(--frigate-font-small)',
                          }}>
                            {costDelta > 0 ? '+' : ''}{costDelta} BP
                          </div>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--frigate-space-2)', marginBottom: 'var(--frigate-space-2)' }}>
                        {typeof v.additional_hp === 'number' && v.additional_hp !== 0 && (
                          <div>
                            <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)' }}>HP</div>
                            <div style={{ fontWeight: 600 }}>{v.additional_hp > 0 ? '+' : ''}{v.additional_hp}</div>
                          </div>
                        )}
                        {typeof v.additional_weight === 'number' && v.additional_weight !== 0 && (
                          <div>
                            <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)' }}>WEIGHT</div>
                            <div style={{ fontWeight: 600 }}>{v.additional_weight > 0 ? '+' : ''}{v.additional_weight} kg</div>
                          </div>
                        )}
                        {typeof v.additional_power_consumption === 'number' && v.additional_power_consumption !== 0 && (
                          <div>
                            <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)' }}>POWER</div>
                            <div style={{ fontWeight: 600 }}>{v.additional_power_consumption > 0 ? '+' : ''}{v.additional_power_consumption} MW</div>
                          </div>
                        )}
                        {typeof v.additional_heat_generation === 'number' && v.additional_heat_generation !== 0 && (
                          <div>
                            <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)' }}>HEAT</div>
                            <div style={{ fontWeight: 600 }}>{v.additional_heat_generation > 0 ? '+' : ''}{v.additional_heat_generation} K</div>
                          </div>
                        )}
                      </div>

                      {/* Type-specific parameters */}
                      {(() => {
                        // Common properties to exclude from module-specific display
                        const commonProps = new Set([
                          'id', 'type', 'name', 'model', 'manufacturer', 'desc', 'description', 'lore',
                          'cost', 'additional_hp', 'additional_power_consumption', 'additional_heat_generation',
                          'additional_weight', 'stats'
                        ]);

                        // Get all module-specific properties
                        const variantAny = v as unknown as Record<string, unknown>;
                        const moduleParams = Object.entries(variantAny)
                          .filter(([key, value]) => !commonProps.has(key) && value !== undefined && value !== null)
                          .map(([key, value]) => ({ key, value }));

                        if (moduleParams.length === 0) return null;

                        // Format value for display
                        const formatValue = (key: string, value: unknown): string => {
                          if (typeof value === 'number') {
                            // Format percentages
                            if (key.includes('accuracy') || key.includes('efficiency')) {
                              return `${(value * 100).toFixed(0)}%`;
                            }
                            // Format large numbers
                            if (value >= 1000000) {
                              return `${(value / 1000000).toFixed(1)}M`;
                            }
                            if (value >= 1000) {
                              return value.toLocaleString();
                            }
                            // Format decimals
                            if (!Number.isInteger(value)) {
                              return value.toFixed(2);
                            }
                            return String(value);
                          }
                          if (Array.isArray(value)) {
                            return value.join(', ');
                          }
                          return String(value);
                        };

                        // Format key for display (snake_case to Title Case)
                        const formatKey = (key: string): string => {
                          return key.replace(/_/g, ' ').toUpperCase();
                        };

                        // Get unit for known parameter types
                        const getUnit = (key: string): string => {
                          if (key.includes('range') || key.includes('distance')) return ' m';
                          if (key.includes('speed') && !key.includes('projectile')) return ' m/s';
                          if (key.includes('time') || key.includes('reload') || key.includes('recharge')) return ' s';
                          if (key.includes('weight') || key.includes('mass')) return ' kg';
                          if (key.includes('power')) return ' MW';
                          if (key.includes('heat') || key.includes('cooling')) return ' K';
                          if (key.includes('size') && key.includes('ammo')) return ' mm';
                          return '';
                        };

                        return (
                          <div style={{ marginTop: 'var(--frigate-space-2)', paddingTop: 'var(--frigate-space-2)', borderTop: '1px dashed var(--frigate-border-base)' }}>
                            <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-tiny)', textTransform: 'uppercase', marginBottom: '4px' }}>
                              MODULE PARAMETERS
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px' }}>
                              {moduleParams.map(({ key, value }) => (
                                <div key={key} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: 'var(--frigate-font-tiny)',
                                  padding: '2px 0',
                                }}>
                                  <span style={{ color: 'var(--frigate-text-muted)' }}>
                                    {formatKey(key)}
                                  </span>
                                  <span style={{ fontWeight: 600, color: 'var(--frigate-text-primary)' }}>
                                    {formatValue(key, value)}{getUnit(key)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()
              ) : (
                <div style={catalogStyles.emptyState}>
                  <div style={{ marginBottom: 'var(--frigate-space-2)', fontSize: 'var(--frigate-font-body)', fontWeight: 700, textTransform: 'uppercase' }}>
                    [NO SELECTION]
                  </div>
                  <div style={{ color: 'var(--frigate-text-muted)', lineHeight: 1.4 }}>
                    Select a variant from the list to view detailed specifications, stats, and lore.
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Hints */}
            <div style={{
              fontSize: 'var(--frigate-font-tiny)',
              color: 'var(--frigate-text-muted)',
              padding: 'var(--frigate-space-1) 0',
              borderTop: '1px dashed var(--frigate-border-base)',
              marginBottom: 'var(--frigate-space-2)',
              letterSpacing: '0.05em',
            }}>
              [ESC] CLOSE  [ENTER] SELECT  [TAB] NAV
            </div>

            <div style={catalogStyles.buttonGroup}>
              <Button variant="secondary" size="sm" onClick={onClose}>[CLOSE]</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedVariantId}
                onClick={() => {
                  if (selectedVariantId) {
                    // Call onSelect with the selected variant - parent handles persistence
                    onSelect?.(selectedVariantId);
                    // Note: parent's onSelect handler should close the modal via onClose
                  }
                }}
                aria-label="Confirm variant selection"
              >
                [CONFIRM]
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ModuleCatalog;
