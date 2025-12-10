# Ship Stats Radar Chart - Action Plan

This document outlines the implementation plan for a radar chart (spider chart) component to be displayed in the Ship Stats Panel, providing a visual summary of ship capabilities across five axes.

---

## Overview

The radar chart will display five key ship attributes as a pentagon-shaped visualization:

| Axis | Label | Description |
|------|-------|-------------|
| **D** | Defense | HP and shield capacity relative to theoretical maximum |
| **M** | Mobility | Thrust and maneuverability relative to theoretical maximum |
| **O** | Offense | Offensive module count relative to theoretical maximum |
| **V** | Versatility | Number of unique module types installed |
| **U** | Utility | Aggregate utility from support modules |

Each axis is normalized to a 0-1 scale where 1 represents the theoretical maximum for the current ship class.

---

## Progress

- [x] **Phase 1**: RadarChart component created at `packages/ui/src/components/RadarChart.tsx`
- [x] **Phase 4.1**: Unit tests created at `packages/ui/src/components/__tests__/RadarChart.test.tsx` (18 tests passing)
- [x] **Phase 3**: RadarChart integrated into ShipStatsPanel with legend
- [x] **Phase 2**: Profile calculations implemented in ShipDesignWorkspace.tsx

### Implementation Complete

The radar chart now displays ship capability profiles based on actual module data from Hyperion:

**Profile Calculations:**
- **Defense (D)**: 40% HP bonus + 60% shield strength (max 4000)
- **Mobility (M)**: 60% max thrust (max 1800) + 40% angular thrust (max 1600)
- **Offense (O)**: Count of offense modules / 10 max slots
- **Versatility (V)**: Unique slot types installed / total available slot types
- **Utility (U)**: Weighted sum of sensors (25%), cooling (20%), power (25%), stealth (15%), warp (15%)

---

## Available Hyperion Module Data

The following variant properties are available from the Hyperion API for profile calculations:

### Defense-related
- `max_shield_strength` - Shield generators (800-4000 range)
- `shield_recharge_rate` - Shield generators (40-120 range)
- `additional_hp` - All modules

### Mobility-related
- `max_thrust` - Impulse engines (400-1800 range)
- `angular_thrust` - Maneuvering thrusters (400-1600 range)

### Utility-related
- `scan_range` - Sensor arrays (5000-30000 range)
- `comm_range` - Communications systems
- `generated_cooling` - Cooling systems (200-600 range)
- `energy_production` - Power cores (150-500 range)
- `detectability_reduction` - Stealth systems (0.25-0.90 range)
- `warp_type` - Warp cores ("warp" or "jump")

### Module slot groups (from `modules.yaml`)
- `groups: ["Offense"]` - Weapons (DE weapons, kinetic, missiles, torpedoes, radial emission)
- `groups: ["Defense"]` - Shields, armor, countermeasures
- `groups: ["Support"]` - Sensors, comms, cooling, aux support, stealth, warp

---

## Phase 1: Create RadarChart Component

### 1.1 Component Structure

Create a new component at `packages/ui/src/components/RadarChart.tsx`:

```tsx
interface RadarChartAxis {
  id: string;        // Single letter (D, M, O, V, U)
  label: string;     // Full label (Defense, Mobility, etc.)
  value: number;     // Normalized 0-1 value
}

interface RadarChartProps {
  axes: RadarChartAxis[];
  size?: number;           // Chart diameter in pixels (default: 200)
  fillColor?: string;      // Polygon fill color
  strokeColor?: string;    // Polygon stroke color
  gridColor?: string;      // Grid line color
  labelColor?: string;     // Axis label color
  gridLevels?: number;     // Number of concentric rings (default: 5)
  className?: string;
}
```

### 1.2 SVG Rendering

The component will render as an SVG with:
1. **Background grid**: Concentric pentagons at 20%, 40%, 60%, 80%, 100% levels
2. **Axis lines**: Lines from center to each vertex
3. **Data polygon**: Filled polygon connecting the data points
4. **Axis labels**: Single-letter labels (D, M, O, V, U) at each vertex

### 1.3 Coordinate Calculation

```tsx
// Calculate vertex positions for a regular pentagon
// Angle offset: -90 degrees to place first vertex (D) at top
const getVertexPosition = (index: number, radius: number, center: number) => {
  const angle = (index * 2 * Math.PI / 5) - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
};
```

