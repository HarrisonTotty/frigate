# Action Plan: Frigate Desktop CLI Arguments

## Overview

Add CLI arguments to the Frigate desktop app to allow users to skip the lobby wizard and connect directly to a server with pre-configured player, team, and ship settings.

## CLI Arguments

| Argument | Description |
|----------|-------------|
| `--connect <HOST>[:PORT]` | Server address (auto-prefixes `http://`, defaults port to 8000) |
| `--user <NAME>` | Player name to select/create |
| `--team <NAME>` | Team name to select/create |
| `--faction <ID>` | Faction ID for new team (required if team doesn't exist) |
| `--ship <NAME>` | Ship/blueprint name to select/create |
| `--ship-class <ID>` | Ship class for new ship (required if ship doesn't exist) |

## Architecture

```
Rust Backend (main.rs)
  │ Parse CLI args → Store in Tauri state → Expose via get_cli_args command
  │
  ▼ invoke("get_cli_args")
React Frontend (App.tsx)
  │ Fetch CLI args on mount → If --connect, show AutoSetupOverlay
  │
  ▼
useAutoSetup Hook
  │ Orchestrates: connect → find/create player → find/create team → find/create ship
  │ Updates workflow store at each step
  ▼
LobbyWorkflow (normal flow resumes at appropriate step)
```

## Files to Modify/Create

| File | Action |
|------|--------|
| `apps/desktop/src-tauri/src/main.rs` | Add CLI args, CliArgs struct, get_cli_args command |
| `apps/desktop/src/types/cli.ts` | TypeScript types for CliArgs and AutoSetupState |
| `apps/desktop/src/hooks/useAutoSetup.ts` | Auto-setup orchestration hook |
| `apps/desktop/src/components/AutoSetupOverlay.tsx` | Loading/progress UI during auto-setup |
| `apps/desktop/src/App.tsx` | Integrate useAutoSetup and AutoSetupOverlay |

## Implementation Details

### Phase 1: Rust Backend (COMPLETE)

**File: `apps/desktop/src-tauri/src/main.rs`**

- Added new CLI arguments to `Cli` struct
- Created `CliArgs` struct for JSON serialization to frontend
- Added `normalize_server_url()` function for URL handling
- Added `get_cli_args` Tauri command to expose CLI args to frontend
- Registered command and state with Tauri builder

URL normalization rules:
- `localhost` → `http://localhost:8000`
- `localhost:9000` → `http://localhost:9000`
- `https://server.com` → `https://server.com:8000`

### Phase 2: TypeScript Types (COMPLETE)

**File: `apps/desktop/src/types/cli.ts`**

- `CliArgs` interface matching Rust struct
- `AutoSetupStep` type for progress tracking
- `AutoSetupState` and `AutoSetupProgress` interfaces

### Phase 3: Auto-Setup Hook (COMPLETE)

**File: `apps/desktop/src/hooks/useAutoSetup.ts`**

Orchestrates the auto-setup flow:

1. **Connect**: Health check server via custom `checkHealth()` with retry
2. **Player**: `GET /v1/players` → find by name, else `POST /v1/players { name }`
3. **Team**: `GET /v1/teams` → find by name, else `POST /v1/teams { name, faction }`
4. **Ship**: `GET /v1/blueprints?team_id=X` → find by name, else `POST /v1/blueprints { name, ship_class, team_id }`

Updates `useLobbyWorkflowStore` at each step via `setPlayer()`, `setTeam()`, `setBlueprint()`.

Key features:
- Fetches CLI args from Rust via `invoke('get_cli_args')`
- Automatically runs setup on mount if `--connect` is provided
- Provides callbacks: `onConnect`, `onComplete`, `onError`
- Returns `continueManually()` for error recovery

### Phase 4: Auto-Setup Overlay (COMPLETE)

**File: `apps/desktop/src/components/AutoSetupOverlay.tsx`**

Terminal-style progress display:
```
INITIALIZING SESSION...
[X] Connected to localhost:8000
[X] Player selected: Harry
[~] Creating team: Red_
```

Status indicators:
- `[X]` - Complete (green)
- `[~]` - Active/In progress (white, blinking cursor)
- `[!]` - Error (red)
- `[ ]` - Pending (gray)

Includes "Continue Manually" button on error.

### Phase 5: App.tsx Integration (COMPLETE)

Modified `App.tsx` to:
1. Call `useAutoSetup` hook on mount
2. Show `AutoSetupOverlay` during auto-setup process (when step is not 'idle' or 'complete')
3. On completion, transition to connected state with workflow progressed
4. Handle "Continue Manually" to recover from errors with partial setup

```typescript
function App() {
  const { cliArgs, state: autoSetupState, hasAutoSetup, continueManually, serverUrl } = useAutoSetup({
    onConnect: (url) => { ... },
    onComplete: () => setIsConnected(true),
    onError: (error) => console.error(error),
  });

  // Show overlay during auto-setup
  if (hasAutoSetup && autoSetupState.step !== 'idle' && autoSetupState.step !== 'complete') {
    return <AutoSetupOverlay state={autoSetupState} cliArgs={cliArgs} onContinueManually={...} />;
  }
  // ... existing logic
}
```

## Error Handling

| Scenario | Error Message |
|----------|---------------|
| `--team X` without `--faction`, team doesn't exist | "Team 'X' not found. Use --faction to create it." |
| `--ship X` without `--ship-class`, ship doesn't exist | "Ship 'X' not found. Use --ship-class to create it." |
| Invalid faction ID | API error: "Faction 'Y' not found" |
| Invalid ship class | API error: "Ship class 'Z' not found" |
| Server unreachable | Retry with backoff, then show connection error |

All errors display in overlay with "Continue Manually" option.

## Testing Scenarios

```bash
# Full auto-setup (new entities)
frigate --connect localhost --user Harry --team Red --faction terran-federation --ship Enterprise --ship-class battleship

# Existing user, new team
frigate --connect localhost --user ExistingUser --team NewTeam --faction terran-federation

# Just connect with user (stop at team selection)
frigate --connect localhost --user Harry

# Connect only (auto-connect, show player selection)
frigate --connect 192.168.1.100:9000
```

## Progress

- [x] Phase 1: Rust Backend
- [x] Phase 2: TypeScript Types
- [x] Phase 3: useAutoSetup Hook
- [x] Phase 4: AutoSetupOverlay Component
- [x] Phase 5: App.tsx Integration
- [ ] Testing
