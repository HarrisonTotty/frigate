import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

describe('Select', () => {
  const defaultOptions = (
    <>
      <option value="">SELECT OPTION</option>
      <option value="1">OPTION ONE</option>
      <option value="2">OPTION TWO</option>
      <option value="3">OPTION THREE</option>
    </>
  );

  describe('rendering', () => {
    it('renders the component', () => {
      render(<Select>{defaultOptions}</Select>);
      expect(screen.getByRole('combobox')).toBeDefined();
    });

    it('displays the selected option label', () => {
      render(<Select value="2">{defaultOptions}</Select>);
      expect(screen.getByText('OPTION TWO')).toBeDefined();
    });

    it('displays first option when no value is provided', () => {
      render(<Select>{defaultOptions}</Select>);
      expect(screen.getByText('SELECT OPTION')).toBeDefined();
    });

    it('renders dropdown indicator text [v]', () => {
      render(<Select>{defaultOptions}</Select>);
      expect(screen.getByText('[v]')).toBeDefined();
    });

    it('applies custom id', () => {
      render(<Select id="my-select">{defaultOptions}</Select>);
      expect(screen.getByRole('combobox').id).toBe('my-select');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Select className="custom-select">{defaultOptions}</Select>
      );
      expect(container.querySelector('.custom-select')).not.toBeNull();
    });
  });

  describe('dropdown behavior', () => {
    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      expect(screen.getByRole('listbox')).toBeDefined();
      expect(screen.getByText('[^]')).toBeDefined(); // indicator changes
    });

    it('shows all options when dropdown is open', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      const listbox = screen.getByRole('listbox');
      expect(listbox.querySelectorAll('[role="option"]').length).toBe(4);
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Select value="">{defaultOptions}</Select>
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeDefined();

      await user.click(screen.getByText('Outside'));
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('closes dropdown when option is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="" onChange={onChange}>
          {defaultOptions}
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('OPTION ONE'));

      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="" onChange={onChange}>
          {defaultOptions}
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('OPTION TWO'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '2' },
          currentTarget: { value: '2' },
        })
      );
    });

    it('highlights selected option in dropdown', async () => {
      const user = userEvent.setup();
      render(<Select value="2">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      const selectedOption = screen.getByRole('option', { selected: true });
      expect(selectedOption.textContent).toBe('OPTION TWO');
    });
  });

  describe('keyboard navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('opens dropdown with Space key', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('opens dropdown with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      expect(screen.getByRole('listbox')).toBeDefined();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('navigates options with ArrowDown', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="" onChange={onChange}>
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{ArrowDown}'); // open
      await user.keyboard('{ArrowDown}'); // move to first option
      await user.keyboard('{Enter}'); // select

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '1' },
        })
      );
    });

    it('navigates options with ArrowUp', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="3" onChange={onChange}>
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{ArrowDown}'); // open (highlights current)
      await user.keyboard('{ArrowUp}'); // move up
      await user.keyboard('{Enter}'); // select

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '2' },
        })
      );
    });

    it('navigates to first option with Home key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="3" onChange={onChange}>
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{ArrowDown}'); // open
      await user.keyboard('{Home}'); // go to first
      await user.keyboard('{Enter}'); // select

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '' },
        })
      );
    });

    it('navigates to last option with End key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="" onChange={onChange}>
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{ArrowDown}'); // open
      await user.keyboard('{End}'); // go to last
      await user.keyboard('{Enter}'); // select

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '3' },
        })
      );
    });
  });

  describe('disabled state', () => {
    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select disabled value="">
          {defaultOptions}
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('applies disabled styling', () => {
      render(
        <Select disabled value="">
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.opacity).toBe('0.5');
      expect(combobox.style.cursor).toBe('not-allowed');
    });

    it('has tabIndex -1 when disabled', () => {
      render(
        <Select disabled value="">
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox.tabIndex).toBe(-1);
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select disabled value="">
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      fireEvent.keyDown(combobox, { key: 'Enter' });
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('disabled options', () => {
    const optionsWithDisabled = (
      <>
        <option value="">SELECT OPTION</option>
        <option value="1">OPTION ONE</option>
        <option value="2" disabled>
          OPTION TWO (DISABLED)
        </option>
        <option value="3">OPTION THREE</option>
      </>
    );

    it('renders disabled option with aria-disabled', async () => {
      const user = userEvent.setup();
      render(<Select value="">{optionsWithDisabled}</Select>);

      await user.click(screen.getByRole('combobox'));

      const disabledOption = screen.getByText('OPTION TWO (DISABLED)');
      expect(disabledOption.getAttribute('aria-disabled')).toBe('true');
    });

    it('does not select disabled option on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="" onChange={onChange}>
          {optionsWithDisabled}
        </Select>
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('OPTION TWO (DISABLED)'));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('skips disabled options during keyboard navigation', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select value="1" onChange={onChange}>
          {optionsWithDisabled}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      combobox.focus();
      await user.keyboard('{ArrowDown}'); // open (highlights "1")
      await user.keyboard('{ArrowDown}'); // should skip disabled "2" and go to "3"
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: '3' },
        })
      );
    });
  });

  describe('sizes', () => {
    it('applies small size styling', () => {
      render(
        <Select size="sm" value="">
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.fontSize).toBe('var(--frigate-font-small)');
      expect(combobox.style.padding).toContain('var(--frigate-space-2)');
    });

    it('applies medium size styling (default)', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.fontSize).toBe('var(--frigate-font-body)');
      expect(combobox.style.padding).toContain('var(--frigate-space-3)');
    });

    it('applies large size styling', () => {
      render(
        <Select size="lg" value="">
          {defaultOptions}
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.fontSize).toBe('var(--frigate-font-heading)');
      expect(combobox.style.padding).toContain('var(--frigate-space-4)');
    });
  });

  describe('fullWidth', () => {
    it('applies full width when fullWidth is true', () => {
      const { container } = render(
        <Select fullWidth value="">
          {defaultOptions}
        </Select>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe('100%');
    });

    it('does not apply full width by default', () => {
      const { container } = render(<Select value="">{defaultOptions}</Select>);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).not.toBe('100%');
    });
  });

  describe('styling - design philosophy compliance', () => {
    it('has no border radius (flat design)', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.borderRadius).toBe('0');
    });

    it('uses monospace font', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.fontFamily).toBe('var(--frigate-font-mono)');
    });

    it('uses uppercase text', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.textTransform).toBe('uppercase');
    });

    it('uses theme colors for background and text', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.backgroundColor).toBe('var(--frigate-bg-surface)');
      expect(combobox.style.color).toBe('var(--frigate-text-primary)');
    });

    it('uses theme border color', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.style.border).toContain('var(--frigate-border-base)');
    });

    it('dropdown list has no border radius', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      const listbox = screen.getByRole('listbox');
      expect(listbox.style.borderRadius).toBe('0');
    });

    it('dropdown list uses theme colors', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      const listbox = screen.getByRole('listbox');
      expect(listbox.style.backgroundColor).toBe('var(--frigate-bg-surface)');
    });

    it('uses text-based dropdown indicator instead of icon', () => {
      render(<Select value="">{defaultOptions}</Select>);

      // Should use [v] text instead of SVG icon
      expect(screen.getByText('[v]')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has combobox role', () => {
      render(<Select value="">{defaultOptions}</Select>);
      expect(screen.getByRole('combobox')).toBeDefined();
    });

    it('has aria-expanded attribute', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('updates aria-expanded when opened', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      expect(combobox.getAttribute('aria-expanded')).toBe('true');
    });

    it('has aria-haspopup attribute', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('dropdown has listbox role', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('options have option role', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getAllByRole('option').length).toBe(4);
    });

    it('selected option has aria-selected true', async () => {
      const user = userEvent.setup();
      render(<Select value="2">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      const selectedOption = screen.getByRole('option', { selected: true });
      expect(selectedOption.textContent).toBe('OPTION TWO');
    });

    it('is focusable', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      expect(combobox.tabIndex).toBe(0);
    });
  });

  describe('focus behavior', () => {
    it('changes border color on focus', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      fireEvent.focus(combobox);

      expect(combobox.style.borderColor).toBe('var(--frigate-primary)');
    });

    it('resets border color on blur', () => {
      render(<Select value="">{defaultOptions}</Select>);

      const combobox = screen.getByRole('combobox');
      fireEvent.focus(combobox);
      fireEvent.blur(combobox);

      expect(combobox.style.borderColor).toBe('var(--frigate-border-base)');
    });
  });

  describe('mouse interaction', () => {
    it('highlights option on mouse enter', async () => {
      const user = userEvent.setup();
      render(<Select value="">{defaultOptions}</Select>);

      await user.click(screen.getByRole('combobox'));

      const option = screen.getByText('OPTION THREE');
      await user.hover(option);

      // The option should have raised background on hover
      expect(option.style.backgroundColor).toBe('var(--frigate-bg-raised)');
    });
  });

  describe('edge cases', () => {
    it('handles empty options', () => {
      render(<Select value="" />);

      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeDefined();
    });

    it('handles single option', async () => {
      const user = userEvent.setup();
      render(
        <Select value="only">
          <option value="only">ONLY OPTION</option>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      expect(screen.getAllByRole('option').length).toBe(1);
    });

    it('handles value not in options', () => {
      render(<Select value="nonexistent">{defaultOptions}</Select>);

      // Should fall back to first option's label
      expect(screen.getByText('SELECT OPTION')).toBeDefined();
    });
  });
});
