/**
 * ModalBuildConstraintsPanel - Build constraints panel for ship creation modal
 */
import React from 'react';
import { BuildConstraintsPanel } from '../shipclass';

export interface ModalBuildConstraintsPanelProps {
  maxWeight: number;
  maxModules: number;
  buildPoints: number;
  /** Ship class credit cost */
  shipClassCost?: number;
  /** Team's current credit balance */
  teamCredits?: number;
}

export function ModalBuildConstraintsPanel({
  maxWeight,
  maxModules,
  buildPoints,
  shipClassCost,
  teamCredits,
}: ModalBuildConstraintsPanelProps) {
  return (
    <BuildConstraintsPanel
      maxWeight={maxWeight}
      maxModules={maxModules}
      buildPoints={buildPoints}
      shipClassCost={shipClassCost}
      teamCredits={teamCredits}
    />
  );
}
