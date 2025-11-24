import React from 'react';
import { LoadingText } from '../loading';
import { Stack } from '../layout';
import { ShipClassDetailPanel, TechnicalSpecsGrid, BuildConstraintsPanel, ShipClassBonusList } from '../shipclass';
import type { ShipClassDetails } from '../types/shipClass';

interface DetailsProps {
  details: ShipClassDetails | null;
  loading: boolean;
  factionId?: string;
}

export function ShipClassDetails({ details, loading, factionId }: DetailsProps) {
  if (loading) {
    return (
      <div style={{ padding: 'var(--frigate-space-8)' }}>
        <LoadingText message="LOADING DETAILS..." />
      </div>
    );
  }

  if (!details) {
    return (
      <div
        style={{
          padding: 'var(--frigate-space-8)',
          textAlign: 'center',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-muted)',
        }}
      >
        FAILED TO LOAD DETAILS
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--frigate-space-4)' }}>
      <Stack gap={4}>
        <ShipClassDetailPanel shipClass={details} factionId={factionId} />
        <TechnicalSpecsGrid specs={details.technical_specs} />
        <BuildConstraintsPanel
          maxWeight={details.max_weight}
          maxModules={details.max_modules}
          buildPoints={details.build_points}
        />
        <ShipClassBonusList bonuses={details.bonuses} defaultExpandedCategories={["combat", "defense"]} />
      </Stack>
    </div>
  );
}
