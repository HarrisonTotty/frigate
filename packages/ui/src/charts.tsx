import React from 'react';
import clsx from 'clsx';
import { CONTACT_SYMBOLS, formatValue } from './constants';

/**
 * RadarChart Component
 * 
 * Minimalist tactical radar display with ASCII grid overlay.
 * Technical aesthetic with precise coordinate system.
 */
export interface RadarContact {
  id: string;
  x: number; // -1 to 1 (normalized coordinates)
  y: number; // -1 to 1 (normalized coordinates)
  type?: 'friendly' | 'hostile' | 'neutral' | 'unknown';
  label?: string;
}

export interface RadarChartProps {
  /** Contacts to display on radar */
  contacts: RadarContact[];
  /** Radar range (in kilometers) */
  range: number;
  /** Show range rings */
  showRings?: boolean;
  /** Number of range rings */
  ringCount?: number;
  /** Contact click handler */
  onContactClick?: (contact: RadarContact) => void;
  /** Size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

export function RadarChart({
  contacts,
  range,
  showRings = true,
  ringCount = 4,
  onContactClick,
  size = 300,
  className,
}: RadarChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 30;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--frigate-bg-base')
      .trim();
    ctx.fillRect(0, 0, size, size);

    // Draw border frame
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--frigate-border-base')
      .trim();
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // Draw range rings (minimal, technical)
    if (showRings) {
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--frigate-border-muted')
        .trim();
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]); // Dashed lines for grid

      for (let i = 1; i <= ringCount; i++) {
        const ringRadius = (radius / ringCount) * i;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]); // Reset dash

      // Draw range labels with technical formatting
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--frigate-text-tertiary')
        .trim();
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      
      for (let i = 1; i <= ringCount; i++) {
        const ringRadius = (radius / ringCount) * i;
        const rangeKm = (range / ringCount) * i;
        ctx.fillText(`${rangeKm.toFixed(1)}k`, centerX + ringRadius - 5, centerY - 5);
      }
    }

    // Draw crosshairs (minimal, precise)
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--frigate-border-light')
      .trim();
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    // Horizontal
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Draw cardinal direction markers
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--frigate-text-secondary')
      .trim();
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX, centerY - radius - 8);
    ctx.fillText('S', centerX, centerY + radius + 15);
    ctx.textAlign = 'right';
    ctx.fillText('W', centerX - radius - 8, centerY + 4);
    ctx.textAlign = 'left';
    ctx.fillText('E', centerX + radius + 8, centerY + 4);

    // Draw contacts with symbols
    const colorMap = {
      friendly: getComputedStyle(document.documentElement).getPropertyValue('--frigate-success').trim(),
      hostile: getComputedStyle(document.documentElement).getPropertyValue('--frigate-danger').trim(),
      neutral: getComputedStyle(document.documentElement).getPropertyValue('--frigate-warning').trim(),
      unknown: getComputedStyle(document.documentElement).getPropertyValue('--frigate-text-secondary').trim(),
    };

    const symbolMap = {
      friendly: CONTACT_SYMBOLS.FRIENDLY,
      hostile: CONTACT_SYMBOLS.HOSTILE,
      neutral: CONTACT_SYMBOLS.NEUTRAL,
      unknown: '?',
    };

    contacts.forEach((contact) => {
      const x = centerX + contact.x * radius;
      const y = centerY - contact.y * radius; // Invert Y for screen coordinates

      ctx.fillStyle = colorMap[contact.type || 'unknown'];
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(symbolMap[contact.type || 'unknown'], x, y + 4);

      if (contact.label) {
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(contact.label, x + 8, y + 4);
      }
    });

    // Draw center marker (own ship)
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--frigate-primary')
      .trim();
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(CONTACT_SYMBOLS.PLAYER, centerX, centerY + 5);
  }, [contacts, range, showRings, ringCount, size]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onContactClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 30;

    // Find clicked contact
    for (const contact of contacts) {
      const contactX = centerX + contact.x * radius;
      const contactY = centerY - contact.y * radius;

      const distance = Math.sqrt(Math.pow(x - contactX, 2) + Math.pow(y - contactY, 2));
      if (distance < 10) {
        onContactClick(contact);
        break;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={clsx('frigate-radar', className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: onContactClick ? 'pointer' : 'default',
        backgroundColor: 'var(--frigate-bg-base)',
      }}
      onClick={handleCanvasClick}
    />
  );
}

/**
 * BarChart Component
 * 
 * Minimal bar chart with technical labels and precise values.
 * No rounded corners, uses flat rectangles and monospace typography.
 */
export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  /** Maximum value for scaling */
  max?: number;
  /** Show value labels */
  showValues?: boolean;
  /** Chart height in pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

export function BarChart({ data, max, showValues = true, height = 200, className }: BarChartProps) {
  const maxValue = max || Math.max(...data.map((d) => d.value));

  return (
    <div className={clsx('frigate-bar-chart', className)}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1px',
          height: `${height}px`,
          borderBottom: '1px solid var(--frigate-border-base)',
          backgroundColor: 'var(--frigate-bg-base)',
        }}
      >
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 20) : 0;
          const color = item.color || 'var(--frigate-primary)';

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '40px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  borderRadius: 0,
                  transition: 'height 100ms ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: barHeight > 18 ? '4px' : '0',
                  border: `1px solid ${color}`,
                  boxSizing: 'border-box',
                }}
              >
                {showValues && barHeight > 18 && (
                  <span
                    style={{
                      fontSize: 'var(--frigate-font-tiny)',
                      fontFamily: 'var(--frigate-font-mono)',
                      color: 'var(--frigate-text-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {item.value}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 'var(--frigate-font-tiny)',
                  fontFamily: 'var(--frigate-font-mono)',
                  color: 'var(--frigate-text-secondary)',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * LineChart Component
 * 
 * Minimal time-series line chart with technical grid overlay.
 * Flat design, precise rendering, no gradients.
 */
export interface LineChartProps {
  /** Data points (array of values) */
  data: number[];
  /** Line color */
  color?: string;
  /** Chart height in pixels */
  height?: number;
  /** Chart width in pixels */
  width?: number;
  /** Show data points */
  showPoints?: boolean;
  /** Fill area under line */
  filled?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function LineChart({
  data,
  color = 'var(--frigate-primary)',
  height = 100,
  width = 300,
  showPoints = false,
  filled = false,
  showGrid = true,
  className,
}: LineChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Draw border frame
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--frigate-border-base')
      .trim();
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Draw grid lines
    if (showGrid) {
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--frigate-border-muted')
        .trim();
      ctx.lineWidth = 1;
      ctx.setLineDash([1, 2]);

      // Horizontal grid lines (4 lines)
      for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines (5 lines)
      for (let i = 1; i < 5; i++) {
        const x = (width / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    if (data.length === 0) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const stepX = width / (data.length - 1 || 1);
    const padding = 5;

    // Draw filled area
    if (filled) {
      const resolvedColor = getComputedStyle(document.documentElement)
        .getPropertyValue(color.startsWith('var') ? color.slice(4, -1) : color)
        .trim();
      
      ctx.fillStyle = resolvedColor.includes('rgb') 
        ? resolvedColor.replace(')', ', 0.15)').replace('rgb', 'rgba')
        : resolvedColor + '26'; // Add alpha as hex
      
      ctx.beginPath();
      ctx.moveTo(0, height);
      data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }

    // Draw line
    const lineColor = getComputedStyle(document.documentElement)
      .getPropertyValue(color.startsWith('var') ? color.slice(4, -1) : color)
      .trim() || color;
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    if (showPoints) {
      ctx.fillStyle = lineColor;
      data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [data, color, height, width, showPoints, filled, showGrid]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx('frigate-line-chart', className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'var(--frigate-bg-base)',
      }}
    />
  );
}
