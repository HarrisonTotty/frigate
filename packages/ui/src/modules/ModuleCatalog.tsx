import React, { useEffect, useState } from 'react';
import type { ModuleSlot, ModuleVariant } from '@frigate/api-client';
import { Button } from '../components';
import { Panel } from '../layout';
import { useCatalog } from '../hooks/useCatalog';
import { useUiBlueprint } from '../hooks/useUiBlueprint';
import { useAlert } from '../alerts';

export interface ModuleCatalogProps {
  isOpen: boolean;
  slotType?: ModuleSlot | null;
  variants?: readonly ModuleVariant[] | null;
  selectedVariantId?: string | null;
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
  selectedVariantId = null,
  onSelect,
  onClose,
  blueprintId,
  instanceId,
  apiBase = '',
  className = '',
}: ModuleCatalogProps) {
  const catalog = useCatalog(apiBase ?? '');
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [remoteVariants, setRemoteVariants] = useState<ModuleVariant[] | null>(variants ? Array.from(variants) : null);
  const uiBlueprint = useUiBlueprint({ apiBase: '', blueprintId: blueprintId ?? '' });

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const load = async () => {
      if (slotType) {
        // Only fetch if remoteVariants is null (not already set by props)
        if (!remoteVariants) {
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
        }
      } else {
        // ensure we have an array when no slotType provided
        if (!remoteVariants) setRemoteVariants(variants ? Array.from(variants) : []);
      }
    };
    void load();
    return () => { mounted = false; };
  // Intentionally depend on stable identifiers only to avoid re-running when props/arrays are recreated
  // remoteVariants is checked in effect body; catalog and alert are stable hooks
  }, [isOpen, slotType?.id]);

  if (!isOpen) return null;

  const catalogStyles: Record<string, React.CSSProperties> = {
    wrapper: {
      fontFamily: 'var(--frigate-font-mono)',
    },
    container: {
      display: 'flex',
      gap: 'var(--frigate-space-4)',
      height: '100%',
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
    <div className={className} style={catalogStyles.wrapper} role="dialog" aria-modal="true" aria-label="Module Catalog">
      <Panel title={`MODULE VARIANT CATALOG: ${slotType?.name ?? 'UNKNOWN'}`} variant="default">
        <div style={catalogStyles.container}>
          <div style={catalogStyles.leftColumn}>
            {remoteVariants && remoteVariants.length > 0 ? (
              remoteVariants.map((v) => (
                <div
                  key={v.id}
                  role="option"
                  aria-selected={selectedVariantId === v.id}
                  onClick={async () => {
                    try {
                      // If blueprint/instance provided, apply to store-backed blueprint
                      if (blueprintId && instanceId) {
                        await uiBlueprint.setVariant(instanceId, v.id);
                        alert.success('Variant Selected', 'Module variant updated');
                      }
                      await onSelect?.(v.id);
                    } catch (err) {
                      console.error('Failed to set variant:', err);
                      alert.danger('Failed to set variant');
                    }
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
                    <div style={catalogStyles.variantName}>{v.name}</div>
                    <div style={catalogStyles.variantDesc}>{v.desc || v.description || '—'}</div>
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
              ))
            ) : loading ? (
              <div style={catalogStyles.loadingState} aria-live="polite">
                ◆ LOADING VARIANTS...
              </div>
            ) : (
              <div style={catalogStyles.emptyState} role="status">
                NO VARIANTS AVAILABLE
              </div>
            )}
          </div>

          <div style={catalogStyles.rightColumn}>
            <div style={catalogStyles.detailsHeader}>SPECIFICATIONS</div>
            <div style={catalogStyles.detailsContent}>
              {selectedVariantId ? (
                remoteVariants?.find(v => v.id === selectedVariantId) ? (
                  <div style={{ color: 'var(--frigate-text-primary)', fontSize: 'var(--frigate-font-small)' }}>
                    <div style={{ marginBottom: 'var(--frigate-space-2)' }}>
                      <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-small)' }}>NAME</div>
                      <div style={{ fontWeight: 700 }}>{remoteVariants.find(v => v.id === selectedVariantId)?.name}</div>
                    </div>
                    <div style={{ marginBottom: 'var(--frigate-space-2)' }}>
                      <div style={{ color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-small)' }}>DESCRIPTION</div>
                      <div>{remoteVariants.find(v => v.id === selectedVariantId)?.description || remoteVariants.find(v => v.id === selectedVariantId)?.desc}</div>
                    </div>
                  </div>
                ) : null
              ) : (
                <div style={catalogStyles.emptyState}>
                  SELECT A VARIANT TO VIEW DETAILS
                </div>
              )}
            </div>
            <div style={catalogStyles.buttonGroup}>
              <Button variant="secondary" size="sm" onClick={onClose}>[CLOSE]</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedVariantId}
                onClick={async () => {
                  if (selectedVariantId) {
                    try {
                      if (blueprintId && instanceId) {
                        await uiBlueprint.setVariant(instanceId, selectedVariantId);
                        alert.success('Variant Selected', 'Module variant updated');
                      }
                      await onSelect?.(selectedVariantId);
                      onClose?.();
                    } catch (err) {
                      console.error('Failed to confirm variant:', err);
                      alert.danger('Failed to confirm variant');
                    }
                  }
                }}
                aria-label="Confirm variant selection"
              >
                [CONFIRM]
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default ModuleCatalog;