### 1.4 Styling

- Match existing frigate design system using CSS variables
- Use `var(--frigate-primary)` for the data polygon
- Semi-transparent fill with solid stroke
- Grid lines in `var(--frigate-border-base)`
- Labels in `var(--frigate-text-secondary)`

### Files to Create
- `packages/ui/src/components/RadarChart.tsx`
- `packages/ui/src/components/__tests__/RadarChart.test.tsx`

### Effort: Medium

---

## Phase 2: Ship Profile Calculations

### 2.1 Extend ShipStats Interface

Update `ShipStatsPanel.tsx` to include radar chart data:

```tsx
interface ShipProfile {
  defense: number;      // 0-1
  mobility: number;     // 0-1
  offense: number;      // 0-1
  versatility: number;  // 0-1
  utility: number;      // 0-1
}

interface ShipStats {
  // ... existing fields ...
  profile?: ShipProfile;
}
```

### 2.2 Defense Calculation (D)

**Formula**: `(currentHP + currentShields) / (maxHP + maxShields)`

Where:
- `currentHP` = Ship class base_hull + sum of all module additional_hp
- `currentShields` = Sum of shield generator max_shield_strength values
- `maxHP` = Ship class base_hull + (max_modules * highest_module_hp)
- `maxShields` = max_shield_slots * highest_shield_strength

**Data sources**:
- Ship class: `base_hull`, `base_shields`, `max_modules`
- Module slots: `groups: ["Defense"]` (shield-generator, deflector-plating, countermeasure-system)
- Module variants: `additional_hp`, `max_shield_strength`

### 2.3 Mobility Calculation (M)

**Formula**: `(currentThrust + currentAngular) / (maxThrust + maxAngular)`

Where:
- `currentThrust` = Sum of impulse engine `max_thrust` values
- `currentAngular` = Sum of maneuvering thruster `angular_thrust` values
- `maxThrust` = max_impulse_slots * highest_thrust
- `maxAngular` = max_thruster_slots * highest_angular_thrust

**Data sources**:
- Module slots: `impulse-engine`, `maneuvering-thruster`
- Module variants: `max_thrust`, `angular_thrust`

### 2.4 Offense Calculation (O)

**Formula**: `offenseModulesInstalled / maxOffenseSlots`

Where:
- `offenseModulesInstalled` = Count of modules with `groups: ["Offense"]`
- `maxOffenseSlots` = Sum of `max_slots` for all offense module slot types

**Data sources**:
- Module slots: `groups: ["Offense"]` (de-weapon, kinetic-weapon, missile-launcher, torpedo-tube, radial-emission-system)
- Ship class: individual max slot counts or general `max_modules`

### 2.5 Versatility Calculation (V)

**Formula**: `uniqueModuleTypes / totalModuleSlotTypes`

Where:
- `uniqueModuleTypes` = Count of distinct `module_slot_id` values in installed modules
- `totalModuleSlotTypes` = Total number of module slot types available (18)

**Data sources**:
- Installed modules: unique `module_slot_id` values
- Module slots catalog: total count

### 2.6 Utility Calculation (U)

**Formula**: Complex weighted calculation based on utility module stats

Components:
- **Sensor range**: `currentSensorRange / maxSensorRange`
- **Comm range**: `currentCommRange / maxCommRange`
- **Cooling capacity**: `currentCooling / maxCooling`
- **Power generation**: `currentPower / maxPower`
- **Stealth**: `stealthReduction / maxStealthReduction`
- **Warp capability**: Binary (has warp drive = 0.2 bonus)

**Weighted average**:
```
utility = (
  sensorScore * 0.2 +
  commScore * 0.1 +
  coolingScore * 0.2 +
  powerScore * 0.25 +
  stealthScore * 0.15 +
  warpBonus * 0.1
)
```

**Data sources**:
- Module slots: `groups: ["Support"]`
- Module variants: `scan_range`, `comm_range`, `generated_cooling`, `energy_production`, `detectability_reduction`, `warp_type`

### Files to Modify
- `packages/ui/src/lobby/ShipStatsPanel.tsx` - Add ShipProfile interface
- `packages/ui/src/lobby/ShipDesignWorkspace.tsx` - Calculate profile values in stats useMemo

