/**
 * ModalBuildConstraintsPanel - Build constraints panel for ship creation modal
 */
import React from 'react';
import { BuildConstraintsPanel } from '../shipclass';

export interface ModalBuildConstraintsPanelProps {
  maxWeight: number;
  maxModules: number;
  buildPoints: number;
}

export function ModalBuildConstraintsPanel({ maxWeight, maxModules, buildPoints }: ModalBuildConstraintsPanelProps) {
  return (
    <BuildConstraintsPanel
      maxWeight={maxWeight}
      maxModules={maxModules}
      buildPoints={buildPoints}
    />
  );
}
