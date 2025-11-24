import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShipClassGrid } from '../ShipClassGrid';

// A minimal mock for ShipClassCard is not necessary because the real component
// is exported from the same folder; we only verify that items render via ids.

describe('ShipClassGrid', () => {
  it('shows loading state', () => {
    render(<ShipClassGrid classes={[]} isLoading={true} selectedClassId={null} onCardClick={() => {}} />);
    expect(screen.getByText(/LOADING SHIP CLASSES/i)).toBeTruthy();
  });

  it('shows empty state', () => {
    render(<ShipClassGrid classes={[]} isLoading={false} selectedClassId={null} onCardClick={() => {}} />);
    expect(screen.getByText(/NO SHIP CLASSES MATCH FILTERS/i)).toBeTruthy();
  });

  it('renders grid items', () => {
    const classes = [
      { id: 'a', name: 'A', description: '', size: 'Small', role: 'Combat', max_weight: 0, max_modules: 0, build_points: 0 },
      { id: 'b', name: 'B', description: '', size: 'Medium', role: 'Support', max_weight: 0, max_modules: 0, build_points: 0 },
    ];

    render(<ShipClassGrid classes={classes as any} isLoading={false} selectedClassId={null} onCardClick={() => {}} />);
    // ensure cards are present by their display names
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });
});