### Effort: High

---

## Phase 3: Integrate into ShipStatsPanel

### 3.1 Layout Changes

Add the radar chart below the existing stats, above the Register Schematic button:

```tsx
<div style={{ padding: 'var(--frigate-space-3)' }}>
  <RadarChart
    axes={[
      { id: 'D', label: 'Defense', value: stats.profile?.defense ?? 0 },
      { id: 'M', label: 'Mobility', value: stats.profile?.mobility ?? 0 },
      { id: 'O', label: 'Offense', value: stats.profile?.offense ?? 0 },
      { id: 'V', label: 'Versatility', value: stats.profile?.versatility ?? 0 },
      { id: 'U', label: 'Utility', value: stats.profile?.utility ?? 0 },
    ]}
    size={180}
  />
</div>
```

### 3.2 Tooltip/Legend

Add a small legend below the chart showing the full axis names:

```
D=Defense  M=Mobility  O=Offense
     V=Versatility  U=Utility
```

Or use hover tooltips on each axis label.

### 3.3 Responsive Sizing

- Use container-relative sizing when possible
- Minimum size: 140px
- Maximum size: 220px
- Center the chart horizontally in the panel

### Files to Modify
- `packages/ui/src/lobby/ShipStatsPanel.tsx`

### Effort: Low

---

## Phase 4: Testing

### 4.1 Unit Tests

**RadarChart.test.tsx**:
- Renders correct number of axis lines (5)
- Renders correct number of grid levels
- Calculates vertex positions correctly
- Handles edge cases (all zeros, all ones, partial data)
- Applies correct CSS classes and styles

**ShipStatsPanel.test.tsx**:
- Renders radar chart when profile data provided
- Handles missing profile data gracefully
- Profile values display correctly

### 4.2 Visual Testing

- Add Storybook stories for RadarChart component
- Test various data configurations
- Test different size props
- Test color customization

### Files to Create/Modify
- `packages/ui/src/components/__tests__/RadarChart.test.tsx`
- `packages/ui/src/stories/RadarChart.stories.tsx`
- `packages/ui/src/lobby/__tests__/ShipStatsPanel.test.tsx`

### Effort: Medium

---

## Implementation Order

1. **Phase 1**: Create RadarChart component (standalone, testable)
2. **Phase 4.1**: Write tests for RadarChart
3. **Phase 2**: Implement profile calculations in ShipDesignWorkspace
4. **Phase 3**: Integrate RadarChart into ShipStatsPanel
5. **Phase 4.2**: Visual testing and refinement

---

## Data Flow Summary

```
ShipDesignWorkspace.tsx
├── instances (installed modules)
├── moduleSlotsById (slot definitions)
├── variantsById (variant data)
└── shipClass (class limits)
    │
    ▼
useMemo: Calculate stats
├── existing stats (hp, power, weight, etc.)
└── NEW: profile calculation
    ├── defense: (hp + shields) / max
    ├── mobility: (thrust + angular) / max
    ├── offense: offenseCount / maxOffense
    ├── versatility: uniqueTypes / totalTypes
    └── utility: weighted utility score
    │
    ▼
ShipStatsPanel.tsx
├── existing stat displays
└── NEW: RadarChart component
    └── axes: [D, M, O, V, U] with 0-1 values
```

---

## Open Questions

1. **Ship class maximums**: Should theoretical maximums be per-ship-class or global? Per-ship-class makes more sense for balance but requires ship class data to include max slot counts.

2. **Empty state**: What should the radar chart show before any modules are installed? Options:
   - Show empty pentagon (all zeros)
   - Show baseline from ship class bonuses
   - Hide chart until first module added

3. **Animation**: Should the polygon animate when values change? Could add smooth transitions for better UX.

4. **Color coding**: Should different axes have different colors, or use a single color for the data polygon?

---

## Acceptance Criteria

- [ ] RadarChart component renders a 5-axis pentagon chart
- [ ] Chart displays D, M, O, V, U labels at each vertex
- [ ] Data polygon accurately reflects normalized 0-1 values
- [ ] Chart integrates seamlessly with ShipStatsPanel styling
- [ ] Profile calculations update reactively as modules are added/removed
- [ ] Component is accessible (appropriate ARIA labels)
- [ ] All tests pass
- [ ] Visual appearance matches frigate design system
