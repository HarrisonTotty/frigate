import React, { useEffect, useState } from "react";
import type { ModuleSlot, ModuleVariant } from "@frigate/api-client";
import useUiBlueprint from "../hooks/useUiBlueprint";
import useCatalog from "../hooks/useCatalog";

export interface ModuleVariantSelectorProps {
  apiUrl: string;
  blueprintId: string;
  moduleInstanceId: string;
  moduleSlot: ModuleSlot;
  currentVariantId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVariantSelected?: (variantId?: string | null) => void;
  buildPointsUsed: number;
  maxBuildPoints: number;
}

export function ModuleVariantSelector({
  apiUrl,
  blueprintId,
  moduleInstanceId,
  moduleSlot,
  currentVariantId,
  isOpen,
  onClose,
  onVariantSelected,
  buildPointsUsed,
  maxBuildPoints,
}: ModuleVariantSelectorProps): React.ReactElement | null {
  const [variants, setVariants] = useState<ModuleVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(currentVariantId);

  const { getModuleVariants } = useCatalog(apiUrl);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const loadVariants = async () => {
      try {
        const list = await getModuleVariants(moduleSlot.id);
        setVariants(list || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load variants:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVariants();
  }, [getModuleVariants, moduleSlot.id, isOpen]);

  const getVariantTotalCost = (variant: ModuleVariant): number => {
    return moduleSlot.base_cost + variant.cost;
  };

  const canAffordVariant = (variant: ModuleVariant): boolean => {
    const totalCost = getVariantTotalCost(variant);
    const currentVariantCost = currentVariantId
      ? variants.find((v) => v.id === currentVariantId)?.cost || 0
      : 0;
    const adjustedUsed = buildPointsUsed - currentVariantCost;
    return totalCost <= maxBuildPoints - adjustedUsed;
  };

  const { setVariant } = useUiBlueprint({ blueprintId, apiBase: apiUrl });

  const handleSelectVariant = async (variantId: string) => {
    try {
      await setVariant(moduleInstanceId, variantId);
      onVariantSelected?.(variantId);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update variant:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 40,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#222",
        color: "#fff",
        border: "2px solid #666",
        padding: 16,
        fontFamily: "monospace",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>SELECT VARIANT: {moduleSlot.name}</div>
      <div style={{ marginBottom: 12 }}>
        {loading ? (
          <div>LOADING VARIANTS...</div>
        ) : variants.length === 0 ? (
          <div>No variants available for this module slot.</div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            {variants.map((variant) => {
              const isSelected = selectedVariant === variant.id;
              const isCurrent = currentVariantId === variant.id;
              const canAfford = canAffordVariant(variant);
              const totalCost = getVariantTotalCost(variant);
              return (
                <div
                  key={variant.id}
                  style={{
                    border: isSelected ? "2px solid #0a0" : "1px solid #666",
                    padding: 8,
                    background: isSelected ? "#333" : "#222",
                    cursor: "pointer",
                    minWidth: 220,
                  }}
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  <div style={{ fontWeight: "bold" }}>{variant.name}</div>
                  <div>{variant.model}</div>
                  <div>{variant.manufacturer}</div>
                  {isCurrent && <span style={{ color: "#0af" }}>[CURRENT]</span>}
                  <div>{variant.desc}</div>
                  <div style={{ marginTop: 8 }}>
                    <div>Slot Cost: {moduleSlot.base_cost} BP</div>
                    <div>Variant Cost: {variant.cost} BP</div>
                    <div>Total: {totalCost} BP</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div>Base HP: {moduleSlot.base_hp}</div>
                    <div>Base Power: {moduleSlot.base_power_consumption} MW</div>
                    <div>Base Heat: {moduleSlot.base_heat_generation} K</div>
                    <div>Base Weight: {moduleSlot.base_weight} kg</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div>+HP: {variant.additional_hp}</div>
                    <div>+Power: {variant.additional_power_consumption} MW</div>
                    <div>+Heat: {variant.additional_heat_generation} K</div>
                    <div>+Weight: {variant.additional_weight} kg</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div>Specifications:</div>
                    {variant.stats &&
                      Object.entries(variant.stats).map(([key, value]) => (
                        <div key={key}>
                          {key}: {JSON.stringify(value)}
                        </div>
                      ))}
                  </div>
                  {!canAfford && <div style={{ color: "#e22" }}>INSUFFICIENT BUILD POINTS</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            fontFamily: "monospace",
            padding: "2px 8px",
            background: "#444",
            color: "#fff",
            border: "1px solid #666",
          }}
          onClick={onClose}
        >
          [CANCEL]
        </button>
        <button
          style={{
            fontFamily: "monospace",
            padding: "2px 8px",
            background:
              selectedVariant && canAffordVariant(variants.find((v) => v.id === selectedVariant)!)
                ? "#0a0"
                : "#444",
            color: "#fff",
            border: "1px solid #666",
          }}
          onClick={() =>
            selectedVariant &&
            canAffordVariant(variants.find((v) => v.id === selectedVariant)!) &&
            handleSelectVariant(selectedVariant)
          }
          disabled={
            !selectedVariant || !canAffordVariant(variants.find((v) => v.id === selectedVariant)!)
          }
        >
          [SELECT VARIANT]
        </button>
      </div>
    </div>
  );
}
