/**
 * ModuleKindSelector - Phase 1.1
 * Modal for selecting module variant/kind during installation
 */

import React, { useState, useEffect } from "react";
import { Panel } from "../layout";
import { Button, Badge } from "../components";
import { LoadingText } from "../loading";

export interface ModuleVariant {
  id: string;
  name: string;
  description: string;
  cost: number;
  stats: Record<string, unknown>;
}

export interface ModuleKindSelectorProps {
  apiUrl: string;
  moduleId: string;
  moduleName: string;
  onSelect: (kindId: string) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * ModuleKindSelector - Displays available variants for a module type
 * and allows user to select one.
 */
export function ModuleKindSelector({
  apiUrl,
  moduleId,
  moduleName,
  onSelect,
  onCancel,
  className = "",
}: ModuleKindSelectorProps): React.ReactElement {
  const [variants, setVariants] = useState<ModuleVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/v1/modules/${moduleId}/variants`);
        if (!response.ok) {
          throw new Error(`Failed to fetch variants: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.variants) {
          setVariants(data.variants);
          // Auto-select first variant if only one option
          if (data.variants.length === 1) {
            setSelectedVariant(data.variants[0].id);
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Failed to fetch module variants:", err);
        setError(err instanceof Error ? err.message : "Failed to load variants");
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [apiUrl, moduleId]);

  const handleConfirm = () => {
    if (selectedVariant) {
      onSelect(selectedVariant);
    }
  };

  const formatStatValue = (value: unknown): string => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${className}`}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Panel className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">
              SELECT {moduleName.toUpperCase()} TYPE
            </h2>
            <p className="text-gray-400 text-sm">Choose a specific variant for this module</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingText message="LOADING VARIANTS" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button variant="secondary" onClick={onCancel}>
                  CLOSE
                </Button>
              </div>
            )}

            {!loading && !error && variants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No variants available for this module</p>
              </div>
            )}

            {!loading && !error && variants.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    data-selected={selectedVariant === variant.id ? "true" : undefined}
                    className={`
                    border rounded p-4 text-left transition-all
                    ${
                      selectedVariant === variant.id
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                    }
                  `}
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    {/* Variant Header */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-cyan-300">{variant.name}</h3>
                        <Badge variant={selectedVariant === variant.id ? "success" : "default"}>
                          {variant.cost} BP
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{variant.description}</p>
                    </div>

                    {/* Stats */}
                    {Object.keys(variant.stats).length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Specifications
                        </div>
                        {Object.entries(variant.stats).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-400 capitalize">{key}:</span>
                            <span className="text-cyan-300 font-mono">
                              {formatStatValue(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {selectedVariant === variant.id && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/30">
                        <span aria-hidden="true" className="text-xs text-cyan-400 font-semibold">
                          ✓
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-cyan-500/30 p-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={onCancel}>
              CANCEL
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!selectedVariant}>
              CONFIRM SELECTION
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
