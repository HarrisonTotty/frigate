# Frigate Architecture

Frigate is a multiplayer spaceship bridge simulation game client built with React and TypeScript. It serves as the frontend companion to the HYPERION backend server—a procedurally-generated space simulation where players control different positions on a spaceship bridge (Captain, Helm, Engineering, Tactical) and participate in team-based gameplay including ship design, combat, exploration, and resource management.

## Deployment Targets

Frigate operates in two deployment modes:

- **Desktop Application** (`apps/desktop`): Tauri-based cross-platform executable with native OS integration (file dialogs, CLI arguments, system logging)
- **Web Browser** (`apps/web`): Vite-based web app running in modern browsers

Both variants share the same core UI and connect to a HYPERION game server for real-time multiplayer gameplay.

## Project Structure

```
frigate/
├── apps/
│   ├── desktop/          # Tauri desktop application
│   │   ├── src/          # React/TypeScript frontend
│   │   └── src-tauri/    # Rust backend (Tauri)
│   └── web/              # Vite web application
│       └── src/          # React/TypeScript frontend
│
├── packages/
│   ├── api-client/       # HTTP/WebSocket/GraphQL API client
│   ├── state/            # Global state management (Zustand)
│   ├── ui/               # React component library & design system
│   └── utils/            # Shared utility functions
│
└── docs/                 # Documentation
```

## Package Overview

### Apps

#### `@frigate/desktop`

Cross-platform desktop executable using Tauri 2.x. Provides:

- CLI argument parsing for auto-setup (server URL, player name, team, ship)
- Native file operations via Tauri dialog plugin (schematic save/load)
- Logging bridge that forwards JavaScript console output to Rust logger
- System-level integration (close application, window management)

Entry point: `src/main.tsx` → `src/App.tsx` → `LobbyWorkflow`

#### `@frigate/web`

Browser-based deployment with simplified feature set (no native integrations). Shares the same React components as the desktop app but without Tauri-specific functionality.

Entry point: `src/main.tsx` → `src/App.tsx` → `LobbyWorkflow`

### Packages

#### `@frigate/api-client`

Typed API client for HYPERION server communication. Provides:

- **HTTP Client**: Base request handling with timeout, abort, error transformation
- **REST Client**: Resource-based endpoints for players, teams, ships, helm, engineering, communications, etc.
- **WebSocket Manager**: Real-time event subscription with auto-reconnect and exponential backoff
- **GraphQL Client**: Query/mutation support with retry logic
- **Catalog Resources**: Module slots, variants, and ammunition browsing
- **Event Parsing**: Typed event deserialization and validation via Zod schemas

Key technologies: axios, graphql-request, zod

#### `@frigate/state`

Zustand-based central state store. Manages:

- **Session**: Player ID, team ID, ship ID, roles, permissions
- **Game Entities**: Players, teams, blueprints, ships, stations (normalized by ID)
- **Real-time Data**: Helm status, engineering status, module health, docking status
- **Contacts**: Science and threat contacts from sensors
- **Communications**: Message history (200-item limit)
- **Events**: Recent game events (100-item limit)

Features optimistic updates with rollback, persistence to localStorage, and React Query integration.

#### `@frigate/ui`

React component library and design system. Includes:

- **Core Layout**: Grid, Panel, Overlay, Modal, Stack
- **Interaction**: Buttons, Badges, Progress bars, Gauges, Radar charts
- **Data Display**: DataGrid, Tabs, Accordion, Charts
- **Patterns**: CommandPalette, Keyboard shortcuts, Tooltips, Alerts
- **Lobby Workflow**: PlayerRegistration, TeamBrowser, ShipDesign, Inventory
- **Bridge Stations**: CaptainConsole, HelmConsole, EngineeringConsole, TacticalConsole
- **Module System**: ModuleSlotBrowser, ModuleVariantSelector, ModuleStatsDisplay

Uses CSS variables for theming and includes Storybook documentation.

#### `@frigate/utils`

Shared helper functions:

- `indexById()`: Transform arrays to ID-indexed maps
- `assert()`: Runtime assertion helper

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend Framework | React 18, TypeScript 5.3 |
| State Management | Zustand, Immer |
| HTTP/API | axios, graphql-request, zod |
| Real-time | WebSocket with auto-reconnect |
| Desktop | Tauri 2.x, Rust, clap |
| Build Tools | Vite, tsup, Storybook 8 |
| Styling | CSS variables, CSS modules |
| Testing | Vitest |
| Package Manager | pnpm workspaces |

