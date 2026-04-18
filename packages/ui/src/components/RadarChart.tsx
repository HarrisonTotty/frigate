import React from "react";

/**
 * Represents a single axis on the radar chart
 */
export interface RadarChartAxis {
  /** Single letter identifier (e.g., D, M, O, V, U) */
  id: string;
  /** Full label for tooltip/legend (e.g., Defense, Mobility) */
  label: string;
  /** Normalized value between 0 and 1 */
  value: number;
}

/**
 * RadarChart Component Props
 */
export interface RadarChartProps {
  /** Array of axes to display (typically 5 for a pentagon) */
  axes: RadarChartAxis[];
  /** Chart diameter in pixels (default: 200) */
  size?: number;
  /** Polygon fill color */
  fillColor?: string;
  /** Polygon stroke color */
  strokeColor?: string;
  /** Grid line color */
  gridColor?: string;
  /** Axis label color */
  labelColor?: string;
  /** Number of concentric rings (default: 5) */
  gridLevels?: number;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Calculate vertex position for a regular polygon
 * Angle offset: -90 degrees to place first vertex at top
 */
function getVertexPosition(
  index: number,
  numVertices: number,
  radius: number,
  center: number
): { x: number; y: number } {
  const angle = (index * 2 * Math.PI) / numVertices - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

/**
 * Generate polygon points string for SVG
 */
function generatePolygonPoints(
  values: number[],
  numVertices: number,
  maxRadius: number,
  center: number
): string {
  return values
    .map((value, index) => {
      const radius = maxRadius * Math.max(0, Math.min(1, value));
      const pos = getVertexPosition(index, numVertices, radius, center);
      return `${pos.x},${pos.y}`;
    })
    .join(" ");
}

/**
 * RadarChart Component
 *
 * A radar chart (spider chart) for visualizing multi-dimensional data.
 * Each axis radiates from a center point, with values plotted as a polygon.
 */
export function RadarChart({
  axes,
  size = 200,
  fillColor = "var(--frigate-primary)",
  strokeColor = "var(--frigate-primary)",
  gridColor = "var(--frigate-border-base)",
  labelColor = "var(--frigate-text-secondary)",
  gridLevels = 5,
  className,
}: RadarChartProps) {
  const center = size / 2;
  const maxRadius = size / 2 - 24; // Leave space for labels
  const numVertices = axes.length;

  // Generate grid levels (concentric polygons)
  const gridPolygons = Array.from({ length: gridLevels }, (_, level) => {
    const levelRadius = (maxRadius * (level + 1)) / gridLevels;
    const points = Array.from({ length: numVertices }, (_, i) => {
      const pos = getVertexPosition(i, numVertices, levelRadius, center);
      return `${pos.x},${pos.y}`;
    }).join(" ");
    return points;
  });

  // Generate axis lines
  const axisLines = axes.map((_, index) => {
    const pos = getVertexPosition(index, numVertices, maxRadius, center);
    return { x1: center, y1: center, x2: pos.x, y2: pos.y };
  });

  // Generate data polygon
  const dataPoints = generatePolygonPoints(
    axes.map((a) => a.value),
    numVertices,
    maxRadius,
    center
  );

  // Label positions (slightly outside the chart)
  const labelRadius = maxRadius + 16;
  const labelPositions = axes.map((axis, index) => {
    const pos = getVertexPosition(index, numVertices, labelRadius, center);
    return { ...pos, ...axis };
  });

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "var(--frigate-font-mono)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Ship capability radar chart"
      >
        {/* Grid polygons */}
        {gridPolygons.map((points, level) => (
          <polygon
            key={`grid-${level}`}
            points={points}
            fill="none"
            stroke={gridColor}
            strokeWidth={level === gridLevels - 1 ? 1 : 0.5}
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, index) => (
          <line
            key={`axis-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={gridColor}
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill={fillColor}
          fillOpacity={0.25}
          stroke={strokeColor}
          strokeWidth={2}
        />

        {/* Data points */}
        {axes.map((axis, index) => {
          const radius = maxRadius * Math.max(0, Math.min(1, axis.value));
          const pos = getVertexPosition(index, numVertices, radius, center);
          return <circle key={`point-${index}`} cx={pos.x} cy={pos.y} r={3} fill={strokeColor} />;
        })}

        {/* Axis labels */}
        {labelPositions.map((label, index) => (
          <text
            key={`label-${index}`}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={labelColor}
            fontSize="var(--frigate-font-small)"
            fontWeight={700}
            fontFamily="var(--frigate-font-mono)"
          >
            <title>{label.label}</title>
            {label.id}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default RadarChart;
