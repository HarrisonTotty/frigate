/**
 * Frigate Design System - TypeScript Theme Tokens
 * 
 * Export design tokens for use in TypeScript/React components.
 */

export const colors = {
  background: {
    base: '#1a1a1a',
    surface: '#2a2a2a',
    raised: '#333333',
    overlay: 'rgba(26, 26, 26, 0.95)',
  },
  primary: {
    default: '#3a7ca5',
    hover: '#4a8cb5',
    active: '#2a6c95',
    muted: 'rgba(58, 124, 165, 0.2)',
  },
  text: {
    primary: '#e0e0e0',
    secondary: '#a0a0a0',
    muted: '#707070',
    inverse: '#1a1a1a',
  },
  success: {
    default: '#4a9d5f',
    hover: '#5aad6f',
    muted: 'rgba(74, 157, 95, 0.2)',
  },
  warning: {
    default: '#d4a855',
    hover: '#e4b865',
    muted: 'rgba(212, 168, 85, 0.2)',
  },
  danger: {
    default: '#c85450',
    hover: '#d86460',
    muted: 'rgba(200, 84, 80, 0.2)',
  },
  info: {
    default: '#5a8fbd',
    hover: '#6a9fcd',
    muted: 'rgba(90, 143, 189, 0.2)',
  },
  status: {
    hull: '#4a9d5f',
    shields: '#5a8fbd',
    power: '#d4a855',
    weapons: '#c85450',
  },
  border: {
    base: '#404040',
    light: '#505050',
    muted: '#2a2a2a',
  },
} as const;

export const typography = {
  fontFamily: {
    mono: "'Roboto Mono', 'Courier New', monospace",
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
  },
  fontSize: {
    display: '1.5rem',    // 24px
    heading: '1.125rem',  // 18px
    body: '0.875rem',     // 14px
    small: '0.75rem',     // 12px
    tiny: '0.625rem',     // 10px
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;

export const radius = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '6px',
} as const;

export const shadow = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 2px 4px rgba(0, 0, 0, 0.4)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.5)',
  overlay: '0 8px 16px rgba(0, 0, 0, 0.6)',
} as const;

export const transition = {
  fast: '150ms ease',
  base: '250ms ease',
  slow: '350ms ease',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1920px',
} as const;

/**
 * Theme object containing all design tokens
 */
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  transition,
  zIndex,
  breakpoints,
} as const;

export type Theme = typeof theme;
export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
