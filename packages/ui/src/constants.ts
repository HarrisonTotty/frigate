/**
 * Technical Terminology Constants
 * 
 * Standard abbreviations and technical jargon used throughout the Frigate UI
 * to maintain consistency with the hard sci-fi aesthetic.
 */

/**
 * Status & State Abbreviations
 */
export const STATUS_ABBR = {
  ACTIVE: 'ACTV',
  STANDBY: 'STBY',
  OFFLINE: 'OFFL',
  ONLINE: 'ONLN',
  READY: 'RDY',
  WAITING: 'WAIT',
  PROCESSING: 'PROC',
  COMPLETE: 'COMP',
  FAILED: 'FAIL',
  CRITICAL: 'CRIT',
  WARNING: 'WARN',
  NOMINAL: 'NOML',
  DEGRADED: 'DEGR',
} as const;

/**
 * System & Attribute Abbreviations
 */
export const SYSTEM_ABBR = {
  POWER: 'PWR',
  STATUS: 'STS',
  TARGET: 'TGT',
  RANGE: 'RNG',
  BEARING: 'BRG',
  VELOCITY: 'VEL',
  HEADING: 'HDG',
  ALTITUDE: 'ALT',
  DISTANCE: 'DIST',
  TEMPERATURE: 'TEMP',
  COOLING: 'COOL',
  SHIELDS: 'SHLD',
  HULL: 'HULL',
  ARMOR: 'ARMR',
  AMMUNITION: 'AMMO',
  WEAPON: 'WPN',
  SENSOR: 'SNSR',
  COMMUNICATION: 'COMM',
  ENGINE: 'ENG',
  REACTOR: 'RCTR',
} as const;

/**
 * Action Abbreviations
 */
export const ACTION_ABBR = {
  CONNECT: 'CONN',
  DISCONNECT: 'DISC',
  FIRE: 'FIRE',
  LOAD: 'LOAD',
  SCAN: 'SCAN',
  LOCK: 'LOCK',
  TRACK: 'TRCK',
  ENGAGE: 'ENGG',
  DISENGAGE: 'DSNGG',
  ACTIVATE: 'ACTV',
  DEACTIVATE: 'DCTV',
  REPAIR: 'REPR',
  ANALYZE: 'ANLZ',
  TRANSMIT: 'XMIT',
  RECEIVE: 'RECV',
} as const;

/**
 * Role & Position Abbreviations
 */
export const ROLE_ABBR = {
  CAPTAIN: 'CAPT',
  HELM: 'HELM',
  ENGINEERING: 'ENGR',
  TACTICAL: 'TACT',
  SCIENCE: 'SCNC',
  COMMUNICATIONS: 'COMM',
  COUNTERMEASURES: 'CNTR',
} as const;

/**
 * Threat Level Abbreviations
 */
export const THREAT_ABBR = {
  FRIENDLY: 'FRND',
  NEUTRAL: 'NEUT',
  HOSTILE: 'HSTL',
  UNKNOWN: 'UNKN',
} as const;

/**
 * Contact Type Symbols
 */
export const CONTACT_SYMBOLS = {
  FRIENDLY: '●',
  HOSTILE: '×',
  NEUTRAL: '○',
  PLAYER: '◆',
  STATION: '⬡',
} as const;

/**
 * Progress Bar Block Characters
 */
export const PROGRESS_BLOCKS = {
  FULL: '█',
  EMPTY: '░',
  PARTIAL: ['▏', '▎', '▍', '▌', '▋', '▊', '▉'],
} as const;

/**
 * Box Drawing Characters
 */
export const BOX_DRAWING = {
  // Single-line
  HORIZONTAL: '─',
  VERTICAL: '│',
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  CROSS: '┼',
  T_DOWN: '┬',
  T_UP: '┴',
  T_RIGHT: '├',
  T_LEFT: '┤',
  
  // Double-line (heavy)
  HORIZONTAL_HEAVY: '═',
  VERTICAL_HEAVY: '║',
  TOP_LEFT_HEAVY: '╔',
  TOP_RIGHT_HEAVY: '╗',
  BOTTOM_LEFT_HEAVY: '╚',
  BOTTOM_RIGHT_HEAVY: '╝',
  CROSS_HEAVY: '╬',
  T_DOWN_HEAVY: '╦',
  T_UP_HEAVY: '╩',
  T_RIGHT_HEAVY: '╠',
  T_LEFT_HEAVY: '╣',
} as const;

/**
 * Format a numeric value with appropriate unit abbreviation
 */
export function formatValue(value: number, unit: string): string {
  if (unit === 'distance') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  }
  
  if (unit === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  
  if (unit === 'power') {
    return `${value}kW`;
  }
  
  return value.toString();
}

/**
 * Generate ASCII progress bar
 */
export function generateProgressBar(value: number, max: number = 100, width: number = 20): string {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  return PROGRESS_BLOCKS.FULL.repeat(filled) + PROGRESS_BLOCKS.EMPTY.repeat(empty);
}

/**
 * Format status with abbreviation
 */
export function formatStatus(status: keyof typeof STATUS_ABBR): string {
  return `[${STATUS_ABBR[status]}]`;
}

/**
 * Format system label with abbreviation
 */
export function formatSystemLabel(system: keyof typeof SYSTEM_ABBR): string {
  return `${SYSTEM_ABBR[system]}:`;
}
