# Frigate

Frigate is the default frontend of **HYPERION** — a modular React application
that renders the interactive bridge interface for the HYPERION spaceship
simulation. It is built with TypeScript, Vite, and Tailwind CSS, packaged as a
pnpm monorepo with web (`@frigate/web`) and Tauri desktop (`@frigate/desktop`)
shells on top of shared UI, state, API, and utility packages.

## Repository Layout

```
apps/
  web/         # Browser shell (Vite)
  desktop/     # Tauri desktop shell
packages/
  ui/          # Reusable components + Storybook
  state/       # Zustand stores
  api-client/  # HYPERION API client + types
  utils/       # Shared helpers
docs/          # Architecture & design docs
```

See `docs/architecture.md` and `docs/design.md` for the design philosophy and
high-level architecture.

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9 (pinned via `packageManager` in `package.json`)
- **[just](https://github.com/casey/just)** — task runner for the recipes below
- **Rust toolchain** — only required when working on the Tauri desktop app

## Getting Started

```bash
just bootstrap   # install workspace dependencies
just web         # start the browser dev server
```

## Task Runner

All common workflows are exposed through the root `justfile`. Run `just`
without arguments to list every recipe.

| Recipe              | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `just bootstrap`    | Install workspace dependencies (`pnpm install`).      |
| `just lint`         | Run ESLint across every package.                      |
| `just lint-fix`     | Auto-fix lint issues where possible.                  |
| `just typecheck`    | Run the TypeScript compiler in `--noEmit` mode.       |
| `just test [ARGS]`  | Run the Vitest suites. Extra arguments are forwarded. |
| `just format`       | Format the workspace with Prettier.                   |
| `just format-check` | Verify formatting without writing changes.            |
| `just build`        | Build every package.                                  |
| `just ci`           | Full CI pipeline: lint → typecheck → test → build.    |
| `just web`          | Start the `@frigate/web` dev server.                  |
| `just desktop`      | Start the `@frigate/desktop` Tauri dev shell.         |
| `just storybook`    | Launch the `@frigate/ui` Storybook.                   |
| `just clean`        | Remove build artifacts and `node_modules`.            |

Prefer the `just` recipes over raw `pnpm` invocations so contributors and CI
stay in sync.

## License

See [`LICENSE`](./LICENSE).
