import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleSlotCard } from '../ModuleSlotCard';
import type { ModuleSlot } from '@frigate/api-client';

const mockSlot: ModuleSlot = {
  id: 'aux-support-system',
  name: 'AUX SUPPORT',
  description: 'Auxiliary support system for ship operations.',
  base_cost: 5,
  max_slots: 2,
  required: true,
  groups: ['Essential', 'Support'],
  hasVariants: false,
  base_hp: 100,
  base_power_consumption: 10,
  base_heat_generation: 5,
  base_weight: 200,
};

describe('ModuleSlotCard', () => {
  it('renders slot info and buttons', () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText('AUX SUPPORT')).toBeInTheDocument();
    expect(screen.getByText('[ADD]')).toBeInTheDocument();
    expect(screen.getByText('[DETAILS]')).toBeInTheDocument();
  });

  it('shows details when expanded', () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={1}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={true}
      />
    );
    expect(screen.getByText(/DESC:/)).toBeInTheDocument();
    expect(screen.getByText(/BASE COST:/)).toBeInTheDocument();
    expect(screen.getByText(/MAX SLOTS:/)).toBeInTheDocument();
    expect(screen.getByText(/REQUIRED:/)).toBeInTheDocument();
  });

  it('disables add button if cannot add', () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={2}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText('[ADD]')).toBeDisabled();
  });
});
