import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { ShipClassBrowserHeader } from '../ShipClassBrowserHeader';

describe('ShipClassBrowserHeader', () => {
  it('renders title and buttons and calls onClose', () => {
    const onClose = vi.fn();
    const { getByText } = render(<ShipClassBrowserHeader selectedClassId={null} onClose={onClose} />);

    expect(getByText(/SHIP CLASS BROWSER/i)).toBeTruthy();
    const closeBtn = getByText(/\[CLOSE\]/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows select button when selectable', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    render(<ShipClassBrowserHeader selectedClassId={'abc'} onClose={onClose} onSelect={() => onSelect('abc')} />);

    const selectBtn = screen.getByText(/\[SELECT ABC\]/i);
    expect(selectBtn).toBeInTheDocument();
  });
});
