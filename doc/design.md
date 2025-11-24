# Frigate - HYPERION Frontend Design Document

**Version**: 0.1.0  
**Target Platform**: Cross-platform (Windows, macOS, Linux, Web)  
**Design Philosophy**: Hard sci-fi realism with flat, TUI-inspired interface

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Technical Architecture](#technical-architecture)
4. [User Interface Design](#user-interface-design)
5. [Screen Layouts](#screen-layouts)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Technology Stack](#technology-stack)

---

## Overview

Frigate is a cross-platform frontend client for the HYPERION spaceship bridge simulation game. It connects to the HYPERION server via REST API and WebSocket streaming to provide a realistic bridge officer experience.

### Key Features

- **Cross-Platform**: Runs on Windows, macOS, Linux, and modern web browsers
- **Server Connection**: Clean main menu for connecting to HYPERION game servers
- **Hard Sci-Fi Interface**: Realistic, terminal-inspired UI with technical jargon and dense data displays
- **Strictly Flat Design**: Zero decorative elements - no shadows, gradients, or rounded corners
- **Text-Only**: No icons or emojis, only monospace text and ASCII art borders
- **Position-Specific Views**: Each bridge position has a dedicated, purpose-built interface
- **Real-Time Updates**: WebSocket integration for live game state
- **Multi-Monitor Support**: Bridge positions can span multiple displays
- **Customizable Layouts**: Players can adjust UI elements to their preferences

### User Journey

1. **Launch Application** → Main menu with server connection
2. **Connect to Server** → Enter or select HYPERION server URL
3. **Player Selection/Registration** → Select existing player or create new player (centered modal dialog)
4. **Team Selection/Creation** → Select existing team or create new team (modal dialog)
5. **Ship Selection/Creation** → Join existing ship blueprint or create new ship (modal dialog)
6. **Ship Design Workspace** → Blueprint editor with module selection and configuration
7. **Role Assignment** → Choose bridge station(s) within selected ship
8. **Launch Mission** → Compile ship and enter bridge view
9. **Operate Bridge** → Position-specific interface for gameplay
10. **Complete Mission** → Return to lobby or disconnect

---

## Design Philosophy

Frigate follows a strict design system philosophy to ensure consistency and maintainability across the UI. The visual design is inspired by hard sci-fi aesthetics and terminal user interfaces, creating an intimidating yet functional spaceship bridge experience.

### 1. Hard Sci-Fi Realism

- **Flat, minimalistic design** - Focus on realism and functionality over decoration
- **No flashy or fantastical elements** - Think *The Expanse*, not *Star Wars*
- **Grounded in reality** - Leverage actual spaceflight and nautical terminology
- **Intimidating complexity** - Dense data visualizations and technical jargon convey depth
- **Professional interface** - Should feel like operating real equipment

### 2. Strictly Flat, Text-Based Design

- **Zero icons or emojis** - All UI elements are text-only
- **Flat rectangles** - No gradients, shadows, or rounded corners (border-radius: 0)
- **TUI/i3-inspired** - Visual style inspired by terminal UIs and minimalist window managers
- **ASCII art borders** - Use simple box-drawing characters for visual separation
- **Muted color palette** - Grays, blues, minimal use of bright colors except for alerts
- **Clear typography** - Monospace fonts for all text (data, labels, buttons)
- **Zero decorative elements** - Every pixel serves a functional purpose
- **Minimal animations** - Only when absolutely necessary for feedback
- **No box shadows** - All elements have boxShadow: 'none'

### 3. Technical Jargon and Complexity

- **Acronyms and abbreviations** - Use realistic technical terminology (e.g., "PWR", "STS", "TGT")
- **Dense information** - Pack displays with relevant data
- **Keyboard-driven** - Every action accessible via keyboard shortcuts
- **Text-only buttons** - Buttons are bracketed text labels like `[CONNECT]` or `[FIRE]`
- **Consistent interaction patterns** - Similar actions work the same way across positions

### 4. Usability and Accessibility

- **Clear visual hierarchy** - Typography (size, weight) and spacing define importance
- **High contrast** - Black backgrounds with bright text for readability
- **Accessibility** - Screen reader support, colorblind-friendly color choices
- **Responsive layouts** - Adapts to different screen sizes and resolutions

### 5. Cross-Platform Compatibility

- **Native performance** - Leverages hardware acceleration where available
- **Progressive enhancement** - Works on web, better on native
- **Consistent experience** - Same functionality across all platforms

---

## Technical Architecture

### Client-Server Communication

```
┌─────────────────┐
│  Frigate Client │
│   (Frontend)    │
└────────┬────────┘
         │
         │ REST API (Commands)
         │ WebSocket (Events)
         │
┌────────▼────────┐
│ HYPERION Server │
│    (Backend)    │
└─────────────────┘
```

### Application Structure

```
Frigate/
├── Core/
│   ├── API Client (REST + WebSocket)
│   ├── State Management
│   ├── Event Handlers
│   └── Data Models
├── UI/
│   ├── Position Views/
│   │   ├── Captain
│   │   ├── Helm
│   │   ├── Engineering
│   │   ├── Tactical (Weapons)
│   │   ├── Science
│   │   ├── Communications
│   │   └── Countermeasures
│   ├── Shared Components/
│   │   ├── Radar Display
│   │   ├── Status Panels
│   │   ├── Alert System
│   │   └── Data Grids
│   └── Lobby/
│       ├── Ship Design
│       ├── Team Management
│       └── Position Selection
└── Platform/
    ├── Desktop (Tauri/Electron)
    └── Web (WebAssembly)
```

---

## User Interface Design

### Color Palette

**Primary Colors**:
- Background: `#1a1a1a` (Dark Gray)
- Surface: `#2a2a2a` (Medium Gray)
- Primary: `#3a7ca5` (Muted Blue)
- Text: `#e0e0e0` (Light Gray)

**Functional Colors**:
- Success/Ready: `#4a9d5f` (Muted Green)
- Warning: `#d4a855` (Muted Yellow)
- Danger/Alert: `#c85450` (Muted Red)
- Info: `#5a8fbd` (Light Blue)

**Status Indicators**:
- Hull: `#4a9d5f` (Green)
- Shields: `#5a8fbd` (Blue)
- Power: `#d4a855` (Yellow)
- Weapons: `#c85450` (Red)

### Typography

**Primary Font**: "Roboto Mono" or system monospace
**Sizes**:
- Display: 24px (bold) - Ship names, major headings
- Heading: 18px (bold) - Section headers
- Body: 14px (regular) - Standard text, data displays
- Small: 12px (regular) - Labels, metadata
- Tiny: 10px (regular) - Fine print

### UI Components

#### 1. Data Display Panel

```
┌─────────────────────────────────────┐
│ HULL INTEGRITY              [87.5%] │
│ ████████████████░░░                 │
│                                     │
│ SHIELD STATUS               [42.3%] │
│ ████████░░░░░░░░░░░                 │
│                                     │
│ POWER ALLOCATION           [1245 kW]│
│ Weapons:  40% ████████░░            │
│ Shields:  30% ██████░░░░            │
│ Engines:  30% ██████░░░░            │
└─────────────────────────────────────┘
```

- Monospace font for alignment
- Progress bars for percentages
- Clear labels on left, values on right
- Muted colors (only red for critical)

#### 2. Tactical Radar Display

```
┌─────────────────────────────────────┐
│         ╔═════════════╗             │
│         ║      ↑      ║             │
│         ║   ●     ×   ║  Range: 50k │
│         ║             ║             │
│         ║      ◆      ║  Bearing: 045│
│         ╚═════════════╝             │
│                                     │
│ ● Friendly  × Hostile  ◆ Player    │
└─────────────────────────────────────┘
```

- Clean grid lines
- Distinct symbols for different entity types
- Range and bearing information
- Zoom controls

#### 3. Button Styles

All buttons use text-only labels with square brackets, no rounded corners or shadows:

**Primary Action**:
```
[FIRE WEAPONS]    ← Solid fill, primary color, no border-radius
```

**Secondary Action**:
```
[TARGET LOCK]     ← Outline only, no border-radius
```

**Danger Action**:
```
[!! EJECT CORE !!]  ← Red background, requires confirmation, no border-radius
```

**Disabled Action**:
```
[OFFLINE]         ← Muted colors, no interaction
```

#### 4. Alert System

Alerts use flat rectangular banners with text-only severity indicators:

```
╔═══════════════════════════════════╗
║ [!] WARNING: HULL BREACH DETECTED ║
║ Section 7-A, Deck 3               ║
║ [ACKNOWLEDGE]                     ║
╚═══════════════════════════════════╝
```

Severity indicators:
- **Info**: `[i]` - Informational messages
- **Success**: `[OK]` - Successful operations
- **Warning**: `[!]` - Caution required
- **Critical**: `[!!]` - Immediate attention needed

- Full-width banner at top of screen
- Color-coded by severity (no shadows or gradients)
- Clear acknowledgment required
- Dismissible after acknowledgment

---

## Screen Layouts

### 0. Main Menu (Startup Screen)

**Purpose**: Application entry point, server connection

```
┌────────────────────────────────────────────────────┐
│                                                    │
│                                                    │
│                    FRIGATE                         │
│              HYPERION Frontend v0.1.0              │
│                                                    │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ SERVER CONNECTION                          │   │
│  │                                            │   │
│  │ Server URL:                                │   │
│  │ ┌────────────────────────────────────────┐ │   │
│  │ │ http://localhost:8000                  │ │   │
│  │ └────────────────────────────────────────┘ │   │
│  │                                            │   │
│  │ [CONNECT]                                  │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  Recent Servers:                                   │
│  • http://localhost:8000                          │
│  • http://192.168.1.100:8000                      │
│                                                    │
│                                                    │
│  [SETTINGS]                          [QUIT]        │
└────────────────────────────────────────────────────┘
```

- Clean, centered layout with branding
- Simple server URL input field
- Connection status indicator
- Recent/saved servers list for quick access
- Settings button for preferences (themes, audio, etc.)
- Minimal decoration, focus on functionality

### 1. Lobby Screen (Sequential Workflow)

**Purpose**: Progressive player/team/ship selection with modal dialogs

#### 1.1 Player Selection/Registration

```
┌────────────────────────────────────────────────────┐
│ HYPERION LOBBY - PLAYER SELECTION                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  SELECT PLAYER OR CREATE NEW                       │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ EXISTING PLAYERS                             │ │
│  │                                              │ │
│  │ • ALICE_7F3A         Last active: 2d ago     │ │
│  │ • BOB_E21C           Last active: 1w ago     │ │
│  │ • CHARLIE_9B42       Last active: 3w ago     │ │
│  │                                              │ │
│  │ [SELECT]                                     │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [CREATE NEW PLAYER]                              │
│                                                    │
│  [DISCONNECT]                                      │
└────────────────────────────────────────────────────┘

// Modal for new player registration (centered):
╔════════════════════════════════════════════════════╗
║ CREATE NEW PLAYER                                  ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  PLAYER NAME:                                      ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  [CREATE]                            [CANCEL]     ║
╚════════════════════════════════════════════════════╝
```

#### 1.2 Team Selection/Creation

```
┌────────────────────────────────────────────────────┐
│ HYPERION LOBBY - TEAM SELECTION                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  PLAYER: ALICE_7F3A                      [CHANGE] │
│                                                    │
│  SELECT TEAM OR CREATE NEW                         │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ AVAILABLE TEAMS                              │ │
│  │                                              │ │
│  │ • Alpha Squad (Federation)      5/8 members  │ │
│  │ • Bravo Team (Klingon Empire)   3/8 members  │ │
│  │ • Charlie Wing (Romulan)        7/8 members  │ │
│  │                                              │ │
│  │ [JOIN SELECTED]                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [CREATE NEW TEAM]                                │
│                                                    │
│  [BACK]                              [DISCONNECT] │
└────────────────────────────────────────────────────┘

// Modal for new team creation:
╔════════════════════════════════════════════════════╗
║ CREATE NEW TEAM                                    ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  TEAM NAME:                                        ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  FACTION:                                          ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ Federation           ▼                       │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  [CREATE]                            [CANCEL]     ║
╚════════════════════════════════════════════════════╝
```

#### 1.3 Ship Selection/Creation

```
┌────────────────────────────────────────────────────┐
│ HYPERION LOBBY - SHIP SELECTION                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  PLAYER: ALICE_7F3A                      [CHANGE] │
│  TEAM:   Alpha Squad (Federation)        [CHANGE] │
│                                                    │
│  JOIN EXISTING SHIP OR CREATE NEW                  │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ TEAM SHIPS                                   │ │
│  │                                              │ │
│  │ • USS Enterprise (Battleship)    5/9 crew   │ │
│  │   Ready for design                           │ │
│  │                                              │ │
│  │ • USS Defiant (Destroyer)        8/9 crew   │ │
│  │   In mission                                 │ │
│  │                                              │ │
│  │ [JOIN SELECTED]                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [CREATE NEW SHIP]                                │
│                                                    │
│  [BACK]                              [DISCONNECT] │
└────────────────────────────────────────────────────┘

// Modal for new ship creation:
╔════════════════════════════════════════════════════╗
║ CREATE NEW SHIP                                    ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  SHIP NAME:                                        ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  SHIP CLASS:                                       ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ Battleship           ▼                       │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  [CREATE]                            [CANCEL]     ║
╚════════════════════════════════════════════════════╝
```

#### 1.4 Ship Design Workspace

```
┌────────────────────────────────────────────────────┐
│ SHIP DESIGN - USS ENTERPRISE (BATTLESHIP)          │
├────────────────────────────────────────────────────┤
│                                                    │
│  PLAYER: ALICE_7F3A                      [CHANGE] │
│  TEAM:   Alpha Squad (Federation)        [CHANGE] │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ MODULE CATALOG                               │ │
│  │                                              │ │
│  │ [POWER CORES] [ENGINES] [WEAPONS]           │ │
│  │ [SHIELDS]     [SENSORS] [SPECIAL]           │ │
│  │                                              │ │
│  │ Warp Core Mk-III          250 pts  [ADD]    │ │
│  │ Impulse Engine Array      180 pts  [ADD]    │ │
│  │ Phaser Bank Type-X        120 pts  [ADD]    │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ INSTALLED MODULES                            │ │
│  │                                              │ │
│  │ [Warp Core]     [Impulse Eng]   [Phasers]   │ │
│  │ [Shields]       [Sensors]       [Torpedoes] │ │
│  │                                              │ │
│  │ Build Points: 450 / 880                      │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ CREW ASSIGNMENTS                             │ │
│  │                                              │ │
│  │ Captain:      ALICE_7F3A            [READY] │ │
│  │ Helm:         BOB_E21C              [READY] │ │
│  │ Engineering:  (unassigned)          [JOIN]  │ │
│  │ Tactical:     (unassigned)          [JOIN]  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [BACK]                              [LAUNCH SHIP] │
└────────────────────────────────────────────────────┘
```

### 2. Captain View

**Purpose**: Command overview, strategic decision-making

```
┌────────────────────────────────────────────────────┐
│ CAPTAIN                     USS ENTERPRISE         │
├──────────────┬─────────────────────────────────────┤
│              │                                     │
│  TACTICAL    │         ╔═════════════╗            │
│  MAP         │         ║      ↑      ║            │
│              │         ║   ●     ×   ║            │
│  ┌────────┐  │         ║             ║            │
│  │        │  │         ║      ◆      ║            │
│  │   ×    │  │         ╚═════════════╝            │
│  │   ◆●   │  │                                     │
│  │        │  │  SHIP STATUS                        │
│  └────────┘  │  Hull:    87%  ████████████░░       │
│              │  Shields: 42%  ████████░░░░░░       │
│  CREW        │  Power:   Good                      │
│  STATUS      │                                     │
│              │  ACTIVE ALERTS                      │
│  Helm:    ✓  │  • Ion weapon impact - Comms jammed │
│  Eng:     ✓  │  • Hostile vessel approaching       │
│  Tactical: ⚠ │                                     │
│  Science:  ✓ │                                     │
│  Comms:    ⚠ │  ORDERS                             │
│              │  [ENGAGE]  [EVADE]  [HAIL]          │
└──────────────┴─────────────────────────────────────┘
```

### 3. Helm View

**Purpose**: Navigation, movement control

```
┌────────────────────────────────────────────────────┐
│ HELM                        USS ENTERPRISE         │
├────────────────────────────────────────────────────┤
│                                                    │
│  NAVIGATION                                        │
│  ┌────────────────────────────────────────────┐   │
│  │              ╔═════════════╗               │   │
│  │              ║      ↑      ║               │   │
│  │              ║             ║               │   │
│  │              ║      ◆      ║               │   │
│  │              ║             ║               │   │
│  │              ╚═════════════╝               │   │
│  │                                            │   │
│  │  Heading: 045°    Speed: 0.5c             │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  PROPULSION                                        │
│  ┌──────────────────┬─────────────────────────┐   │
│  │ IMPULSE          │ WARP DRIVE              │   │
│  │                  │                         │   │
│  │ Thrust: 75%      │ Status: READY           │   │
│  │ ████████░░       │ Destination: [SET]      │   │
│  │                  │                         │   │
│  │ [FULL STOP]      │ [ENGAGE] [DISENGAGE]    │   │
│  │ [EVASIVE]        │                         │   │
│  └──────────────────┴─────────────────────────┘   │
│                                                    │
│  DOCKING                                           │
│  Nearest Station: Deep Space 9 (5,000 km)         │
│  [REQUEST DOCKING]                                │
└────────────────────────────────────────────────────┘
```

### 4. Engineering View

**Purpose**: Power management, system repair

```
┌────────────────────────────────────────────────────┐
│ ENGINEERING                 USS ENTERPRISE         │
├────────────────────────────────────────────────────┤
│                                                    │
│  POWER ALLOCATION                                  │
│  ┌────────────────────────────────────────────┐   │
│  │ Total Available: 1245 kW                   │   │
│  │                                            │   │
│  │ Weapons:   500 kW [40%] ████████░░         │   │
│  │            [- 50] [+ 50]                   │   │
│  │                                            │   │
│  │ Shields:   375 kW [30%] ██████░░░░         │   │
│  │            [- 50] [+ 50]                   │   │
│  │                                            │   │
│  │ Engines:   370 kW [30%] ██████░░░░         │   │
│  │            [- 50] [+ 50]                   │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  COOLING ALLOCATION                                │
│  ┌────────────────────────────────────────────┐   │
│  │ Weapons:   [50%] █████░░░░░                │   │
│  │ Shields:   [30%] ███░░░░░░░                │   │
│  │ Engines:   [20%] ██░░░░░░░░                │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  MODULE STATUS                                     │
│  ┌────────────────────────────────────────────┐   │
│  │ Warp Core:     100% [████████████] ✓       │   │
│  │ Impulse:       100% [████████████] ✓       │   │
│  │ Phasers:        87% [██████████░░] ⚠       │   │
│  │ Torpedoes:      42% [█████░░░░░░░] [REPAIR]│   │
│  │ Shields:        93% [███████████░] ✓       │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### 5. Tactical View (Weapons)

**Purpose**: Weapon control, target management

```
┌────────────────────────────────────────────────────┐
│ TACTICAL                    USS ENTERPRISE         │
├────────────────┬───────────────────────────────────┤
│                │                                   │
│  TARGET        │  WEAPONS READY                    │
│  SELECTION     │                                   │
│                │  ┌─────────────────────────────┐  │
│  ┌──────────┐  │  │ PHASER ARRAY 1              │  │
│  │    ×     │  │  │ Power:  100%  Status: READY │  │
│  │          │  │  │ [FIRE] [AUTO-FIRE: OFF]     │  │
│  │    ◆     │  │  └─────────────────────────────┘  │
│  │          │  │                                   │
│  └──────────┘  │  ┌─────────────────────────────┐  │
│                │  │ PHOTON TORPEDOES            │  │
│  Target:       │  │ Loaded: 4/4  Status: READY  │  │
│  Romulan       │  │ [FIRE] [LOAD]               │  │
│  Warbird       │  │                             │  │
│                │  │ Fire Mode: [SINGLE] [SPREAD]│  │
│  Range: 15.2k  │  └─────────────────────────────┘  │
│  Bearing: 045° │                                   │
│                │  AMMUNITION                       │
│  Hull:    75%  │  Photon Torpedoes:    42 / 50    │
│  Shields: 50%  │  Quantum Torpedoes:   12 / 20    │
│                │                                   │
│  [LOCK TARGET] │  TARGET INFO                      │
│  [BREAK LOCK]  │  Class: D'deridex Warbird         │
│                │  Faction: Romulan Star Empire     │
│                │  Threat: HIGH                     │
└────────────────┴───────────────────────────────────┘
```

### 6. Science View

**Purpose**: Sensor analysis, scanning

```
┌────────────────────────────────────────────────────┐
│ SCIENCE                     USS ENTERPRISE         │
├────────────────────────────────────────────────────┤
│                                                    │
│  LONG-RANGE SENSORS                                │
│  ┌────────────────────────────────────────────┐   │
│  │                                            │   │
│  │         ╔═════════════════════╗            │   │
│  │         ║         ↑           ║            │   │
│  │         ║    ×         ●      ║            │   │
│  │         ║                     ║            │   │
│  │         ║           ◆         ║            │   │
│  │         ║                     ║            │   │
│  │         ╚═════════════════════╝            │   │
│  │                                            │   │
│  │  Range: 100,000 km                         │   │
│  │  [INCREASE RANGE] [DECREASE RANGE]         │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  SCAN TARGET                                       │
│  ┌────────────────────────────────────────────┐   │
│  │ Target: Romulan Warbird                    │   │
│  │                                            │   │
│  │ Scan Type: [QUICK] [DETAILED] [DEEP]       │   │
│  │ [INITIATE SCAN]                            │   │
│  │                                            │   │
│  │ SCAN RESULTS                               │   │
│  │ Class: D'deridex-class Warbird             │   │
│  │ Hull Integrity: 75%                        │   │
│  │ Shield Strength: 50%                       │   │
│  │ Weapon Systems: Disruptor Banks (4)        │   │
│  │                 Plasma Torpedoes (2)       │   │
│  │ Threat Assessment: HIGH                    │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### 7. Communications View

**Purpose**: Hailing, diplomacy, information warfare

```
┌────────────────────────────────────────────────────┐
│ COMMUNICATIONS              USS ENTERPRISE         │
├────────────────────────────────────────────────────┤
│                                                    │
│  HAILING FREQUENCIES                               │
│  ┌────────────────────────────────────────────┐   │
│  │ Available Targets:                         │   │
│  │ • Romulan Warbird (15.2k km)               │   │
│  │ • Federation Cruiser (42.7k km)            │   │
│  │ • Deep Space 9 (125k km)                   │   │
│  │                                            │   │
│  │ [HAIL SELECTED]                            │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  COMMUNICATIONS LOG                                │
│  ┌────────────────────────────────────────────┐   │
│  │ [12:34] → Romulan Warbird                  │   │
│  │ "This is the USS Enterprise. State your   │   │
│  │ intentions."                               │   │
│  │                                            │   │
│  │ [12:35] ← Romulan Warbird                  │   │
│  │ "Federation vessel, withdraw immediately  │   │
│  │ or be destroyed."                          │   │
│  │                                            │   │
│  │ [12:36] → Romulan Warbird                  │   │
│  │ "We will not withdraw. Prepare to..."     │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  COMPOSE MESSAGE                                   │
│  ┌────────────────────────────────────────────┐   │
│  │ To: Romulan Warbird                        │   │
│  │                                            │   │
│  │ ┌────────────────────────────────────────┐ │   │
│  │ │                                        │ │   │
│  │ │                                        │ │   │
│  │ └────────────────────────────────────────┘ │   │
│  │                                            │   │
│  │ Tone: [FRIENDLY] [NEUTRAL] [HOSTILE]       │   │
│  │ [SEND]                                     │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  JAMMING                                           │
│  Target: Romulan Warbird                          │
│  [JAM COMMUNICATIONS] (Requires Ion weapons)       │
└────────────────────────────────────────────────────┘
```

### 8. Countermeasures View

**Purpose**: Defensive systems, point defense

```
┌────────────────────────────────────────────────────┐
│ COUNTERMEASURES             USS ENTERPRISE         │
├────────────────────────────────────────────────────┤
│                                                    │
│  SHIELDS                                           │
│  ┌────────────────────────────────────────────┐   │
│  │ Status: RAISED                             │   │
│  │                                            │   │
│  │ Strength: 42% ████████░░░░░░░░░            │   │
│  │ Recharge: ACTIVE                           │   │
│  │                                            │   │
│  │ [RAISE SHIELDS] [LOWER SHIELDS]            │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  POINT DEFENSE                                     │
│  ┌────────────────────────────────────────────┐   │
│  │ Status: ACTIVE                             │   │
│  │                                            │   │
│  │ Incoming Threats:                          │   │
│  │ • Plasma Torpedo (3.2k km) [ENGAGING]      │   │
│  │ • Photon Torpedo (5.1k km) [TRACKING]      │   │
│  │                                            │   │
│  │ [ENABLE] [DISABLE]                         │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  COUNTERMEASURES                                   │
│  ┌────────────────────────────────────────────┐   │
│  │ CHAFF                                      │   │
│  │ Loaded: 12 / 20                            │   │
│  │ [DEPLOY] [LOAD]                            │   │
│  │                                            │   │
│  │ DECOY                                      │   │
│  │ Loaded: 4 / 10                             │   │
│  │ [DEPLOY] [LOAD]                            │   │
│  │                                            │   │
│  │ ANTIMISSILE                                │   │
│  │ Loaded: 8 / 15                             │   │
│  │ Auto-Deploy: [ON] [OFF]                    │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```