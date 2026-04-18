/**
 * ModalShipClassDetailPanel - Ship class detail panel for ship creation modal
 */
import React from "react";
import { ShipClassDetailPanel, TechnicalSpecsGrid, ShipClassBonusList } from "../shipclass";
import { Stack } from "../layout";
import type { ShipClassDetails } from "../types/shipClass";

export interface ModalShipClassDetailPanelProps {
  shipClass: ShipClassDetails;
  factionId?: string;
}

export function ModalShipClassDetailPanel({
  shipClass,
  factionId,
}: ModalShipClassDetailPanelProps) {
  return (
    <Stack gap={4}>
      <ShipClassDetailPanel shipClass={shipClass} factionId={factionId} />
      <TechnicalSpecsGrid specs={shipClass.technical_specs} />
      <ShipClassBonusList
        bonuses={shipClass.bonuses}
        defaultExpandedCategories={["combat", "defense"]}
      />
    </Stack>
  );
}
