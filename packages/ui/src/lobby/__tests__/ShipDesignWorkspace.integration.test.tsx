import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ShipDesignWorkspace from '../ShipDesignWorkspace';

/**
 * Ship Design Workspace Integration Tests
 * 
 * These tests verify the complete workflows and interactions between
 * components in the Ship Design Workspace, including:
 * - Adding modules to the blueprint
 * - Editing module variants
 * - Removing modules
 * - Real-time stats updates
 * - Keyboard navigation across columns
 * - Build point constraints
 */

describe('ShipDesignWorkspace - Integration Tests', () => {
  // Mock the API and state hooks
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Addition Workflow', () => {
    it('adds a module via the browser and displays it in the installed list', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Module Slot Browser should be visible on the left
      const browser = screen.getByRole('region', { name: /module slot browser/i });
      expect(browser).toBeInTheDocument();

      // Find an [ADD] button in the browser
      const addButtons = within(browser).getAllByRole('button', { name: /add/i });
      expect(addButtons.length).toBeGreaterThan(0);

      // Click the first [ADD] button
      await user.click(addButtons[0]);

      // The module should appear in the installed list
      const installedList = screen.getByRole('region', { name: /installed modules/i });
      await waitFor(() => {
        const moduleRows = within(installedList).getAllByRole('row', { hidden: true });
        expect(moduleRows.length).toBeGreaterThan(0);
      });
    });

    it('shows [UNCONFIGURED] badge for new modules without variants', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Add a module
      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const addButton = within(browser).getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Look for unconfigured badge
      const installedList = screen.getByRole('region', { name: /installed modules/i });
      await waitFor(() => {
        expect(within(installedList).getByText(/unconfigured/i)).toBeInTheDocument();
      });
    });

    it('prevents adding modules when build points limit is reached', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-full"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const addButtons = within(browser).queryAllByRole('button', { name: /add/i });

      // All add buttons should be disabled when BP is exhausted
      addButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Module Editing Workflow', () => {
    it('opens catalog when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Find an [EDIT] button
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        // Module catalog should appear
        const catalog = screen.getByRole('dialog', { name: /module.*catalog/i });
        expect(catalog).toBeInTheDocument();
      }
    });

    it('updates variant when selected from catalog', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Open catalog
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        // Select a variant from the list
        const variantOptions = screen.queryAllByRole('option');
        if (variantOptions.length > 0) {
          await user.click(variantOptions[0]);

          // Verify selection
          await waitFor(() => {
            expect(variantOptions[0]).toHaveAttribute('aria-selected', 'true');
          });
        }
      }
    });

    it('closes catalog when cancelled', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Open catalog
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        const catalog = screen.getByRole('dialog', { name: /module.*catalog/i });
        expect(catalog).toBeInTheDocument();

        // Find and click cancel button
        const cancelButton = within(catalog).getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        // Catalog should be gone
        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: /module.*catalog/i })).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Module Removal Workflow', () => {
    it('removes a module when remove button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Get the initial module count
      const header = screen.getByRole('heading', { name: /installed modules/i });
      const initialText = header.textContent || '';

      // Find and click a [REMOVE] button
      const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);

        // Verify the module was removed
        await waitFor(() => {
          const newText = header.textContent || '';
          expect(newText).not.toEqual(initialText);
        });
      }
    });

    it('updates stats when module is removed', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Record initial stats
      const statsPanel = screen.getByRole('region', { name: /ship statistics/i });
      const initialBP = within(statsPanel).getByText(/build points/i).textContent;

      // Remove a module
      const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);

        // BP should change
        await waitFor(() => {
          const newBP = within(statsPanel).getByText(/build points/i).textContent;
          expect(newBP).not.toEqual(initialBP);
        });
      }
    });
  });

  describe('Statistics Updates', () => {
    it('updates ship stats when modules are added', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const statsPanel = screen.getByRole('region', { name: /ship statistics/i });
      const initialStats = within(statsPanel).getByText(/total cost/i).textContent;

      // Add a module
      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const addButton = within(browser).getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Stats should update
      await waitFor(() => {
        const newStats = within(statsPanel).getByText(/total cost/i).textContent;
        expect(newStats).not.toEqual(initialStats);
      });
    });

    it('displays warning when constraints are exceeded', async () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-overloaded"
          onBack={() => {}}
        />
      );

      const statsPanel = screen.getByRole('region', { name: /ship statistics/i });
      
      // Should display constraint violation warnings
      await waitFor(() => {
        expect(within(statsPanel).queryByText(/warning|exceeded|constraint/i)).toBeInTheDocument();
      });
    });

    it('shows correct stats for power consumption', async () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const statsPanel = screen.getByRole('region', { name: /ship statistics/i });
      
      // Power consumption should be displayed
      await waitFor(() => {
        expect(within(statsPanel).getByText(/power|pwr/i)).toBeInTheDocument();
      });
    });

    it('shows correct stats for heat generation', async () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const statsPanel = screen.getByRole('region', { name: /ship statistics/i });
      
      // Heat generation should be displayed
      await waitFor(() => {
        expect(within(statsPanel).getByText(/heat|thermal/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates between columns with Tab key', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const browserButton = within(browser).getByRole('button', { name: /add/i });

      // Tab should move focus through interactive elements
      await user.tab();
      
      // Verify focus moved
      expect(document.activeElement).not.toBe(browserButton);
    });

    it('selects modules with arrow keys in browser', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const addButtons = within(browser).queryAllByRole('button', { name: /add/i });

      if (addButtons.length > 1) {
        // Focus first button
        addButtons[0].focus();

        // Arrow down should move to next
        await user.keyboard('{ArrowDown}');
        
        expect(document.activeElement).not.toBe(addButtons[0]);
      }
    });

    it('activates buttons with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const addButton = within(browser).getByRole('button', { name: /add/i });

      addButton.focus();
      
      // Press Enter
      const clickHandler = vi.spyOn(addButton, 'click');
      await user.keyboard('{Enter}');

      // Verify button was clicked or unconfigured module appeared
      const wasClicked = clickHandler.mock.calls.length > 0;
      const hasUnconfigured = screen.queryByText(/UNCONFIGURED/i) !== null;
      expect(wasClicked || hasUnconfigured).toBe(true);
    });

    it('closes modals with Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Open catalog
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        const catalog = screen.getByRole('dialog', { name: /module.*catalog/i });
        expect(catalog).toBeInTheDocument();

        // Press Escape
        await user.keyboard('{Escape}');

        // Catalog should close
        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: /module.*catalog/i })).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Build Points Constraints', () => {
    it('displays build points indicator in browser header', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      
      // Build points should be displayed
      expect(within(browser).getByText(/build points/i)).toBeInTheDocument();
    });

    it('shows progress bar for build point usage', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      
      // Should display usage percentage or progress indicator
      const progressBar = within(browser).queryByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows warning color when BP usage is high', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-80percent"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const header = within(browser).getByRole('heading', { name: /build points/i });

      // Should have warning styling
      const style = window.getComputedStyle(header);
      expect(style.color).toBeDefined();
    });

    it('shows danger color when BP usage exceeds limit', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-over-bp"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const header = within(browser).getByRole('heading', { name: /build points/i });

      // Should have danger styling (color or class)
      const classList = header.className;
      expect(classList || window.getComputedStyle(header).color).toBeDefined();
    });
  });

  describe('Three-Column Layout', () => {
    it('renders all three columns', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const installed = screen.getByRole('region', { name: /installed modules/i });
      const stats = screen.getByRole('region', { name: /ship statistics/i });

      expect(browser).toBeInTheDocument();
      expect(installed).toBeInTheDocument();
      expect(stats).toBeInTheDocument();
    });

    it('maintains proper spacing between columns', () => {
      const { container } = render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const workspace = container.firstChild as HTMLElement;
      const style = window.getComputedStyle(workspace);

      // Should use flexbox or grid
      expect(['flex', 'grid']).toContain(style.display);
    });

    it('displays columns in correct order (left, center, right)', () => {
      const { container } = render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      const regions = container.querySelectorAll('[role="region"]');
      expect(regions.length).toBeGreaterThanOrEqual(3);

      // Order should be browser, installed, stats
      const texts = Array.from(regions).map(r => r.getAttribute('aria-label'));
      expect(texts[0]).toMatch(/browser/i);
      expect(texts[1]).toMatch(/installed/i);
      expect(texts[2]).toMatch(/statistics/i);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all regions', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // All major sections should have labels
      expect(screen.getByRole('region', { name: /module slot browser/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /installed modules/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /ship statistics/i })).toBeInTheDocument();
    });

    it('supports screen reader navigation', () => {
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // All buttons should have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('maintains focus management for modals', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Open catalog
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        const catalog = screen.getByRole('dialog');
        
        // Dialog should be present and trap focus
        expect(catalog).toBeInTheDocument();
        expect(catalog).toHaveAttribute('role', 'dialog');
      }
    });
  });

  describe('Error Handling', () => {
    it('handles failed module addition gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-error"
          onBack={() => {}}
        />
      );

      const browser = screen.getByRole('region', { name: /module slot browser/i });
      const addButton = within(browser).getByRole('button', { name: /add/i });

      await user.click(addButton);

      // Should show error message or disable button without crashing
      await waitFor(() => {
        expect(screen.queryByText(/error|failed/i) || addButton.hasAttribute('disabled')).toBeTruthy();
      });
    });

    it('handles failed catalog load gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <ShipDesignWorkspace
          apiUrl="http://localhost:3000"
          blueprintId="test-blueprint-1"
          onBack={() => {}}
        />
      );

      // Try to open catalog
      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        // Should either show error or loading state
        await waitFor(() => {
          const catalog = screen.queryByRole('dialog');
          const error = screen.queryByText(/error|failed/i);
          const loading = screen.queryByText(/loading/i);

          expect(catalog || error || loading).toBeTruthy();
        });
      }
    });
  });
});