## Data Flow

The architecture follows a layered, unidirectional data flow pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Components (@frigate/ui)              │
└────────────────────────────┬────────────────────────────────┘
                             │ dispatch actions
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              State Store (@frigate/state)                   │
│              Zustand + WebSocket subscription               │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
┌──────────────────────┐        ┌──────────────────────┐
│   REST/GraphQL       │        │   WebSocket Events   │
│   (request/response) │        │   (real-time push)   │
└──────────┬───────────┘        └──────────┬───────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                ┌──────────────────────┐
                │   HYPERION Server    │
                └──────────────────────┘
```

### Request Flow Example (Set Helm Thrust)

1. UI component (`HelmConsole`) calls `store.setHelmThrust(client, shipId, thrust)`
2. State action applies optimistic update (instant UI feedback)
3. API client sends REST call: `POST /v1/helm/{shipId}/thrust`
4. On success: fetch fresh status, update store
5. On error: rollback to previous state

### Real-time Event Flow Example (Ship Position Update)

1. WebSocket manager receives event from server
2. Event parser validates and deserializes the message
3. Store's `applyEvent()` updates the relevant entity
4. React components re-render with new data

## State Structure

```typescript
{
  // Session
  session: {
    playerId: string | null,
    teamId: string | null,
    shipId: string | null,
    assignedRoles: string[],
    permissions: Record<string, boolean>
  },

  // Entities (normalized, ID-keyed maps)
  players: Record<string, Player>,
  teams: Record<string, Team>,
  blueprints: Record<string, Blueprint>,
  ships: Record<string, Ship>,
  stations: Record<string, Station>,

  // Real-time Status
  connectionStatus: ConnectionStatus,
  helmStatuses: Record<shipId, HelmStatus>,
  engineeringStatuses: Record<shipId, EngineeringStatus>,
  moduleStatuses: Record<shipId, Record<moduleId, ModuleStatus>>,

  // Sensor Data
  scienceContacts: Record<string, ScienceContact>,
  threatContacts: Record<string, ThreatContact>,

  // History
  communications: CommunicationEvent[],
  recentEvents: HyperionEvent[]
}
```

## Key Architectural Patterns

### API Client Abstraction

The `HyperionApiClient` wraps multiple communication protocols:

```typescript
export class HyperionApiClient {
  public readonly rest: RestClient;
  public readonly graphql: HyperionGraphQLClient;
  public readonly websocket: WebSocketManager;
  public readonly catalog: CatalogResource;
}
```

This allows the UI to remain protocol-agnostic.

### Two-Tier Module System

Ship modules use a slot/variant architecture:

1. **ModuleSlot**: Type definition (e.g., "power-core") with base stats
2. **ModuleVariant**: Specific implementation (e.g., "mk2-fusion-reactor") with bonuses

An installed module is a `ModuleInstance = Slot + optional Variant`.

### Optimistic Updates with Rollback

State mutations follow an optimistic pattern:

1. Apply change immediately for responsive UI
2. Track pending operation via mutation counter
3. Send API request
4. On error, rollback to previous state

### Persistent Workflow State

The lobby workflow state persists to localStorage, enabling auto-resume:

- On reconnect, the app validates that previous selections still exist on the server
- Invalid selections are cleared; valid ones restore the user's position in the workflow

### Event Subscription with Filtering

WebSocket subscriptions can filter events server-side:

```typescript
websocket.subscribe(
  (event) => store.applyEvent(event),
  { shipId: "...", teamId: "..." }
)
```

## Lobby Workflow

The lobby workflow guides players from connection to gameplay:

```
PlayerSelection → TeamSelection → ShipSelection → ShipDesign → Inventory → Bridge
```

Each step validates the previous selection and persists progress to localStorage.

## Bridge Stations

Once in-game, players access role-specific consoles:

- **Captain**: Command overview, crew management, strategic decisions
- **Helm**: Navigation, thrust control, course plotting
- **Engineering**: Power distribution, module management, damage control
- **Tactical**: Weapons, shields, threat assessment

Each console connects to the shared state store and receives real-time updates via WebSocket.
